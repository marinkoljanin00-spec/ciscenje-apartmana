import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

function getSQL() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error("DATABASE_URL is not set")
  return neon(databaseUrl)
}

// Accept an application (client accepts a cleaner)
export async function POST(request: Request) {
  try {
    const { applicationId, jobId, cleanerId } = await request.json()
    
    if (!applicationId || !jobId || !cleanerId) {
      return NextResponse.json({ error: "Svi parametri su obavezni" }, { status: 400 })
    }
    
    const sql = getSQL()
    
    // Update the accepted application
    await sql`
      UPDATE applications SET status = 'accepted' WHERE id = ${applicationId}
    `
    
    // Reject all other applications for this job
    await sql`
      UPDATE applications SET status = 'rejected' 
      WHERE job_id = ${jobId} AND id != ${applicationId}
    `
    
    // Update job status and assign cleaner
    await sql`
      UPDATE jobs SET status = 'accepted', cleaner_id = ${cleanerId}
      WHERE id = ${jobId}
    `
    
    // NOTE: Earnings are added when cleaner marks job as completed (in /api/jobs/complete)
    
    // Send push notification to the cleaner
    try {
      const { sendPushNotification } = await import('@/lib/push')
      const jobDetails = await sql`
        SELECT j.title, j.cleaner_id, u.full_name as client_name
        FROM jobs j
        JOIN users u ON u.id = j.client_id
        WHERE j.id = ${jobId}
      `
      if (jobDetails.length > 0) {
        const cleanerSubs = await sql`
          SELECT subscription FROM push_subscriptions
          WHERE user_id = ${jobDetails[0].cleaner_id}
        `
        await Promise.all(
          cleanerSubs.map((row: any) =>
            sendPushNotification(
              row.subscription,
              '🎉 Odabrani ste za posao!',
              `${jobDetails[0].client_name} vas je odabrao za "${jobDetails[0].title}"`,
              '/'
            )
          )
        )
      }
    } catch (e) {
      console.error('Push notification error:', e)
    }
    
    // Get cleaner contact info to return to client
    const cleaner = await sql`
      SELECT id, full_name, email, phone, rating FROM users WHERE id = ${cleanerId}
    `
    
    return NextResponse.json({ 
      success: true, 
      cleaner: cleaner.length > 0 ? {
        id: cleaner[0].id,
        name: cleaner[0].full_name,
        email: cleaner[0].email,
        phone: cleaner[0].phone,
        rating: cleaner[0].rating
      } : null
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
