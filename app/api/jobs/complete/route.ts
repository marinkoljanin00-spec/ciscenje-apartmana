import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSQL() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set")
  return neon(process.env.DATABASE_URL)
}

// Mark job as completed (Cleaner action)
export async function POST(request: Request) {
  try {
    const { jobId, cleanerId } = await request.json()

    if (!jobId || !cleanerId) {
      return NextResponse.json({ success: false, error: "jobId i cleanerId su obavezni" }, { status: 400 })
    }

    const sql = getSQL()

    // Verify the cleaner is assigned to this job
    const job = await sql`
      SELECT id, cleaner_id, status, price FROM jobs WHERE id = ${jobId}
    `
    
    if (job.length === 0) {
      return NextResponse.json({ success: false, error: "Posao nije pronaden" }, { status: 404 })
    }
    
    if (job[0].cleaner_id !== parseInt(cleanerId)) {
      return NextResponse.json({ success: false, error: "Nemate dozvolu za ovaj posao" }, { status: 403 })
    }
    
    if (job[0].status !== 'accepted') {
      return NextResponse.json({ success: false, error: "Posao nije u statusu prihvacen" }, { status: 400 })
    }

    // Update job status to completed
    await sql`
      UPDATE jobs SET status = 'completed' WHERE id = ${jobId}
    `

    // Add earnings to cleaner's total_earned
    await sql`
      UPDATE users SET total_earned = total_earned + ${job[0].price} WHERE id = ${cleanerId}
    `

    // Send push notification to the client
    try {
      const { sendPushNotification } = await import('@/lib/push')
      const jobDetails = await sql`
        SELECT j.title, j.client_id, u.full_name as cleaner_name
        FROM jobs j
        JOIN users u ON u.id = j.cleaner_id
        WHERE j.id = ${jobId}
      `
      if (jobDetails.length > 0) {
        const clientSubs = await sql`
          SELECT subscription FROM push_subscriptions
          WHERE user_id = ${jobDetails[0].client_id}
        `
        await Promise.all(
          clientSubs.map((row: any) =>
            sendPushNotification(
              row.subscription,
              '🧹 Čišćenje završeno!',
              `${jobDetails[0].cleaner_name} je označio "${jobDetails[0].title}" kao završeno. Potvrdite i ostavite recenziju!`,
              '/'
            )
          )
        )
      }
    } catch (e) {
      console.error('Push notification error:', e)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greska"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
