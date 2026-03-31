import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const SESSION_COOKIE = "marketplace_session"

function getSQL() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }
  return neon(databaseUrl)
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE)

    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null })
    }

    const [userId] = sessionCookie.value.split(":")
    if (!userId) {
      return NextResponse.json({ user: null })
    }

    const sql = getSQL()
    const users = await sql`
      SELECT id, email, full_name, role FROM users WHERE id = ${parseInt(userId, 10)}
    `

    if (users.length === 0) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user: users[0] })
  } catch {
    return NextResponse.json({ user: null })
  }
}
