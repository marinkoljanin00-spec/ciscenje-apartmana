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

    // Get full data for admin panel
    const [users, jobs, reviews, tickets] = await Promise.all([
      sql`SELECT id, email, full_name, role, phone, city, bio, rating, total_earned, 
                 profile_image, image_verified, image_pending, created_at 
          FROM users ORDER BY created_at DESC`,
      sql`SELECT j.*, u.full_name as client_name, c.full_name as cleaner_name
          FROM jobs j
          LEFT JOIN users u ON j.client_id = u.id
          LEFT JOIN users c ON j.cleaner_id = c.id
          ORDER BY j.created_at DESC`,
      sql`SELECT r.*, u.full_name as reviewer_name, c.full_name as cleaner_name
          FROM reviews r
          LEFT JOIN users u ON r.client_id = u.id
          LEFT JOIN users c ON r.cleaner_id = c.id
          ORDER BY r.created_at DESC`,
      sql`SELECT * FROM support_tickets ORDER BY created_at DESC`
    ])

    // Top cleaners
    const topCleaners = await sql`
      SELECT u.id, u.full_name, 
        COALESCE(u.rating, 0) as rating,
        (SELECT COUNT(*) FROM reviews WHERE cleaner_id = u.id) as review_count,
        COALESCE(u.total_earned, 0) as total_earned
      FROM users u
      WHERE u.role = 'cleaner'
      ORDER BY u.rating DESC NULLS LAST
      LIMIT 5
    `

    return NextResponse.json({
      users,
      jobs,
      reviews,
      tickets,
      topCleaners
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Greška pri dohvaćanju podataka' }, { status: 500 })
  }
}
