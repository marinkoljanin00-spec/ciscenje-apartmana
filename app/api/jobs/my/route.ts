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

// Get cleaner's accepted jobs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ jobs: [] })
    }

    const sql = getSQL()
    const jobs = await sql`
      SELECT id, title, location, price, status, created_at
      FROM jobs 
      WHERE cleaner_id = ${parseInt(userId, 10)}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ jobs })
  } catch {
    return NextResponse.json({ jobs: [] })
  }
}
