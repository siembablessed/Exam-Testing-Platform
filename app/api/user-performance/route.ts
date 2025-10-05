import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, fullname } = body

    let user

    if (userId) {
      // Authenticated user lookup
      user = await sql`
        SELECT id, fullname FROM users WHERE id = ${userId}
      `
    } else if (fullname) {
      // Legacy fullname lookup
      user = await sql`
        SELECT id, fullname FROM users WHERE LOWER(fullname) = LOWER(${fullname})
      `
    } else {
      return NextResponse.json({ error: "User ID or fullname required" }, { status: 400 })
    }

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userRecord = user[0]

    // Get all test results
    const results = await sql`
      SELECT 
        id,
        score,
        total_questions,
        percentage,
        time_taken,
        completed_at
      FROM test_results
      WHERE user_id = ${userRecord.id}
      ORDER BY completed_at DESC
    `

    // Get performance by domain
    const domainPerformance = await sql`
      SELECT 
        q.domain,
        COUNT(*) as total_questions,
        SUM(CASE WHEN ta.is_correct THEN 1 ELSE 0 END) as correct_answers,
        ROUND(
          (SUM(CASE WHEN ta.is_correct THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100,
          2
        ) as percentage
      FROM test_answers ta
      JOIN questions q ON ta.question_id = q.id
      JOIN test_results tr ON ta.test_result_id = tr.id
      WHERE tr.user_id = ${userRecord.id}
      GROUP BY q.domain
      ORDER BY percentage DESC
    `

    const feedback = await sql`
      SELECT 
        sf.id,
        sf.feedback_text,
        sf.needs_reassessment,
        sf.created_at,
        u.email as instructor_email
      FROM student_feedback sf
      JOIN users u ON sf.instructor_id = u.id
      WHERE sf.student_id = ${userRecord.id}
      ORDER BY sf.created_at DESC
    `

    // Calculate overall stats
    const totalTests = results.length
    const avgScore =
      results.length > 0 ? results.reduce((sum, r) => sum + Number.parseFloat(r.percentage), 0) / results.length : 0

    return NextResponse.json({
      fullname: userRecord.fullname,
      totalTests,
      avgScore: avgScore.toFixed(2),
      results,
      domainPerformance,
      feedback,
    })
  } catch (error) {
    console.error("[v0] Error fetching user performance:", error)
    return NextResponse.json({ error: "Failed to fetch performance" }, { status: 500 })
  }
}
