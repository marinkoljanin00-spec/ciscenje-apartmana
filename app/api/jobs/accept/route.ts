import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

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

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Niste prijavljeni." }, { status: 401 })
    }
    if (user.role !== "cleaner") {
      return NextResponse.json({ success: false, error: "Samo čistači mogu prihvatiti poslove." }, { status: 403 })
    }

    const { jobId } = await request.json()

    if (!jobId || isNaN(Number(jobId))) {
      return NextResponse.json({ success: false, error: "Neispravan ID posla." }, { status: 400 })
    }

    const sql = getSQL()
    
    // Check if job is still open
    const jobs = await sql`SELECT id, status FROM jobs WHERE id = ${jobId}`
    if (jobs.length === 0) {
      return NextResponse.json({ success: false, error: "Posao nije pronađen." }, { status: 404 })
    }
    if (jobs[0].status !== "open") {
      return NextResponse.json({ success: false, error: "Posao više nije dostupan." }, { status: 400 })
    }

    await sql`
      UPDATE jobs SET status = 'accepted' WHERE id = ${jobId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
