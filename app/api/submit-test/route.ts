import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, answers, timeTaken } = await request.json()

    // Calculate score
    let correctCount = 0
    const answerDetails = []

    for (const answer of answers) {
      const question = await sql`
        SELECT correct_answer FROM questions WHERE id = ${answer.questionId}
      `

      const isCorrect = question[0].correct_answer === answer.userAnswer
      if (isCorrect) correctCount++

      answerDetails.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        isCorrect,
      })
    }

    const totalQuestions = 100
    const percentage = (correctCount / totalQuestions) * 100

    // Save test result
    const result = await sql`
      INSERT INTO test_results (user_id, score, total_questions, percentage, time_taken)
      VALUES (${userId}, ${correctCount}, ${totalQuestions}, ${percentage}, ${timeTaken})
      RETURNING id
    `

    const testResultId = result[0].id

    // Save individual answers
    for (const detail of answerDetails) {
      await sql`
        INSERT INTO test_answers (test_result_id, question_id, user_answer, is_correct)
        VALUES (${testResultId}, ${detail.questionId}, ${detail.userAnswer}, ${detail.isCorrect})
      `
    }

    return NextResponse.json({
      testResultId,
      score: correctCount,
      totalQuestions,
      percentage: percentage.toFixed(2),
    })
  } catch (error) {
    console.error("[v0] Error submitting test:", error)
    return NextResponse.json({ error: "Failed to submit test" }, { status: 500 })
  }
}
