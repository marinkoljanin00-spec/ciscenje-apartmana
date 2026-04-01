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
    
    // Get job price to update cleaner's earnings
    const job = await sql`SELECT price FROM jobs WHERE id = ${jobId}`
    if (job.length > 0) {
      await sql`
        UPDATE users SET total_earned = total_earned + ${job[0].price}
        WHERE id = ${cleanerId}
      `
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
