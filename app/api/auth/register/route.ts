import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const SESSION_COOKIE = "sjaj_session"

function getSQL() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error("DATABASE_URL is not set")
  return neon(databaseUrl)
}

function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
}

export async function POST(request: Request) {
  try {
    const { email, password, confirmPassword } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email i lozinka su obavezni." }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Lozinka mora imati najmanje 6 znakova." }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Lozinke se ne podudaraju." }, { status: 400 })
    }

    const sql = getSQL()

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email je već registriran." }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = await sql`
      INSERT INTO users (email, password_hash, created_at)
      VALUES (${email}, ${passwordHash}, NOW())
      RETURNING id, email
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Greška pri registraciji." }, { status: 500 })
    }

    const sessionToken = generateSessionToken()
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, `${result[0].id}:${sessionToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Greška na serveru"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
