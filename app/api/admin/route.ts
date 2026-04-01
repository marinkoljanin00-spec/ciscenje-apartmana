import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const ADMIN_KEY = 'SjajGazda99'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const adminKey = searchParams.get('adminKey')

    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Pristup odbijen' }, { status: 401 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Get stats
    const [usersResult] = await sql`SELECT COUNT(*) as total FROM users`
    const [cleanersResult] = await sql`SELECT COUNT(*) as total FROM users WHERE role = 'cleaner'`
    const [clientsResult] = await sql`SELECT COUNT(*) as total FROM users WHERE role = 'client'`
    const [jobsResult] = await sql`SELECT COUNT(*) as total FROM jobs`
    const [completedJobsResult] = await sql`SELECT COUNT(*) as total FROM jobs WHERE status = 'completed' OR status = 'reviewed'`
    const [revenueResult] = await sql`SELECT COALESCE(SUM(price), 0) as total FROM jobs WHERE status = 'completed' OR status = 'reviewed'`
    const [ticketsResult] = await sql`SELECT COUNT(*) as total FROM support_tickets WHERE status = 'open'`
    const [avgRatingResult] = await sql`SELECT COALESCE(AVG(rating), 0) as avg FROM reviews`

    // Recent jobs
    const recentJobs = await sql`
      SELECT j.id, j.title, j.price, j.status, j.created_at, u.full_name as client_name
      FROM jobs j
      LEFT JOIN users u ON j.client_id = u.id
      ORDER BY j.created_at DESC
      LIMIT 10
    `

    // Top cleaners
    const topCleaners = await sql`
      SELECT u.id, u.full_name, 
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(DISTINCT r.id) as review_count
      FROM users u
      LEFT JOIN reviews r ON u.id = r.cleaner_id
      WHERE u.role = 'cleaner'
      GROUP BY u.id, u.full_name
      ORDER BY rating DESC
      LIMIT 5
    `

    return NextResponse.json({
      stats: {
        totalUsers: Number(usersResult.total),
        totalCleaners: Number(cleanersResult.total),
        totalClients: Number(clientsResult.total),
        totalJobs: Number(jobsResult.total),
        completedJobs: Number(completedJobsResult.total),
        totalRevenue: Number(revenueResult.total),
        openTickets: Number(ticketsResult.total),
        avgRating: Number(avgRatingResult.avg).toFixed(1)
      },
      recentJobs,
      topCleaners
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}
