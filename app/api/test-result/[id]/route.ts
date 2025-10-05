import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const testResultId = Number.parseInt(id)

    // Get test result
    const result = await sql`
      SELECT tr.*, u.fullname
      FROM test_results tr
      JOIN users u ON tr.user_id = u.id
      WHERE tr.id = ${testResultId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Test result not found" }, { status: 404 })
    }

    // Get all answers with question details
    const answers = await sql`
      SELECT 
        ta.user_answer,
        ta.is_correct,
        q.id as question_id,
        q.question_text,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_answer,
        q.explanation,
        q.domain
      FROM test_answers ta
      JOIN questions q ON ta.question_id = q.id
      WHERE ta.test_result_id = ${testResultId}
      ORDER BY q.id
    `

    return NextResponse.json({
      result: result[0],
      answers,
    })
  } catch (error) {
    console.error("[v0] Error fetching test result:", error)
    return NextResponse.json({ error: "Failed to fetch test result" }, { status: 500 })
  }
}
