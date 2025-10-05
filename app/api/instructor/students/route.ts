import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get("instructorId")

    if (!instructorId) {
      return NextResponse.json({ error: "Instructor ID required" }, { status: 400 })
    }

    // Verify instructor role
    const instructor = await sql`
      SELECT role FROM users WHERE id = ${instructorId}
    `

    if (!instructor[0] || instructor[0].role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all students with their test statistics
    const students = await sql`
      SELECT 
        u.id,
        u.fullname,
        u.email,
        u.created_at,
        COUNT(DISTINCT tr.id) as total_tests,
        ROUND(AVG(tr.score)::numeric, 2) as avg_score,
        MAX(tr.score) as best_score,
        MIN(tr.score) as lowest_score,
        MAX(tr.completed_at) as last_test_date,
        COALESCE(
          (SELECT needs_reassessment 
           FROM student_feedback 
           WHERE student_id = u.id 
           ORDER BY created_at DESC 
           LIMIT 1), 
          false
        ) as needs_reassessment
      FROM users u
      LEFT JOIN test_results tr ON u.id = tr.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.fullname, u.email, u.created_at
      ORDER BY u.fullname ASC
    `

    return NextResponse.json({ students })
  } catch (error) {
    console.error("[v0] Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}
