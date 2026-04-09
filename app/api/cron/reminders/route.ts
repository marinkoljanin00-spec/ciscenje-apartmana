import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Protect with a secret so only cron can call it
  const { searchParams } = new URL(request.url)
  if (searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sql = neon(process.env.DATABASE_URL!)
  const { sendPushNotification } = await import('@/lib/push')

  // Find jobs scheduled in the next 23-25 hour window (to avoid duplicate reminders)
  const jobs = await sql`
    SELECT 
      j.id, j.title, j.scheduled_date, j.client_id, j.cleaner_id,
      uc.full_name as client_name,
      uu.full_name as cleaner_name
    FROM jobs j
    JOIN users uc ON uc.id = j.client_id
    LEFT JOIN users uu ON uu.id = j.cleaner_id
    WHERE j.scheduled_date IS NOT NULL
      AND j.status IN ('open', 'waiting_for_client')
      AND j.scheduled_date BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
      AND j.reminder_sent IS DISTINCT FROM true
  `

  for (const job of jobs) {
    const dateStr = new Date(job.scheduled_date).toLocaleString('hr-HR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    })

    // Push to client
    const clientSubs = await sql`
      SELECT subscription FROM push_subscriptions WHERE user_id = ${job.client_id}
    `
    await Promise.all(clientSubs.map((row: any) =>
      sendPushNotification(
        row.subscription,
        '📅 Podsjetnik — čišćenje sutra!',
        `Vaš posao "${job.title}" je zakazan za ${dateStr}`,
        '/'
      ).catch(() => {})
    ))

    // Push to cleaner (if assigned)
    if (job.cleaner_id) {
      const cleanerSubs = await sql`
        SELECT subscription FROM push_subscriptions WHERE user_id = ${job.cleaner_id}
      `
      await Promise.all(cleanerSubs.map((row: any) =>
        sendPushNotification(
          row.subscription,
          '📅 Podsjetnik — posao sutra!',
          `Imate zakazano čišćenje "${job.title}" za ${dateStr}`,
          '/'
        ).catch(() => {})
      ))
    }

    // Mark reminder as sent to avoid duplicates
    await sql`UPDATE jobs SET reminder_sent = true WHERE id = ${job.id}`
  }

  return NextResponse.json({ success: true, reminded: jobs.length })
}
