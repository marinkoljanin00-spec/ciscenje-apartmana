import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const SESSION_COOKIE = "marketplace_session"
const REQUIRED_SESSION_VERSION = "v2"

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
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Check session version
    const parts = sessionCookie.value.split(":")
    const version = parts[2]
    if (version !== REQUIRED_SESSION_VERSION) {
      const response = NextResponse.json({ user: null, forceLogout: true })
      response.cookies.delete(SESSION_COOKIE)
      return response
    }

    const [userId] = parts
    if (!userId) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const sql = getSQL()
    const users = await sql`
      SELECT id, email, full_name, role, email_verified FROM users WHERE id = ${parseInt(userId, 10)}
    `

    if (users.length === 0) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user: users[0] })
  } catch {
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
