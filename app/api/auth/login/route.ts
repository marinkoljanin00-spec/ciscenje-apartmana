import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
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

function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    console.log("[v0] Login attempt for email:", email)

    if (!email || !password) {
      console.log("[v0] Missing email or password")
      return NextResponse.json({ success: false, error: "Email i lozinka su obavezni." }, { status: 400 })
    }

    const sql = getSQL()
    console.log("[v0] Database connection established")

    const users = await sql`
      SELECT id, password_hash FROM users WHERE email = ${email}
    `
    console.log("[v0] Users found:", users.length)

    if (users.length === 0) {
      console.log("[v0] No user found with this email")
      return NextResponse.json({ success: false, error: "Pogrešni podaci za prijavu." }, { status: 401 })
    }

    const user = users[0]
    console.log("[v0] User ID:", user.id)
    const isValid = await bcrypt.compare(password, user.password_hash as string)
    console.log("[v0] Password valid:", isValid)

    if (!isValid) {
      console.log("[v0] Invalid password")
      return NextResponse.json({ success: false, error: "Pogrešni podaci za prijavu." }, { status: 401 })
    }

    const sessionToken = generateSessionToken()
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, `${user.id}:${sessionToken}`, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    console.log("[v0] Session cookie set for user:", user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
