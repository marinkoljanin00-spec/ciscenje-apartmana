import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const { jobId, base64, type, uploadedBy } = await request.json()
    // type: 'space' | 'before' | 'after'

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'job-photos',
      transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }]
    })

    await sql`
      CREATE TABLE IF NOT EXISTS job_photos (
        id SERIAL PRIMARY KEY,
        job_id INTEGER,
        url TEXT NOT NULL,
        type VARCHAR(20) NOT NULL,
        uploaded_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      INSERT INTO job_photos (job_id, url, type, uploaded_by)
      VALUES (${jobId}, ${result.secure_url}, ${type}, ${uploadedBy})
    `

    return NextResponse.json({ success: true, url: result.secure_url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Greška'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const sql = neon(process.env.DATABASE_URL!)
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')
  const photos = await sql`
    SELECT * FROM job_photos WHERE job_id = ${parseInt(jobId || '0')} ORDER BY created_at ASC
  `
  return NextResponse.json({ photos })
}
