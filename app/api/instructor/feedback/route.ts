import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { instructorId, studentId, testResultId, feedbackText, needsReassessment } = await request.json()

    if (!instructorId || !studentId || !feedbackText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify instructor role
    const instructor = await sql`
      SELECT role FROM users WHERE id = ${instructorId}
    `

    if (!instructor[0] || instructor[0].role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Insert feedback
    const result = await sql`
      INSERT INTO student_feedback (
        student_id,
        instructor_id,
        test_result_id,
        feedback_text,
        needs_reassessment
      ) VALUES (
        ${studentId},
        ${instructorId},
        ${testResultId || null},
        ${feedbackText},
        ${needsReassessment || false}
      )
      RETURNING id
    `

    return NextResponse.json({ success: true, feedbackId: result[0].id })
  } catch (error) {
    console.error("[v0] Error adding feedback:", error)
    return NextResponse.json({ error: "Failed to add feedback" }, { status: 500 })
  }
}
