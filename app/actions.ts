"use server"

import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

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

  console.log("[v0] register called with email:", email)

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
    console.log("[v0] Hashing password...")
    const passwordHash = await bcrypt.hash(password, 10)
    console.log("[v0] Password hashed successfully")
    
    console.log("[v0] Inserting user into database...")
    const result = await sql`
      INSERT INTO users (email, password_hash, created_at)
      VALUES (${email}, ${passwordHash}, NOW())
      RETURNING id, email
    `

    if (result.length === 0) {
      return { success: false, error: "Greška pri registraciji." }
    }

    console.log("[v0] User inserted successfully with ID:", result[0].id)

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
    console.log("[v0] Session cookie set, registration complete")

    return { success: true }
  } catch (error) {
    console.error("[v0] Registration error:", error)
    const errorMessage = error instanceof Error ? error.message : "Nepoznata greška"
    return { success: false, error: errorMessage }
  }
}

// Get current user from session cookie
export async function getCurrentUser() {
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
      SELECT id, email, created_at FROM users WHERE id = ${parseInt(userId, 10)}
    `
    
    if (users.length === 0) {
      return null
    }
    
    return users[0]
  } catch (error) {
    console.error("[v0] getCurrentUser error:", error)
    return null
  }
}

// Account type
export type Account = {
  id: number
  name: string
  balance: number
  currency: string
  user_id: number
  created_at: string
}

// Get accounts for the current logged-in user
export async function getAccounts(): Promise<Account[]> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      console.log("[v0] getAccounts: No user logged in")
      return []
    }
    
    const sql = getSQL()
    console.log("[v0] getAccounts: Fetching accounts for user_id:", user.id)
    
    const accounts = await sql`
      SELECT id, name, balance, currency, user_id, created_at 
      FROM accounts 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `
    
    console.log("[v0] getAccounts: Found", accounts.length, "accounts")
    return accounts as Account[]
  } catch (error) {
    console.error("[v0] getAccounts error:", error)
    return []
  }
}

export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("[v0] login called with email:", email)

  if (!email || !password) {
    return { success: false, error: "Email i lozinka su obavezni." }
  }

  try {
    const sql = getSQL()

    console.log("[v0] Querying user from database...")
    const users = await sql`
      SELECT id, email, password_hash FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return { success: false, error: "Pogrešni podaci za prijavu." }
    }

    const user = users[0]
    console.log("[v0] User found, comparing passwords...")
    const isValidPassword = await bcrypt.compare(password, user.password_hash as string)

    if (!isValidPassword) {
      return { success: false, error: "Pogrešni podaci za prijavu." }
    }

    console.log("[v0] Password valid, setting session cookie...")
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
    console.log("[v0] Login successful")

    return { success: true }
  } catch (error) {
    console.error("[v0] Login error:", error)
    const errorMessage = error instanceof Error ? error.message : "Nepoznata greška"
    return { success: false, error: errorMessage }
  }
}
