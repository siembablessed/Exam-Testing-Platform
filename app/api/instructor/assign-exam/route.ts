import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { instructorId, studentIds, examName, description, totalQuestions, passingScore, dueDate } =
      await request.json()

    if (!instructorId || !studentIds || !examName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify instructor role
    const instructor = await sql`
      SELECT role FROM users WHERE id = ${instructorId}
    `

    if (!instructor[0] || instructor[0].role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Insert assignments for each student
    const assignments = []
    for (const studentId of studentIds) {
      const result = await sql`
        INSERT INTO exam_assignments (
          instructor_id, 
          student_id, 
          exam_name, 
          description, 
          total_questions, 
          passing_score, 
          due_date
        )
        VALUES (
          ${instructorId},
          ${studentId},
          ${examName},
          ${description || null},
          ${totalQuestions || 100},
          ${passingScore || 70},
          ${dueDate || null}
        )
        RETURNING *
      `
      assignments.push(result[0])
    }

    return NextResponse.json({ success: true, assignments })
  } catch (error) {
    console.error("[v0] Error assigning exam:", error)
    return NextResponse.json({ error: "Failed to assign exam" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get("instructorId")
    const studentId = searchParams.get("studentId")

    if (!instructorId && !studentId) {
      return NextResponse.json({ error: "Instructor ID or Student ID required" }, { status: 400 })
    }

    let assignments
    if (studentId) {
      // Get assignments for a specific student
      assignments = await sql`
        SELECT 
          ea.*,
          u.fullname as instructor_name,
          u.email as instructor_email
        FROM exam_assignments ea
        JOIN users u ON ea.instructor_id = u.id
        WHERE ea.student_id = ${studentId}
        ORDER BY 
          CASE 
            WHEN ea.status = 'pending' THEN 1
            WHEN ea.status = 'in_progress' THEN 2
            WHEN ea.status = 'overdue' THEN 3
            ELSE 4
          END,
          ea.due_date ASC NULLS LAST,
          ea.created_at DESC
      `
    } else {
      // Get all assignments for an instructor
      assignments = await sql`
        SELECT 
          ea.*,
          u.fullname as student_name,
          u.email as student_email
        FROM exam_assignments ea
        JOIN users u ON ea.student_id = u.id
        WHERE ea.instructor_id = ${instructorId}
        ORDER BY ea.created_at DESC
      `
    }

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error("[v0] Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}
