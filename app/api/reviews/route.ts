import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSQL() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set")
  return neon(process.env.DATABASE_URL)
}

// Submit a review (Client action)
export async function POST(request: Request) {
  try {
    const { jobId, clientId, cleanerId, rating, comment } = await request.json()

    if (!jobId || !clientId || !cleanerId || !rating) {
      return NextResponse.json({ success: false, error: "Sva polja su obavezna" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Ocjena mora biti izmedu 1 i 5" }, { status: 400 })
    }

    const sql = getSQL()

    // Verify the job belongs to this client and is completed
    const job = await sql`
      SELECT id, client_id, cleaner_id, status FROM jobs WHERE id = ${jobId}
    `
    
    if (job.length === 0) {
      return NextResponse.json({ success: false, error: "Posao nije pronaden" }, { status: 404 })
    }
    
    if (job[0].client_id !== parseInt(clientId)) {
      return NextResponse.json({ success: false, error: "Nemate dozvolu za recenziju ovog posla" }, { status: 403 })
    }
    
    if (job[0].status !== 'completed') {
      return NextResponse.json({ success: false, error: "Mozete ocijeniti samo zavrsene poslove" }, { status: 400 })
    }

    // Check if review already exists
    const existingReview = await sql`SELECT id FROM reviews WHERE job_id = ${jobId}`
    if (existingReview.length > 0) {
      return NextResponse.json({ success: false, error: "Vec ste ocijenili ovaj posao" }, { status: 400 })
    }

    // Create review
    await sql`
      INSERT INTO reviews (job_id, cleaner_id, client_id, rating, comment)
      VALUES (${jobId}, ${cleanerId}, ${clientId}, ${rating}, ${comment || null})
    `

    // Update job status to reviewed
    await sql`UPDATE jobs SET status = 'reviewed' WHERE id = ${jobId}`

    // Recalculate cleaner's average rating
    const avgRating = await sql`
      SELECT AVG(rating)::numeric(2,1) as avg_rating FROM reviews WHERE cleaner_id = ${cleanerId}
    `
    
    if (avgRating.length > 0 && avgRating[0].avg_rating) {
      await sql`
        UPDATE users SET rating = ${avgRating[0].avg_rating} WHERE id = ${cleanerId}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greska"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// Get reviews for a cleaner
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cleanerId = searchParams.get("cleanerId")

    if (!cleanerId) {
      return NextResponse.json({ reviews: [] })
    }

    const sql = getSQL()
    
    const reviews = await sql`
      SELECT r.*, u.full_name as client_name
      FROM reviews r
      JOIN users u ON r.client_id = u.id
      WHERE r.cleaner_id = ${parseInt(cleanerId)}
      ORDER BY r.created_at DESC
    `

    return NextResponse.json({ reviews })
  } catch {
    return NextResponse.json({ reviews: [] })
  }
}
