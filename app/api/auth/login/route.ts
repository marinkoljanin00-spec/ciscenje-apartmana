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
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email i lozinka su obavezni." }, { status: 400 })
    }

    const sql = getSQL()

    const users = await sql`
      SELECT id, email, password_hash, role FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: "Korisnik nije pronađen u bazi." }, { status: 401 })
    }

    const user = users[0]
    const isValid = await bcrypt.compare(password, user.password_hash as string)

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Kriva lozinka." }, { status: 401 })
    }

    const sessionToken = generateSessionToken()
    const sessionValue = `${user.id}:${sessionToken}`
    
    // Create response and return user data
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })
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
