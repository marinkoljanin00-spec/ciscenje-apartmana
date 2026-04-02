import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function getSQL() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }
  return neon(databaseUrl)
}

// Client confirms a job after cleaner accepted
export async function POST(request: Request) {
  try {
    const { jobId, userId } = await request.json()

    if (!jobId || !userId) {
      return NextResponse.json({ success: false, error: "jobId and userId are required" }, { status: 400 })
    }

    const sql = getSQL()
    
    // Verify that the job belongs to this client and is waiting for confirmation
    const jobs = await sql`
      SELECT id, client_id, status FROM jobs WHERE id = ${jobId}
    `
    
    if (jobs.length === 0) {
      return NextResponse.json({ success: false, error: "Posao nije pronađen" }, { status: 404 })
    }
    
    const job = jobs[0]
    
    if (job.client_id !== parseInt(userId, 10)) {
      return NextResponse.json({ success: false, error: "Nemate pravo potvrditi ovaj posao" }, { status: 403 })
    }
    
    if (job.status !== 'waiting_for_client') {
      return NextResponse.json({ success: false, error: "Posao nije u statusu čekanja potvrde" }, { status: 400 })
    }

    // Update status to confirmed
    await sql`
      UPDATE jobs SET status = 'confirmed' WHERE id = ${jobId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
