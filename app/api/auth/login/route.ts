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
    console.log("[v0] Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email i lozinka su obavezni." }, { status: 400 })
    }

    const sql = getSQL()
    console.log("[v0] Database connected")

    const users = await sql`
      SELECT id, password_hash FROM users WHERE email = ${email}
    `
    console.log("[v0] Users found:", users.length)

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: "Neispravan email ili lozinka." }, { status: 401 })
    }

    const user = users[0]
    console.log("[v0] User ID:", user.id, "Hash exists:", !!user.password_hash)
    
    const isValid = await bcrypt.compare(password, user.password_hash as string)
    console.log("[v0] Password valid:", isValid)

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Neispravan email ili lozinka." }, { status: 401 })
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
    console.log("[v0] Session cookie set, returning success")

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
