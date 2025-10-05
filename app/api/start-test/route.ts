import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, fullname } = body

    let userIdToUse: number
    let usernameToReturn: string

    if (userId) {
      // Authenticated user
      const user = await sql`
        SELECT id, fullname FROM users WHERE id = ${userId}
      `

      if (user.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      userIdToUse = user[0].id
      usernameToReturn = user[0].fullname
    } else if (fullname && fullname.trim().length > 0) {
      // Guest user - create or get user by fullname
      const existingUser = await sql`
        SELECT id FROM users WHERE LOWER(fullname) = LOWER(${fullname.trim()})
      `

      if (existingUser.length > 0) {
        userIdToUse = existingUser[0].id
      } else {
        const newUser = await sql`
          INSERT INTO users (fullname)
          VALUES (${fullname.trim()})
          RETURNING id
        `
        userIdToUse = newUser[0].id
      }

      usernameToReturn = fullname.trim()
    } else {
      return NextResponse.json({ error: "User ID or full name is required" }, { status: 400 })
    }

    // Get 100 random questions
    const questions = await sql`
      SELECT id, question_text, option_a, option_b, option_c, option_d, domain
      FROM questions
      ORDER BY RANDOM()
      LIMIT 100
    `

    return NextResponse.json({
      userId: userIdToUse,
      fullname: usernameToReturn,
      questions,
    })
  } catch (error) {
    console.error("[v0] Error starting test:", error)
    return NextResponse.json({ error: "Failed to start test" }, { status: 500 })
  }
}
