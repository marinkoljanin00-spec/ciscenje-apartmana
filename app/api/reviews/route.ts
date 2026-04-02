import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSQL() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set")
  return neon(process.env.DATABASE_URL)
}

// Submit a review (Client reviewing Cleaner OR Cleaner reviewing Client)
export async function POST(request: Request) {
  try {
    const { jobId, reviewerId, revieweeId, reviewerType, rating, comment } = await request.json()

    // Support both old format (clientId/cleanerId) and new format (reviewerId/revieweeId)
    const isOldFormat = !reviewerType
    const actualReviewerType = reviewerType || 'client'
    const actualReviewerId = reviewerId || (await request.clone().json()).clientId
    const actualRevieweeId = revieweeId || (await request.clone().json()).cleanerId

    if (!jobId || !rating) {
      return NextResponse.json({ success: false, error: "Sva polja su obavezna" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Ocjena mora biti izmedu 1 i 5" }, { status: 400 })
    }

    const sql = getSQL()

    // Verify the job exists and is completed
    const job = await sql`
      SELECT id, client_id, cleaner_id, status FROM jobs WHERE id = ${jobId}
    `
    
    if (job.length === 0) {
      return NextResponse.json({ success: false, error: "Posao nije pronaden" }, { status: 404 })
    }
    
    // Determine reviewer and reviewee based on type
    let reviewerIdFinal: number
    let revieweeIdFinal: number
    let revieweeType: string
    
    if (actualReviewerType === 'client') {
      // Client reviewing cleaner (original flow)
      reviewerIdFinal = isOldFormat ? parseInt((await request.clone().json()).clientId) : parseInt(actualReviewerId)
      revieweeIdFinal = isOldFormat ? parseInt((await request.clone().json()).cleanerId) : parseInt(actualRevieweeId)
      revieweeType = 'cleaner'
      
      if (job[0].client_id !== reviewerIdFinal) {
        return NextResponse.json({ success: false, error: "Nemate dozvolu za recenziju ovog posla" }, { status: 403 })
      }
    } else {
      // Cleaner reviewing client (new flow)
      reviewerIdFinal = parseInt(actualReviewerId)
      revieweeIdFinal = parseInt(actualRevieweeId)
      revieweeType = 'client'
      
      if (job[0].cleaner_id !== reviewerIdFinal) {
        return NextResponse.json({ success: false, error: "Nemate dozvolu za recenziju ovog posla" }, { status: 403 })
      }
    }
    
    if (job[0].status !== 'completed' && job[0].status !== 'reviewed') {
      return NextResponse.json({ success: false, error: "Mozete ocijeniti samo zavrsene poslove" }, { status: 400 })
    }

    // Check if this specific review already exists (same reviewer for same job)
    const existingReview = await sql`
      SELECT id FROM reviews 
      WHERE job_id = ${jobId} 
      AND reviewer_type = ${actualReviewerType}
    `
    if (existingReview.length > 0) {
      return NextResponse.json({ success: false, error: "Vec ste ocijenili ovaj posao" }, { status: 400 })
    }

    // Create review with new bidirectional fields
    if (actualReviewerType === 'client') {
      // Client reviewing cleaner - use original columns for backward compatibility
      await sql`
        INSERT INTO reviews (job_id, cleaner_id, client_id, rating, comment, reviewer_type, reviewee_id, reviewee_type)
        VALUES (${jobId}, ${revieweeIdFinal}, ${reviewerIdFinal}, ${rating}, ${comment || null}, 'client', ${revieweeIdFinal}, 'cleaner')
      `
      
      // Recalculate cleaner's average rating
      const avgRating = await sql`
        SELECT AVG(rating)::numeric(2,1) as avg_rating, COUNT(*) as count 
        FROM reviews WHERE cleaner_id = ${revieweeIdFinal} AND reviewer_type = 'client'
      `
      
      if (avgRating.length > 0 && avgRating[0].avg_rating) {
        await sql`
          UPDATE users SET rating = ${avgRating[0].avg_rating}, review_count = ${avgRating[0].count} WHERE id = ${revieweeIdFinal}
        `
      }
    } else {
      // Cleaner reviewing client
      await sql`
        INSERT INTO reviews (job_id, cleaner_id, client_id, rating, comment, reviewer_type, reviewee_id, reviewee_type)
        VALUES (${jobId}, ${reviewerIdFinal}, ${revieweeIdFinal}, ${rating}, ${comment || null}, 'cleaner', ${revieweeIdFinal}, 'client')
      `
      
      // Recalculate client's average rating
      const avgRating = await sql`
        SELECT AVG(rating)::numeric(2,1) as avg_rating, COUNT(*) as count 
        FROM reviews WHERE reviewee_id = ${revieweeIdFinal} AND reviewee_type = 'client'
      `
      
      if (avgRating.length > 0 && avgRating[0].avg_rating) {
        await sql`
          UPDATE users SET client_rating = ${avgRating[0].avg_rating}, client_review_count = ${avgRating[0].count} WHERE id = ${revieweeIdFinal}
        `
      }
    }

    // Update job status to reviewed only if client reviewed
    if (actualReviewerType === 'client') {
      await sql`UPDATE jobs SET status = 'reviewed' WHERE id = ${jobId}`
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greska"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// Get reviews for a user (cleaner or client)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cleanerId = searchParams.get("cleanerId")
    const clientId = searchParams.get("clientId")
    const jobId = searchParams.get("jobId")
    const reviewerType = searchParams.get("reviewerType")

    const sql = getSQL()

    // Check if a specific review exists for a job
    if (jobId && reviewerType) {
      const existing = await sql`
        SELECT id FROM reviews WHERE job_id = ${parseInt(jobId)} AND reviewer_type = ${reviewerType}
      `
      return NextResponse.json({ exists: existing.length > 0 })
    }
    
    // Get reviews for a cleaner (reviews left by clients)
    if (cleanerId) {
      const reviews = await sql`
        SELECT r.*, u.full_name as reviewer_name
        FROM reviews r
        JOIN users u ON r.client_id = u.id
        WHERE r.cleaner_id = ${parseInt(cleanerId)} AND r.reviewer_type = 'client'
        ORDER BY r.created_at DESC
      `
      return NextResponse.json({ reviews })
    }
    
    // Get reviews for a client (reviews left by cleaners)
    if (clientId) {
      const reviews = await sql`
        SELECT r.*, u.full_name as reviewer_name
        FROM reviews r
        JOIN users u ON u.id = (SELECT cleaner_id FROM reviews WHERE id = r.id)
        WHERE r.reviewee_id = ${parseInt(clientId)} AND r.reviewee_type = 'client'
        ORDER BY r.created_at DESC
      `
      return NextResponse.json({ reviews })
    }

    return NextResponse.json({ reviews: [] })
  } catch {
    return NextResponse.json({ reviews: [] })
  }
}
