"use server"

import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Create SQL client inside functions to ensure DATABASE_URL is available
function getSQL() {
  const databaseUrl = process.env.DATABASE_URL
  console.log("[v0] DATABASE_URL exists:", !!databaseUrl)
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }
  return neon(databaseUrl)
}

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
  console.log("[v0] registerUser called with email:", email)
  
  try {
    // Get SQL client
    const sql = getSQL()
    console.log("[v0] SQL client created successfully")

    // Validate inputs
    if (!email || !password) {
      console.log("[v0] Validation failed: missing email or password")
      return { success: false, error: "Email i lozinka su obavezni." }
    }

    if (password.length < 6) {
      console.log("[v0] Validation failed: password too short")
      return { success: false, error: "Lozinka mora imati najmanje 6 znakova." }
    }

    // Check if email already exists
    console.log("[v0] Checking if email exists...")
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
    console.log("[v0] Existing users check result:", existingUsers.length)

    if (existingUsers.length > 0) {
      console.log("[v0] Email already registered")
      return { success: false, error: "Email je već registriran." }
    }

    // Hash the password
    console.log("[v0] Hashing password...")
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    console.log("[v0] Password hashed successfully")

    // Insert new user
    console.log("[v0] Inserting new user into database...")
    console.log("[v0] Data being sent: { email:", email, ", password_hash:", passwordHash.substring(0, 10) + "...", ", created_at: NOW() }")
    
    const result = await sql`
      INSERT INTO users (email, password_hash, created_at)
      VALUES (${email}, ${passwordHash}, NOW())
      RETURNING id, email
    `
    console.log("[v0] Insert result:", JSON.stringify(result))

    if (result.length === 0) {
      console.log("[v0] Insert returned no rows")
      return { success: false, error: "Greška pri registraciji. Pokušajte ponovno." }
    }

    const newUser = result[0]
    console.log("[v0] User created with ID:", newUser.id)

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
    console.log("[v0] Session cookie set, redirecting to /success")

  } catch (error) {
    console.error("[v0] Registration error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: `Greška: ${errorMessage}` }
  }

  // redirect() must be called outside try/catch
  redirect("/success")
}

/**
 * Prijava korisnika
 */
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  console.log("[v0] loginUser called with email:", email)
  
  try {
    const sql = getSQL()

    // Validate inputs
    if (!email || !password) {
      return { success: false, error: "Email i lozinka su obavezni." }
    }

    // Find user by email
    console.log("[v0] Looking up user by email...")
    const users = await sql`
      SELECT id, email, password_hash FROM users WHERE email = ${email}
    `
    console.log("[v0] Found users:", users.length)

    if (users.length === 0) {
      return { success: false, error: "Pogrešni podaci za prijavu." }
    }

    const user = users[0]

    // Verify password
    console.log("[v0] Verifying password...")
    const isValidPassword = await bcrypt.compare(password, user.password_hash as string)
    console.log("[v0] Password valid:", isValidPassword)

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
    console.log("[v0] Login successful for user:", user.id)

    return {
      success: true,
      user: {
        id: user.id as number,
        email: user.email as string,
      },
    }
  } catch (error) {
    console.error("[v0] Login error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: `Greška: ${errorMessage}` }
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

    const sql = getSQL()
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
    console.error("[v0] Get current user error:", error)
    return null
  }
}

/**
 * Provjeri je li email već registriran
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const sql = getSQL()
    const users = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
    return users.length > 0
  } catch (error) {
    console.error("[v0] Check email error:", error)
    return false
  }
}
