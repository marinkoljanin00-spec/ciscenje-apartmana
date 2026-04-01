import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

// POST - Create support ticket
export async function POST(req: Request) {
  try {
    const { name, email, subject, message, userId } = await req.json()
    
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Nedostaju obavezni podaci' }, { status: 400 })
    }

    await sql`
      INSERT INTO support_tickets (user_id, name, email, subject, message, status)
      VALUES (${userId || null}, ${name}, ${email}, ${subject || 'other'}, ${message}, 'open')
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Support ticket error:', error)
    return NextResponse.json({ error: 'Greška pri slanju prijave' }, { status: 500 })
  }
}

// GET - Get all tickets (admin only)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const adminKey = searchParams.get('adminKey')
    
    if (adminKey !== 'SjajGazda99') {
      return NextResponse.json({ error: 'Neovlašten pristup' }, { status: 401 })
    }

    const tickets = await sql`
      SELECT * FROM support_tickets 
      ORDER BY created_at DESC
    `

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json({ error: 'Greška pri dohvaćanju prijava' }, { status: 500 })
  }
}

// PATCH - Update ticket status
export async function PATCH(req: Request) {
  try {
    const { ticketId, status, adminKey } = await req.json()
    
    if (adminKey !== 'SjajGazda99') {
      return NextResponse.json({ error: 'Neovlašten pristup' }, { status: 401 })
    }

    await sql`UPDATE support_tickets SET status = ${status} WHERE id = ${ticketId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update ticket error:', error)
    return NextResponse.json({ error: 'Greška pri ažuriranju' }, { status: 500 })
  }
}
