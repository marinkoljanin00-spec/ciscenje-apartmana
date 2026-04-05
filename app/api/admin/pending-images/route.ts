import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

function getSQL() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
  return neon(process.env.DATABASE_URL)
}

export async function GET() {
  try {
    const sql = getSQL()
    const users = await sql`
      SELECT id, email, full_name, role, image_pending
      FROM users
      WHERE image_pending IS NOT NULL
      ORDER BY id DESC
    `
    return NextResponse.json({ users })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Greška'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
