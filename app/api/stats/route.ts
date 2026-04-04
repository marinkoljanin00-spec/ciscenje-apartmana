import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

function getSQL() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error("DATABASE_URL is not set")
  return neon(databaseUrl)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const role = searchParams.get("role")
    
    const sql = getSQL()

    if (!userId) {
      const totalClients = await sql`
        SELECT COUNT(*) as count FROM users WHERE role = 'client'
      `
      const totalCleaners = await sql`
        SELECT COUNT(*) as count FROM users WHERE role = 'cleaner'
      `
      const avgRating = await sql`
        SELECT AVG(rating)::numeric(2,1) as avg FROM reviews 
        WHERE reviewer_type = 'client'
      `
      return NextResponse.json({
        totalClients: totalClients[0]?.count || 0,
        totalCleaners: totalCleaners[0]?.count || 0,
        avgRating: avgRating[0]?.avg || 5.0
      })
    }
    
    if (role === "client") {
      // Client stats
      const totalJobs = await sql`SELECT COUNT(*) as count FROM jobs WHERE client_id = ${parseInt(userId)}`
      const activeApplications = await sql`
        SELECT COUNT(DISTINCT a.job_id) as count 
        FROM applications a 
        JOIN jobs j ON a.job_id = j.id 
        WHERE j.client_id = ${parseInt(userId)} AND a.status = 'pending'
      `
      const totalSpent = await sql`SELECT total_spent FROM users WHERE id = ${parseInt(userId)}`
      
      return NextResponse.json({
        totalJobs: totalJobs[0]?.count || 0,
        activeApplications: activeApplications[0]?.count || 0,
        totalSpent: totalSpent[0]?.total_spent || 0
      })
    } else {
      // Cleaner stats
      const completedJobs = await sql`
        SELECT COUNT(*) as count 
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.cleaner_id = ${parseInt(userId)} 
        AND a.status = 'accepted'
        AND j.status IN ('completed', 'reviewed')
      `
      const pendingApplications = await sql`
        SELECT COUNT(*) as count FROM applications WHERE cleaner_id = ${parseInt(userId)} AND status = 'pending'
      `
      const totalEarned = await sql`SELECT total_earned, rating FROM users WHERE id = ${parseInt(userId)}`
      
      return NextResponse.json({
        completedJobs: completedJobs[0]?.count || 0,
        pendingApplications: pendingApplications[0]?.count || 0,
        totalEarned: totalEarned[0]?.total_earned || 0,
        rating: totalEarned[0]?.rating || 5.0
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
