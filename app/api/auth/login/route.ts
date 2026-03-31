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
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email i lozinka su obavezni." }, { status: 400 })
    }

    const sql = getSQL()
    const users = await sql`
      SELECT id, email, password_hash FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Pogrešni podaci za prijavu." }, { status: 401 })
    }

    const user = users[0]
    const isValid = await bcrypt.compare(password, user.password_hash as string)

    if (!isValid) {
      return NextResponse.json({ error: "Pogrešni podaci za prijavu." }, { status: 401 })
    }

    const sessionToken = generateSessionToken()
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, `${user.id}:${sessionToken}`, {
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
