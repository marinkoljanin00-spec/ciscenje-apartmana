"use server"

import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const SESSION_COOKIE = "sjaj_session"

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

export type ActionState = {
  success: boolean
  error?: string
}

export async function register(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Validation
  if (!email || !password) {
    return { success: false, error: "Email i lozinka su obavezni." }
  }

  if (password.length < 6) {
    return { success: false, error: "Lozinka mora imati najmanje 6 znakova." }
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Lozinke se ne podudaraju." }
  }

  try {
    const sql = getSQL()

    // Check if email exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return { success: false, error: "Email je već registriran." }
    }

    // Hash password and insert
    const passwordHash = await bcrypt.hash(password, 10)
    
    const result = await sql`
      INSERT INTO users (email, password_hash, created_at)
      VALUES (${email}, ${passwordHash}, NOW())
      RETURNING id, email
    `

    if (result.length === 0) {
      return { success: false, error: "Greška pri registraciji." }
    }

    // Set session cookie
    const sessionToken = generateSessionToken()
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, `${result[0].id}:${sessionToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Nepoznata greška"
    return { success: false, error: errorMessage }
  }

  redirect("/success")
}

export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email i lozinka su obavezni." }
  }

  try {
    const sql = getSQL()

    const users = await sql`
      SELECT id, email, password_hash FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return { success: false, error: "Pogrešni podaci za prijavu." }
    }

    const user = users[0]
    const isValidPassword = await bcrypt.compare(password, user.password_hash as string)

    if (!isValidPassword) {
      return { success: false, error: "Pogrešni podaci za prijavu." }
    }

    // Set session cookie
    const sessionToken = generateSessionToken()
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, `${user.id}:${sessionToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Nepoznata greška"
    return { success: false, error: errorMessage }
  }

  redirect("/")
}
