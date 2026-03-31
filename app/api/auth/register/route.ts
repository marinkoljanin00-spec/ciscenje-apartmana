import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
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

function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role } = await request.json()

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ success: false, error: "Sva polja su obavezna." }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Lozinka mora imati najmanje 6 znakova." }, { status: 400 })
    }

    if (!["client", "cleaner"].includes(role)) {
      return NextResponse.json({ success: false, error: "Neispravna uloga." }, { status: 400 })
    }

    const sql = getSQL()

    // Check if email exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: "Email je već registriran." }, { status: 400 })
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10)
    
    const result = await sql`
      INSERT INTO users (email, password_hash, full_name, role, created_at)
      VALUES (${email}, ${passwordHash}, ${fullName}, ${role}, NOW())
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Greška pri registraciji." }, { status: 500 })
    }

    const userId = result[0].id

    // Create account with 0 EUR
    await sql`
      INSERT INTO accounts (user_id, balance, currency)
      VALUES (${userId}, 0, 'EUR')
    `

    // Set session cookie
    const sessionToken = generateSessionToken()
    const sessionValue = `${userId}:${sessionToken}`
    
    const response = NextResponse.json({ success: true })
    response.cookies.set(SESSION_COOKIE, sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
