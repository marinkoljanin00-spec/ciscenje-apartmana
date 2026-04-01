import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const ADMIN_KEY = 'SjajGazda99'

// POST - Create support ticket
export async function POST(req: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const { name, email, subject, message, userId } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Sva polja su obavezna' }, { status: 400 })
    }

    await sql`
      INSERT INTO support_tickets (name, email, subject, message, user_id, status)
      VALUES (${name}, ${email}, ${subject || 'other'}, ${message}, ${userId || null}, 'open')
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Support ticket error:', error)
    return NextResponse.json({ error: 'Greška pri slanju prijave' }, { status: 500 })
  }
}

// GET - Get all tickets (admin only)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const adminKey = searchParams.get('adminKey')

    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Pristup odbijen' }, { status: 401 })
    }

    const sql = neon(process.env.DATABASE_URL!)
    const tickets = await sql`
      SELECT * FROM support_tickets 
      ORDER BY created_at DESC
    `

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}

// PATCH - Update ticket status (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const { ticketId, status, adminKey } = await req.json()

    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Pristup odbijen' }, { status: 401 })
    }

    const sql = neon(process.env.DATABASE_URL!)
    await sql`
      UPDATE support_tickets 
      SET status = ${status}
      WHERE id = ${ticketId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update ticket error:', error)
    return NextResponse.json({ error: 'Greška' }, { status: 500 })
  }
}
