import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
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

async function getCurrentUser() {
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
    
    return users[0]
  } catch {
    return null
  }
}

// Get jobs
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ jobs: [] })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    const sql = getSQL()

    if (role === "client") {
      // Return client's own jobs
      const jobs = await sql`
        SELECT id, title, location, price, status, created_at 
        FROM jobs 
        WHERE client_id = ${user.id}
        ORDER BY created_at DESC
      `
      return NextResponse.json({ jobs })
    } else {
      // Return all open jobs for cleaners
      const jobs = await sql`
        SELECT id, title, location, price, status, created_at 
        FROM jobs 
        WHERE status = 'open'
        ORDER BY created_at DESC
      `
      return NextResponse.json({ jobs })
    }
  } catch {
    return NextResponse.json({ jobs: [] })
  }
}

// Create a new job
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Niste prijavljeni." }, { status: 401 })
    }
    if (user.role !== "client") {
      return NextResponse.json({ success: false, error: "Samo klijenti mogu objavljivati poslove." }, { status: 403 })
    }

    const { title, location, price } = await request.json()

    if (!title || !location || isNaN(price)) {
      return NextResponse.json({ success: false, error: "Sva polja su obavezna." }, { status: 400 })
    }

    const sql = getSQL()
    await sql`
      INSERT INTO jobs (title, location, price, status, client_id, created_at)
      VALUES (${title}, ${location}, ${price}, 'open', ${user.id}, NOW())
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
