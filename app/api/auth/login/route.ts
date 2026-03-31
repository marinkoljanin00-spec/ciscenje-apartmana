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
    console.log("[v0] LOGIN: Pokusaj prijave za:", email)

    if (!email || !password) {
      console.log("[v0] LOGIN: Nedostaje email ili lozinka")
      return NextResponse.json({ success: false, error: "Email i lozinka su obavezni." }, { status: 400 })
    }

    const sql = getSQL()
    console.log("[v0] LOGIN: Baza spojena")

    const users = await sql`
      SELECT id, password_hash FROM users WHERE email = ${email}
    `
    console.log("[v0] LOGIN: Pronadjeno korisnika:", users.length)

    if (users.length === 0) {
      console.log("[v0] LOGIN: Korisnik nije pronadjen")
      return NextResponse.json({ success: false, error: "Korisnik nije pronadjen u bazi." }, { status: 401 })
    }

    const user = users[0]
    console.log("[v0] LOGIN: Korisnik ID:", user.id, "- Ima hash:", !!user.password_hash)
    
    const isValid = await bcrypt.compare(password, user.password_hash as string)
    console.log("[v0] LOGIN: Lozinka ispravna:", isValid)

    if (!isValid) {
      console.log("[v0] LOGIN: Kriva lozinka")
      return NextResponse.json({ success: false, error: "Kriva lozinka." }, { status: 401 })
    }

    const sessionToken = generateSessionToken()
    const sessionValue = `${user.id}:${sessionToken}`
    
    // Create response and set cookie on it
    const response = NextResponse.json({ success: true })
    response.cookies.set(SESSION_COOKIE, sessionValue, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    
    // Log the actual Set-Cookie header
    const setCookie = response.headers.get("set-cookie")
    console.log("[v0] LOGIN: Set-Cookie header:", setCookie)
    console.log("[v0] LOGIN: Cookie postavljen, prijava uspjesna!")

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
