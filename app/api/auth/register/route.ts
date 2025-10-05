import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { fullname, email, password } = await request.json()

    // Validate input
    if (!fullname || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (fullname, email, password_hash, role)
      VALUES (${fullname}, ${email}, ${passwordHash}, 'student')
      RETURNING id, fullname, email, role
    `

    return NextResponse.json({
      success: true,
      user: result[0],
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Failed to register" }, { status: 500 })
  }
}
