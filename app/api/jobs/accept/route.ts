import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = 'nodejs'

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
    const { jobId, odrzavateljId } = await request.json()
    
    // Try cookie first, then fall back to odrzavateljId from request
    let cleanerId: number | null = null
    const user = await getCurrentUser()
    if (user) {
      cleanerId = user.id
      if (user.role !== "cleaner") {
        return NextResponse.json({ success: false, error: "Samo čistači mogu prihvatiti poslove." }, { status: 403 })
      }
    } else if (odrzavateljId) {
      cleanerId = parseInt(odrzavateljId, 10)
    }
    
    if (!cleanerId) {
      return NextResponse.json({ success: false, error: "Niste prijavljeni." }, { status: 401 })
    }

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
      UPDATE jobs SET status = 'waiting_for_client', cleaner_id = ${cleanerId} WHERE id = ${jobId}
    `

    // Send push notification to client
    try {
      const { sendPushNotification } = await import('@/lib/push');
      const jobDetails = await sql`
        SELECT j.title, j.client_id, u.full_name as cleaner_name
        FROM jobs j
        JOIN users u ON u.id = ${cleanerId}
        WHERE j.id = ${jobId}
      `;
      if (jobDetails.length > 0) {
        const clientSubs = await sql`
          SELECT subscription FROM push_subscriptions
          WHERE user_id = ${jobDetails[0].client_id}
        `;
        await Promise.all(
          clientSubs.map((row: any) =>
            sendPushNotification(
              row.subscription,
              '✅ Čistač prihvatio vaš posao!',
              `${jobDetails[0].cleaner_name} je prihvatio "${jobDetails[0].title}"`,
              '/'
            )
          )
        );
      }
    } catch (e) {
      console.error('Push notification error:', e);
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
