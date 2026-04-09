import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'marketplace_session'

function getSQL() {
  return neon(process.env.DATABASE_URL!)
}

async function getUserId() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session?.value) return null
  return parseInt(session.value.split(':')[0])
}

// GET — fetch all templates for current client
export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 })
  const sql = getSQL()
  await sql`
    CREATE TABLE IF NOT EXISTS job_templates (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR NOT NULL,
      location VARCHAR,
      city VARCHAR,
      price NUMERIC,
      property_type VARCHAR,
      is_urgent BOOLEAN DEFAULT false,
      description TEXT,
      latitude NUMERIC,
      longitude NUMERIC,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  const templates = await sql`
    SELECT * FROM job_templates WHERE client_id = ${userId} ORDER BY created_at DESC
  `
  return NextResponse.json({ templates })
}

// POST — save new template
export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 })
  const sql = getSQL()
  const { title, location, city, price, property_type, is_urgent, description, latitude, longitude } = await request.json()
  const result = await sql`
    INSERT INTO job_templates (client_id, title, location, city, price, property_type, is_urgent, description, latitude, longitude)
    VALUES (${userId}, ${title}, ${location}, ${city}, ${price}, ${property_type}, ${is_urgent || false}, ${description}, ${latitude}, ${longitude})
    RETURNING *
  `
  return NextResponse.json({ template: result[0] })
}

// DELETE — remove a template
export async function DELETE(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 })
  const sql = getSQL()
  const { searchParams } = new URL(request.url)
  const templateId = searchParams.get('id')
  await sql`DELETE FROM job_templates WHERE id = ${templateId} AND client_id = ${userId}`
  return NextResponse.json({ success: true })
}
