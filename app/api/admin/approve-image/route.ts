import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import webpush from 'web-push'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

function getSQL() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
  return neon(process.env.DATABASE_URL)
}

export async function POST(request: Request) {
  try {
    const { userId, approve } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId je obavezan' }, { status: 400 })
    }

    const sql = getSQL()

    if (approve) {
      await sql`
        UPDATE users 
        SET profile_image = image_pending,
            image_pending = NULL,
            image_verified = TRUE
        WHERE id = ${parseInt(userId)}
      `
      
      // Send push notification to user
      const subs = await sql`SELECT subscription FROM push_subscriptions WHERE user_id = ${parseInt(userId)}`
      for (const row of subs) {
        try {
          await webpush.sendNotification(row.subscription, JSON.stringify({
            title: 'Badge verifikacije aktivan! ✓',
            body: 'Vaša profilna slika je odobrena. Sada imate badge verifikacije na profilu.',
            icon: '/icon-192.png'
          }))
        } catch (e) { /* expired subscription, ignore */ }
      }
    } else {
      await sql`
        UPDATE users 
        SET image_pending = NULL,
            image_verified = FALSE
        WHERE id = ${parseInt(userId)}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Greška'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
