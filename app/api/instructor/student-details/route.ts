import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get("instructorId")
    const studentId = searchParams.get("studentId")

    if (!instructorId || !studentId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verify instructor role
    const instructor = await sql`
      SELECT role FROM users WHERE id = ${instructorId}
    `

    if (!instructor[0] || instructor[0].role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get student info
    const student = await sql`
      SELECT id, fullname, email, created_at
      FROM users
      WHERE id = ${studentId}
    `

    if (!student[0]) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get all test results
    const testResults = await sql`
      SELECT 
        id,
        score,
        total_questions,
        time_taken,
        completed_at
      FROM test_results
      WHERE user_id = ${studentId}
      ORDER BY completed_at DESC
    `

    // Get domain performance
    const domainPerformance = await sql`
      SELECT 
        q.domain,
        COUNT(*) as total_questions,
        SUM(CASE WHEN ta.user_answer = q.correct_answer THEN 1 ELSE 0 END) as correct_answers,
        ROUND(
          (SUM(CASE WHEN ta.user_answer = q.correct_answer THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100,
          2
        ) as accuracy
      FROM test_answers ta
      JOIN questions q ON ta.question_id = q.id
      JOIN test_results tr ON ta.test_result_id = tr.id
      WHERE tr.user_id = ${studentId}
      GROUP BY q.domain
      ORDER BY accuracy DESC
    `

    // Get feedback history
    const feedback = await sql`
      SELECT 
        sf.id,
        sf.feedback_text,
        sf.needs_reassessment,
        sf.created_at,
        u.fullname as instructor_name,
        tr.score as test_score
      FROM student_feedback sf
      JOIN users u ON sf.instructor_id = u.id
      LEFT JOIN test_results tr ON sf.test_result_id = tr.id
      WHERE sf.student_id = ${studentId}
      ORDER BY sf.created_at DESC
    `

    return NextResponse.json({
      student: student[0],
      testResults,
      domainPerformance,
      feedback,
    })
  } catch (error) {
    console.error("[v0] Error fetching student details:", error)
    return NextResponse.json({ error: "Failed to fetch student details" }, { status: 500 })
  }
}
