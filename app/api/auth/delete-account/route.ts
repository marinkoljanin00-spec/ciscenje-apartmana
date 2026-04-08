import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const SESSION_COOKIE = 'marketplace_session'

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

    const parsedId = parseInt(userId, 10)
    const sql = getSQL()

    // Delete user images from Cloudinary
    const userImages = await sql`
      SELECT profile_image, image_pending FROM users WHERE id = ${parsedId}
    `

    if (userImages.length > 0) {
      const { profile_image, image_pending } = userImages[0]
      
      const extractPublicId = (url: string) => {
        const parts = url.split('/')
        const filename = parts[parts.length - 1].split('.')[0]
        const folder = parts[parts.length - 2]
        return `${folder}/${filename}`
      }

      if (profile_image) {
        try { await cloudinary.uploader.destroy(extractPublicId(profile_image)) } catch {}
      }
      if (image_pending) {
        try { await cloudinary.uploader.destroy(extractPublicId(image_pending)) } catch {}
      }
    }

    // Delete all reviews by or about this user
    await sql`DELETE FROM reviews WHERE cleaner_id = ${parsedId} OR client_id = ${parsedId}`

    // Delete all applications by this user
    await sql`DELETE FROM applications WHERE cleaner_id = ${parsedId}`

    // Delete all jobs by this user (and their applications)
    const userJobs = await sql`SELECT id FROM jobs WHERE client_id = ${parsedId}`
    for (const job of userJobs) {
      await sql`DELETE FROM applications WHERE job_id = ${job.id}`
      await sql`DELETE FROM reviews WHERE job_id = ${job.id}`
    }
    await sql`DELETE FROM jobs WHERE client_id = ${parsedId}`

    // Finally delete the user
    await sql`DELETE FROM users WHERE id = ${parsedId}`

    // Clear session cookie
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Greška pri brisanju'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
