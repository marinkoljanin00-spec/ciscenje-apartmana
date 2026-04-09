import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'marketplace_session'

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json()
    const sql = neon(process.env.DATABASE_URL!)

    const cookieStore = await cookies()
    const session = cookieStore.get(SESSION_COOKIE)
    if (!session?.value) {
      return NextResponse.json({ success: false, error: 'Niste prijavljeni' }, { status: 401 })
    }
    const [userId] = session.value.split(':')

    // Verify ownership and that job is still cancellable
    const jobs = await sql`
      SELECT id, status, cleaner_id, title, client_id 
      FROM jobs WHERE id = ${jobId}
    `
    if (jobs.length === 0) {
      return NextResponse.json({ success: false, error: 'Posao nije pronađen' }, { status: 404 })
    }
    if (jobs[0].client_id !== parseInt(userId)) {
      return NextResponse.json({ success: false, error: 'Nemate dozvolu' }, { status: 403 })
    }
    if (!['open', 'waiting_for_client'].includes(jobs[0].status)) {
      return NextResponse.json({ success: false, error: 'Ovaj posao se više ne može otkazati' }, { status: 400 })
    }

    await sql`UPDATE jobs SET status = 'cancelled' WHERE id = ${jobId}`

    // Notify assigned cleaner if there is one
    if (jobs[0].cleaner_id) {
      try {
        const { sendPushNotification } = await import('@/lib/push')
        const cleanerSubs = await sql`
          SELECT subscription FROM push_subscriptions WHERE user_id = ${jobs[0].cleaner_id}
        `
        await Promise.all(cleanerSubs.map((row: any) =>
          sendPushNotification(
            row.subscription,
            '❌ Posao otkazan',
            `Klijent je otkazao posao "${jobs[0].title}"`,
            '/'
          ).catch(() => {})
        ))
      } catch (e) {
        console.error('Push error:', e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Greška'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
