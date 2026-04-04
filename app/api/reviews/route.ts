// SQL migrations (run manually if columns don't exist):
// ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_type VARCHAR(10) DEFAULT 'client';
// ALTER TABLE users ADD COLUMN IF NOT EXISTS client_rating NUMERIC(2,1) DEFAULT 0;

import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSQL() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set")
  return neon(process.env.DATABASE_URL)
}

// Submit a review (Client or Cleaner action)
export async function POST(request: Request) {
  try {
    const { jobId, clientId, cleanerId, rating, comment, reviewer_type = 'client' } = await request.json()

    if (!jobId || !rating) {
      return NextResponse.json({ success: false, error: "Sva polja su obavezna" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Ocjena mora biti izmedu 1 i 5" }, { status: 400 })
    }

    if (reviewer_type !== 'client' && reviewer_type !== 'cleaner') {
      return NextResponse.json({ success: false, error: "Nevazeci tip recenzenta" }, { status: 400 })
    }

    const sql = getSQL()

    // Verify job exists and is completed
    const job = await sql`
      SELECT id, client_id, cleaner_id, status FROM jobs WHERE id = ${jobId}
    `
    
    if (job.length === 0) {
      return NextResponse.json({ success: false, error: "Posao nije pronaden" }, { status: 404 })
    }
    
    if (reviewer_type === 'client' && job[0].status !== 'completed') {
      return NextResponse.json({ success: false, error: "Mozete ocijeniti samo zavrsene poslove" }, { status: 400 })
    }
    if (reviewer_type === 'cleaner' && !['completed', 'reviewed'].includes(job[0].status)) {
      return NextResponse.json({ success: false, error: "Posao mora biti zavrsen da biste ostavili recenziju" }, { status: 400 })
    }

    if (reviewer_type === 'client') {
      // Client reviewing cleaner - verify job ownership
      if (!clientId || !cleanerId) {
        return NextResponse.json({ success: false, error: "clientId i cleanerId su obavezni" }, { status: 400 })
      }
      if (job[0].client_id !== parseInt(clientId)) {
        return NextResponse.json({ success: false, error: "Nemate dozvolu za recenziju ovog posla" }, { status: 403 })
      }

      // Check if client already reviewed this job
      const existingReview = await sql`
        SELECT id FROM reviews WHERE job_id = ${jobId} AND reviewer_type = 'client'
      `
      if (existingReview.length > 0) {
        return NextResponse.json({ success: false, error: "Vec ste ocijenili ovaj posao" }, { status: 400 })
      }

      // Create client-to-cleaner review
      await sql`
        INSERT INTO reviews (job_id, cleaner_id, client_id, rating, comment, reviewer_type)
        VALUES (${jobId}, ${cleanerId}, ${clientId}, ${rating}, ${comment || null}, 'client')
      `

      // Update job status to reviewed
      await sql`UPDATE jobs SET status = 'reviewed' WHERE id = ${jobId}`

      // Recalculate cleaner's average rating
      const avgRating = await sql`
        SELECT AVG(rating)::numeric(2,1) as avg_rating FROM reviews WHERE cleaner_id = ${cleanerId} AND reviewer_type = 'client'
      `
      
      if (avgRating.length > 0 && avgRating[0].avg_rating) {
        await sql`
          UPDATE users SET rating = ${avgRating[0].avg_rating} WHERE id = ${cleanerId}
        `
      }
    } else {
      // Cleaner reviewing client - verify cleaner is assigned to job
      if (!cleanerId || !clientId) {
        return NextResponse.json({ success: false, error: "clientId i cleanerId su obavezni" }, { status: 400 })
      }
      if (job[0].cleaner_id !== parseInt(cleanerId)) {
        return NextResponse.json({ success: false, error: "Nemate dozvolu za recenziju ovog posla" }, { status: 403 })
      }

      // Check if cleaner already reviewed this job
      const existingReview = await sql`
        SELECT id FROM reviews WHERE job_id = ${jobId} AND reviewer_type = 'cleaner'
      `
      if (existingReview.length > 0) {
        return NextResponse.json({ success: false, error: "Vec ste ocijenili ovaj posao" }, { status: 400 })
      }

      // Create cleaner-to-client review
      await sql`
        INSERT INTO reviews (job_id, cleaner_id, client_id, rating, comment, reviewer_type)
        VALUES (${jobId}, ${cleanerId}, ${clientId}, ${rating}, ${comment || null}, 'cleaner')
      `

      // Recalculate client's average rating
      const avgRating = await sql`
        SELECT AVG(rating)::numeric(2,1) as avg_rating FROM reviews WHERE client_id = ${clientId} AND reviewer_type = 'cleaner'
      `
      
      if (avgRating.length > 0 && avgRating[0].avg_rating) {
        await sql`
          UPDATE users SET client_rating = ${avgRating[0].avg_rating} WHERE id = ${clientId}
        `
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greska"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// Get reviews for a cleaner or client
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cleanerId = searchParams.get("cleanerId")
    const clientId = searchParams.get("clientId")

    if (!cleanerId && !clientId) {
      return NextResponse.json({ reviews: [] })
    }

    const sql = getSQL()
    
    if (clientId) {
      // Get reviews about a client (written by cleaners)
      const reviews = await sql`
        SELECT r.*, u.full_name as reviewer_name
        FROM reviews r
        JOIN users u ON r.cleaner_id = u.id
        WHERE r.client_id = ${parseInt(clientId)} AND r.reviewer_type = 'cleaner'
        ORDER BY r.created_at DESC
        LIMIT 10
      `
      return NextResponse.json({ reviews })
    }

    // Get reviews about a cleaner (written by clients)
    const reviews = await sql`
      SELECT r.*, u.full_name as client_name
      FROM reviews r
      JOIN users u ON r.client_id = u.id
      WHERE r.cleaner_id = ${parseInt(cleanerId!)} AND r.reviewer_type = 'client'
      ORDER BY r.created_at DESC
      LIMIT 10
    `

    return NextResponse.json({ reviews })
  } catch {
    return NextResponse.json({ reviews: [] })
  }
}
