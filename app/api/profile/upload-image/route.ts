import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function getSQL() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
  return neon(process.env.DATABASE_URL)
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    // DEBUG: Return early with all received data
    return NextResponse.json({
      debug: true,
      fileExists: !!file,
      fileSize: file?.size,
      fileName: file?.name,
      userId: userId,
      userIdType: typeof userId,
      parsedId: parseInt(userId, 10),
      isNaN: isNaN(parseInt(userId, 10))
    }, { status: 200 })

    if (!file || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: `Nedostaju podaci: file=${!!file}, userId=${userId}` 
      }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: 'Slika ne smije biti veća od 5MB' 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'tvojcistac/pending',
      transformation: [{ width: 400, height: 400, crop: 'fill' }]
    })

    const sql = getSQL()
    
    const parsedId = parseInt(userId, 10)
    if (isNaN(parsedId)) {
      return NextResponse.json({ 
        success: false, 
        error: `Nevažeći userId: "${userId}"` 
      }, { status: 400 })
    }

    const updateResult = await sql`
      UPDATE users 
      SET image_pending = ${result.secure_url}, 
          image_verified = FALSE
      WHERE id = ${parsedId}
      RETURNING id, email, image_pending
    `

    if (!updateResult || updateResult.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Korisnik s ID ${parsedId} nije pronađen. Cloudinary URL: ${result.secure_url}` 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url,
      savedForUser: updateResult[0].email
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Greška pri uploadu'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
