import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

function getSQL() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
  return neon(process.env.DATABASE_URL)
}

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email i kod su obavezni' }, { status: 400 })
    }

    const sql = getSQL()
    const users = await sql`
      SELECT id, verification_code, verification_expires 
      FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'Korisnik nije pronađen' }, { status: 404 })
    }

    const user = users[0]

    if (!user.verification_code || user.verification_code !== code) {
      return NextResponse.json({ success: false, error: 'Pogrešan kod' }, { status: 400 })
    }

    if (new Date() > new Date(user.verification_expires)) {
      return NextResponse.json({ success: false, error: 'Kod je istekao. Zatraži novi.' }, { status: 400 })
    }

    await sql`
      UPDATE users 
      SET email_verified = TRUE, 
          verification_code = NULL, 
          verification_expires = NULL
      WHERE email = ${email}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Nepoznata greška'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
