import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { hashPassword } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student'
    `

    await sql`
      CREATE TABLE IF NOT EXISTS student_feedback (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        test_result_id INTEGER REFERENCES test_results(id) ON DELETE CASCADE,
        feedback_text TEXT NOT NULL,
        needs_reassessment BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_feedback_student ON student_feedback(student_id)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_feedback_instructor ON student_feedback(instructor_id)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
    `

    // Check if instructor already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = 'instructor@isc2prep.com'
    `

    if (existing.length > 0) {
      return NextResponse.json({ message: "Instructor account already exists" }, { status: 200 })
    }

    // Create instructor account with properly hashed password
    const hashedPassword = await hashPassword("Instructor123!")

    await sql`
      INSERT INTO users (fullname, email, password_hash, role)
      VALUES ('Instructor Admin', 'instructor@isc2prep.com', ${hashedPassword}, 'instructor')
    `

    return NextResponse.json({ message: "Instructor account created successfully" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Setup instructor error:", error)
    return NextResponse.json({ error: "Failed to create instructor account" }, { status: 500 })
  }
}
