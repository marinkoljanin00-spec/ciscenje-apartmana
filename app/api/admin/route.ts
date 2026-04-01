import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const adminKey = searchParams.get('adminKey')
    
    if (adminKey !== 'SjajGazda99') {
      return NextResponse.json({ error: 'Neovlašten pristup' }, { status: 401 })
    }

    // Get stats
    const [users, jobs, reviews, tickets] = await Promise.all([
      sql`SELECT role, COUNT(*) as count FROM users GROUP BY role`,
      sql`SELECT status, COUNT(*) as count, COALESCE(SUM(price), 0) as total FROM jobs GROUP BY status`,
      sql`SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as avg_rating FROM reviews`,
      sql`SELECT status, COUNT(*) as count FROM support_tickets GROUP BY status`
    ])

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
        COUNT(DISTINCT r.id) as review_count,
        COALESCE(SUM(j.price), 0) as total_earned
      FROM users u
      LEFT JOIN reviews r ON u.id = r.cleaner_id
      LEFT JOIN jobs j ON u.id = j.cleaner_id AND j.status = 'reviewed'
      WHERE u.role = 'cleaner'
      GROUP BY u.id, u.full_name
      ORDER BY rating DESC
      LIMIT 5
    `

    return NextResponse.json({
      users,
      jobs,
      reviews: reviews[0],
      tickets,
      recentJobs,
      topCleaners
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Greška pri dohvaćanju podataka' }, { status: 500 })
  }
}
