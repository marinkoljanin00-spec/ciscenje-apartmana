import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function getSQL() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }
  return neon(databaseUrl)
}

// Get user profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 400 })
    }

    const sql = getSQL()
    const parsedUserId = parseInt(userId, 10)

    const users = await sql`
      SELECT id, email, full_name, phone, gender, description, role, 
             rating, client_rating, created_at
      FROM users 
      WHERE id = ${parsedUserId}
    `

    if (users.length === 0) {
      return NextResponse.json({ user: null }, { status: 404 })
    }

    // Get completed jobs count (applications with status='accepted')
    const completedJobsResult = await sql`
      SELECT COUNT(*)::int as count
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.cleaner_id = ${parsedUserId} 
      AND a.status = 'accepted'
      AND j.status IN ('completed', 'reviewed')
    `
    const completed_jobs = completedJobsResult[0]?.count || 0

    return NextResponse.json({ 
      user: {
        ...users[0],
        completed_jobs
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Update user profile
export async function POST(request: Request) {
  try {
    const { userId, phone, gender, description } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 })
    }

    const sql = getSQL()
    await sql`
      UPDATE users 
      SET phone = ${phone || null}, gender = ${gender || null}, description = ${description || null}
      WHERE id = ${parseInt(userId, 10)}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
