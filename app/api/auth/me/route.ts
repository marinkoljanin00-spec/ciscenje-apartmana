import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const SESSION_COOKIE = "marketplace_session"

function getSQL() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }
  return neon(databaseUrl)
}

export async function GET(request: Request) {
  try {
    // Debug: log all cookies from request headers
    const cookieHeader = request.headers.get("cookie")
    console.log("[v0] ME: Cookie header:", cookieHeader)
    
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE)
    console.log("[v0] ME: Session cookie value:", sessionCookie?.value || "NONE")

    if (!sessionCookie?.value) {
      console.log("[v0] ME: No session cookie found")
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
      console.log("[v0] ME: User not found in database")
      return NextResponse.json({ user: null })
    }

    console.log("[v0] ME: User found:", users[0].email, "role:", users[0].role)
    return NextResponse.json({ user: users[0] })
  } catch {
    return NextResponse.json({ user: null })
  }
}
