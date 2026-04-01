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

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greska"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
