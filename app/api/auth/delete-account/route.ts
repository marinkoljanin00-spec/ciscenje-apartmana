import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'marketplace_session'

function getSQL() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
  return neon(process.env.DATABASE_URL)
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId je obavezan' }, { status: 400 })
    }

    const parsedId = parseInt(userId, 10)
    const sql = getSQL()

    // Delete all reviews by or about this user
    await sql`DELETE FROM reviews WHERE cleaner_id = ${parsedId} OR client_id = ${parsedId}`

    // Delete all applications by this user
    await sql`DELETE FROM applications WHERE cleaner_id = ${parsedId}`

    // Delete all jobs by this user (and their applications)
    const userJobs = await sql`SELECT id FROM jobs WHERE client_id = ${parsedId}`
    for (const job of userJobs) {
      await sql`DELETE FROM applications WHERE job_id = ${job.id}`
      await sql`DELETE FROM reviews WHERE job_id = ${job.id}`
    }
    await sql`DELETE FROM jobs WHERE client_id = ${parsedId}`

    // Finally delete the user
    await sql`DELETE FROM users WHERE id = ${parsedId}`

    // Clear session cookie
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Greška pri brisanju'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
