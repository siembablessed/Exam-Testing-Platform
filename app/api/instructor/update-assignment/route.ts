import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: Request) {
  try {
    const { assignmentId, status, completedAt } = await request.json()

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE exam_assignments
      SET 
        status = ${status},
        completed_at = ${completedAt || null}
      WHERE id = ${assignmentId}
      RETURNING *
    `

    return NextResponse.json({ success: true, assignment: result[0] })
  } catch (error) {
    console.error("[v0] Error updating assignment:", error)
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get("assignmentId")

    if (!assignmentId) {
      return NextResponse.json({ error: "Assignment ID required" }, { status: 400 })
    }

    await sql`
      DELETE FROM exam_assignments
      WHERE id = ${assignmentId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting assignment:", error)
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 })
  }
}
