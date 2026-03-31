"use server"

import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

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

// Types
export type ActionState = {
  success: boolean
  error?: string
}

export type User = {
  id: number
  email: string
  full_name: string
  role: "client" | "cleaner"
  created_at: string
}

export type Job = {
  id: number
  title: string
  location: string
  price: number
  description: string | null
  status: string
  client_id: number
  created_at: string
  client_name?: string
}

export type Account = {
  id: number
  user_id: number
  balance: number
  currency: string
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
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
      SELECT id, email, full_name, role, created_at 
      FROM users WHERE id = ${parseInt(userId, 10)}
    `
    
    if (users.length === 0) {
      return null
    }
    
    return users[0] as User
  } catch {
    return null
  }
}

// Register user
export async function register(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const role = formData.get("role") as string

  if (!email || !password || !fullName || !role) {
    return { success: false, error: "Sva polja su obavezna." }
  }

  if (password.length < 6) {
    return { success: false, error: "Lozinka mora imati najmanje 6 znakova." }
  }

  if (!["client", "cleaner"].includes(role)) {
    return { success: false, error: "Neispravna uloga." }
  }

  try {
    const sql = getSQL()

    // Check if email exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return { success: false, error: "Email je već registriran." }
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10)
    
    const result = await sql`
      INSERT INTO users (email, password_hash, full_name, role, created_at)
      VALUES (${email}, ${passwordHash}, ${fullName}, ${role}, NOW())
      RETURNING id
    `

    if (result.length === 0) {
      return { success: false, error: "Greška pri registraciji." }
    }

    const userId = result[0].id

    // Create account with 0 EUR
    await sql`
      INSERT INTO accounts (user_id, balance, currency)
      VALUES (${userId}, 0, 'EUR')
    `

    // Set session cookie
    const sessionToken = generateSessionToken()
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, `${userId}:${sessionToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return { success: false, error: message }
  }
}

// Login user
export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email i lozinka su obavezni." }
  }

  try {
    const sql = getSQL()

    const users = await sql`
      SELECT id, password_hash FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return { success: false, error: "Pogrešni podaci za prijavu." }
    }

    const user = users[0]
    const isValid = await bcrypt.compare(password, user.password_hash as string)

    if (!isValid) {
      return { success: false, error: "Pogrešni podaci za prijavu." }
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

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return { success: false, error: message }
  }
}

// Logout
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

// Create job (Client only)
export async function createJob(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const title = formData.get("title") as string
  const location = formData.get("location") as string
  const price = parseFloat(formData.get("price") as string)

  if (!title || !location || isNaN(price)) {
    return { success: false, error: "Sva polja su obavezna." }
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Niste prijavljeni." }
    }
    if (user.role !== "client") {
      return { success: false, error: "Samo klijenti mogu objavljivati poslove." }
    }

    const sql = getSQL()
    const result = await sql`
      INSERT INTO jobs (title, location, price, status, client_id, created_at)
      VALUES (${title}, ${location}, ${price}, 'open', ${user.id}, NOW())
      RETURNING id, title, location, price, status, created_at
    `

    // Osvježi podatke bez redirecta
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return { success: false, error: message }
  }
}

// Get jobs for client (their own jobs)
export async function getClientJobs(): Promise<Job[]> {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "client") return []

    const sql = getSQL()
    const jobs = await sql`
      SELECT id, title, location, price, description, status, client_id, created_at
      FROM jobs
      WHERE client_id = ${user.id}
      ORDER BY created_at DESC
    `
    return jobs as Job[]
  } catch {
    return []
  }
}

// Get open jobs for cleaners
export async function getOpenJobs(): Promise<Job[]> {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "cleaner") return []

    const sql = getSQL()
    const jobs = await sql`
      SELECT j.id, j.title, j.location, j.price, j.description, j.status, j.client_id, j.created_at,
             u.full_name as client_name
      FROM jobs j
      JOIN users u ON j.client_id = u.id
      WHERE j.status = 'open'
      ORDER BY j.created_at DESC
    `
    return jobs as Job[]
  } catch {
    return []
  }
}

// Accept job (Cleaner only)
export async function acceptJob(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const jobId = parseInt(formData.get("jobId") as string, 10)

  if (isNaN(jobId)) {
    return { success: false, error: "Neispravan ID posla." }
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Niste prijavljeni." }
    }
    if (user.role !== "cleaner") {
      return { success: false, error: "Samo čistači mogu prihvatiti poslove." }
    }

    const sql = getSQL()
    
    // Check if job is still open
    const jobs = await sql`SELECT id, status FROM jobs WHERE id = ${jobId}`
    if (jobs.length === 0) {
      return { success: false, error: "Posao nije pronađen." }
    }
    if (jobs[0].status !== "open") {
      return { success: false, error: "Posao više nije dostupan." }
    }

    await sql`
      UPDATE jobs SET status = 'accepted' WHERE id = ${jobId}
    `

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return { success: false, error: message }
  }
}

// Get accounts for a user
export async function getAccounts(): Promise<Account[]> {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    const sql = getSQL()
    const accounts = await sql`
      SELECT id, user_id, balance, currency
      FROM accounts
      WHERE user_id = ${user.id}
    `
    return accounts as Account[]
  } catch {
    return []
  }
}
