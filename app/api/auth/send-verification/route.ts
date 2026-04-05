import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function getSQL() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
  return neon(process.env.DATABASE_URL)
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email je obavezan' }, { status: 400 })
    }

    const sql = getSQL()
    const users = await sql`SELECT id, full_name FROM users WHERE email = ${email}`
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'Korisnik nije pronađen' }, { status: 404 })
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 15 * 60 * 1000)

    await sql`
      UPDATE users 
      SET verification_code = ${code}, verification_expires = ${expires.toISOString()}
      WHERE email = ${email}
    `

    await resend.emails.send({
      from: 'TvojČistač <onboarding@resend.dev>',
      to: email,
      subject: 'Verifikacija email adrese — TvojČistač',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #050505; color: #ffffff; border-radius: 16px;">
          <h2 style="color: #10b981; margin-bottom: 8px;">TvojČistač</h2>
          <p style="color: #a3a3a3; margin-bottom: 24px;">Hvala što si se registrirao!</p>
          <p style="color: #ffffff; margin-bottom: 16px;">Tvoj verifikacijski kod je:</p>
          <div style="background: #111111; border: 1px solid #10b981; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 800; color: #10b981; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="color: #737373; font-size: 13px;">Kod vrijedi 15 minuta. Ako nisi ti, zanemari ovaj email.</p>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Nepoznata greška'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
