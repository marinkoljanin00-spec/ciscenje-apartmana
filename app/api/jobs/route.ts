import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = 'nodejs'

const SESSION_COOKIE = "marketplace_session"

function getSQL() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }
  return neon(databaseUrl)
}

async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE)
    
    if (!sessionCookie?.value) {
      return null
    }
    
    const [userId] = sessionCookie.value.split(":")
    if (!userId) {
      return null
    }
    
    const sql = getSQL()
    const users = await sql`
      SELECT id, email, full_name, role, created_at 
      FROM users WHERE id = ${parseInt(userId, 10)}
    `
    
    if (users.length === 0) {
      return null
    }
    
    return users[0]
  } catch {
    return null
  }
}

// Get jobs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const userId = searchParams.get("userId")
    const filterUrgent = searchParams.get("urgent")
    const filterType = searchParams.get("propertyType")
    // City filtering is done client-side for performance

    // Try to get user from cookie first, then fall back to userId param
    let clientId: number | null = null
    const user = await getCurrentUser()
    if (user) {
      clientId = user.id
    } else if (userId) {
      clientId = parseInt(userId, 10)
    }

    const sql = getSQL()

    if (role === "client" && clientId) {
      // Return client's own jobs with application count
      const jobs = await sql`
        SELECT j.id, j.title, j.location, j.price, j.status, j.created_at, j.cleaner_id,
               j.property_type, j.is_urgent, j.description, j.city,
               u.full_name as cleaner_name, u.phone as cleaner_phone, u.email as cleaner_email,
               (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
        FROM jobs j
        LEFT JOIN users u ON j.cleaner_id = u.id
        WHERE j.client_id = ${clientId}
        ORDER BY j.is_urgent DESC, j.created_at DESC
        LIMIT 50
      `
      return NextResponse.json({ jobs })
    } else {
      // Return all open jobs for cleaners with filters (city filtered client-side)
      const isUrgentFilter = filterUrgent === 'true'
      
      let jobs;
      if (isUrgentFilter && filterType) {
        jobs = await sql`
          SELECT j.id, j.title, j.location, j.price, j.status, j.created_at, j.property_type, j.is_urgent, j.description, j.city,
                 u.full_name as client_name, u.client_rating, u.image_verified as client_image_verified
          FROM jobs j JOIN users u ON j.client_id = u.id
          WHERE j.status = 'open' AND j.is_urgent = true AND j.property_type = ${filterType}
          ORDER BY j.created_at DESC
          LIMIT 50
        `
      } else if (isUrgentFilter) {
        jobs = await sql`
          SELECT j.id, j.title, j.location, j.price, j.status, j.created_at, j.property_type, j.is_urgent, j.description, j.city,
                 u.full_name as client_name, u.client_rating, u.image_verified as client_image_verified
          FROM jobs j JOIN users u ON j.client_id = u.id
          WHERE j.status = 'open' AND j.is_urgent = true
          ORDER BY j.created_at DESC
          LIMIT 50
        `
      } else if (filterType) {
        jobs = await sql`
          SELECT j.id, j.title, j.location, j.price, j.status, j.created_at, j.property_type, j.is_urgent, j.description, j.city,
                 u.full_name as client_name, u.client_rating, u.image_verified as client_image_verified
          FROM jobs j JOIN users u ON j.client_id = u.id
          WHERE j.status = 'open' AND j.property_type = ${filterType}
          ORDER BY j.is_urgent DESC, j.created_at DESC
          LIMIT 50
        `
      } else {
        jobs = await sql`
          SELECT j.id, j.title, j.location, j.price, j.status, j.created_at, j.property_type, j.is_urgent, j.description, j.city,
                 u.full_name as client_name, u.client_rating, u.image_verified as client_image_verified
          FROM jobs j JOIN users u ON j.client_id = u.id
          WHERE j.status = 'open'
          ORDER BY j.is_urgent DESC, j.created_at DESC
          LIMIT 50
        `
      }
      return NextResponse.json({ jobs })
    }
  } catch {
    return NextResponse.json({ jobs: [] })
  }
}

// Create a new job
export async function POST(request: Request) {
  try {
    const { title, location, price, userId, propertyType, isUrgent, description, latitude, longitude, city, scheduledDate } = await request.json()

    // Try to get user from cookie first, then fall back to userId from body
    let clientId: number | null = null
    const user = await getCurrentUser()
    if (user) {
      clientId = user.id
    } else if (userId) {
      clientId = parseInt(userId, 10)
    }

    if (!clientId) {
      return NextResponse.json({ success: false, error: "Niste prijavljeni." }, { status: 401 })
    }

    if (!title || !location || isNaN(price)) {
      return NextResponse.json({ success: false, error: "Sva polja su obavezna." }, { status: 400 })
    }

    // Calculate final price (1.5x for urgent)
    const finalPrice = isUrgent ? price * 1.5 : price

    const sql = getSQL()
    const result = await sql`
      INSERT INTO jobs (title, location, price, status, client_id, property_type, is_urgent, description, latitude, longitude, city, scheduled_date, created_at)
      VALUES (${title}, ${location}, ${finalPrice}, 'open', ${clientId}, ${propertyType || 'stan'}, ${isUrgent || false}, ${description || null}, ${latitude || null}, ${longitude || null}, ${city || null}, ${scheduledDate || null}, NOW())
      RETURNING id, title, location, price, status, property_type, is_urgent, city, scheduled_date, created_at
    `

    // Update client's total_spent
    await sql`UPDATE users SET total_spent = total_spent + ${finalPrice} WHERE id = ${clientId}`

    // Send push notifications to all cleaners
    try {
      const { sendPushNotification } = await import('@/lib/push');
      const cleanerSubs = await sql`
        SELECT ps.subscription FROM push_subscriptions ps
        JOIN users u ON ps.user_id = u.id
        WHERE u.role = 'cleaner'
      `;
      const jobTitle = result[0].title;
      const jobCity = result[0].city || '';
      const jobPrice = result[0].price;
      await Promise.all(
        cleanerSubs.map((row: any) =>
          sendPushNotification(
            row.subscription,
            '🧹 Novi posao dostupan!',
            `${jobTitle}${jobCity ? ' · ' + jobCity : ''} · €${Number(jobPrice).toFixed(0)}/h`,
            '/'
          )
        )
      );
    } catch (e) {
      console.error('Push notification error:', e);
    }

    return NextResponse.json({ success: true, job: result[0] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// Delete a job
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")
    const userId = searchParams.get("userId")

    if (!jobId) {
      return NextResponse.json({ success: false, error: "jobId je obavezan" }, { status: 400 })
    }

    const sql = getSQL()
    
    // Verify ownership
    const job = await sql`SELECT client_id, price FROM jobs WHERE id = ${parseInt(jobId)}`
    if (job.length === 0) {
      return NextResponse.json({ success: false, error: "Posao nije pronađen" }, { status: 404 })
    }
    
    if (job[0].client_id !== parseInt(userId || '0')) {
      return NextResponse.json({ success: false, error: "Nemate dozvolu za brisanje ovog posla" }, { status: 403 })
    }

    // Delete job (applications will be cascade deleted)
    await sql`DELETE FROM jobs WHERE id = ${parseInt(jobId)}`

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
