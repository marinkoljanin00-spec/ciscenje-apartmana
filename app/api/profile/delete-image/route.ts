import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

function getSQL() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
  return neon(process.env.DATABASE_URL)
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId je obavezan' }, { status: 400 })
    }

    const sql = getSQL()
    await sql`
      UPDATE users 
      SET profile_image = NULL,
          image_pending = NULL,
          image_verified = FALSE
      WHERE id = ${parseInt(userId, 10)}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Greška'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
