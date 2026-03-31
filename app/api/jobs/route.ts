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
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const userId = searchParams.get("userId")

    // Try to get user from cookie first, then fall back to userId param
    let clientId: number | null = null
    const user = await getCurrentUser()
    if (user) {
      clientId = user.id
    } else if (userId) {
      clientId = parseInt(userId, 10)
    }

    const sql = getSQL()

    if (role === "client" && clientId) {
      // Return client's own jobs with cleaner info
      const jobs = await sql`
        SELECT j.id, j.title, j.location, j.price, j.status, j.created_at, j.cleaner_id,
               u.full_name as cleaner_name
        FROM jobs j
        LEFT JOIN users u ON j.cleaner_id = u.id
        WHERE j.client_id = ${clientId}
        ORDER BY j.created_at DESC
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
    const { title, location, price, userId } = await request.json()

    // Try to get user from cookie first, then fall back to userId from body
    let clientId: number | null = null
    const user = await getCurrentUser()
    if (user) {
      clientId = user.id
    } else if (userId) {
      clientId = parseInt(userId, 10)
    }

    if (!clientId) {
      return NextResponse.json({ success: false, error: "Niste prijavljeni." }, { status: 401 })
    }

    if (!title || !location || isNaN(price)) {
      return NextResponse.json({ success: false, error: "Sva polja su obavezna." }, { status: 400 })
    }

    const sql = getSQL()
    const result = await sql`
      INSERT INTO jobs (title, location, price, status, client_id, created_at)
      VALUES (${title}, ${location}, ${price}, 'open', ${clientId}, NOW())
      RETURNING id
    `

    return NextResponse.json({ success: true, job: { id: result[0].id } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
