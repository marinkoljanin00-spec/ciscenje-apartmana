"use server"

import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

// Session token name
const SESSION_COOKIE = "sjaj_session"

export interface AuthResult {
  success: boolean
  error?: string
  user?: {
    id: number
    email: string
  }
}

// Helper to generate a simple session token
function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Registracija novog korisnika
 */
export async function registerUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: "Email i lozinka su obavezni." }
    }

    if (password.length < 6) {
      return { success: false, error: "Lozinka mora imati najmanje 6 znakova." }
    }

    // Check if email already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return { success: false, error: "Email je već registriran." }
    }

    // Hash the password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Insert new user
    const result = await sql`
      INSERT INTO users (email, password_hash, created_at)
      VALUES (${email}, ${passwordHash}, NOW())
      RETURNING id, email
    `

    if (result.length === 0) {
      return { success: false, error: "Greška pri registraciji. Pokušajte ponovno." }
    }

    const newUser = result[0]

    // Create session
    const sessionToken = generateSessionToken()
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, `${newUser.id}:${sessionToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return {
      success: true,
      user: {
        id: newUser.id as number,
        email: newUser.email as string,
      },
    }
  } catch (error) {
    console.error("[Auth] Registration error:", error)
    return { success: false, error: "Došlo je do greške. Pokušajte ponovno." }
  }
}

/**
 * Prijava korisnika
 */
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: "Email i lozinka su obavezni." }
    }

    // Find user by email
    const users = await sql`
      SELECT id, email, password_hash FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return { success: false, error: "Pogrešni podaci za prijavu." }
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash as string)

    if (!isValidPassword) {
      return { success: false, error: "Pogrešni podaci za prijavu." }
    }

    // Create session
    const sessionToken = generateSessionToken()
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, `${user.id}:${sessionToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return {
      success: true,
      user: {
        id: user.id as number,
        email: user.email as string,
      },
    }
  } catch (error) {
    console.error("[Auth] Login error:", error)
    return { success: false, error: "Došlo je do greške. Pokušajte ponovno." }
  }
}

/**
 * Odjava korisnika
 */
export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/**
 * Dohvati trenutno prijavljenog korisnika
 */
export async function getCurrentUser(): Promise<{ id: number; email: string } | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE)

    if (!sessionCookie?.value) {
      return null
    }

    const [userId] = sessionCookie.value.split(":")

    if (!userId) {
      return null
    }

    const users = await sql`
      SELECT id, email FROM users WHERE id = ${parseInt(userId, 10)}
    `

    if (users.length === 0) {
      return null
    }

    return {
      id: users[0].id as number,
      email: users[0].email as string,
    }
  } catch (error) {
    console.error("[Auth] Get current user error:", error)
    return null
  }
}

/**
 * Provjeri je li email već registriran
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const users = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
    return users.length > 0
  } catch (error) {
    console.error("[Auth] Check email error:", error)
    return false
  }
}
