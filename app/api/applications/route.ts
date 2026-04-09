import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

function getSQL() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error("DATABASE_URL is not set")
  return neon(databaseUrl)
}

function getCleanerBadge(completedJobs: number, rating: number): string | null {
  if (completedJobs >= 15 && rating >= 4.8) return 'premium'
  if (completedJobs >= 5 && rating >= 4.5) return 'iskusan'
  return null
}

// Get applications for a job or for a cleaner
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")
    const cleanerId = searchParams.get("cleanerId")
    
    const sql = getSQL()
    
    if (jobId) {
      // Get all applications for a specific job (for client view)
      const applications = await sql`
        SELECT a.*, u.full_name as cleaner_name, u.rating, u.phone, u.email, u.bio, u.image_verified,
               (SELECT COUNT(*)::int FROM applications a2 
                JOIN jobs j ON a2.job_id = j.id 
                WHERE a2.cleaner_id = u.id AND a2.status = 'accepted' 
                AND j.status IN ('completed', 'reviewed')) as completed_jobs
        FROM applications a
        JOIN users u ON a.cleaner_id = u.id
        WHERE a.job_id = ${parseInt(jobId)}
        ORDER BY a.created_at DESC
        LIMIT 100
      `
      // Add badge to each application
      const applicationsWithBadge = applications.map((app: any) => ({
        ...app,
        badge: getCleanerBadge(app.completed_jobs || 0, parseFloat(app.rating) || 0)
      }))
      return NextResponse.json({ applications: applicationsWithBadge })
    } else if (cleanerId) {
      // Get all applications by a cleaner (for cleaner view)
      const applications = await sql`
        SELECT a.*, j.title, j.location, j.price, j.status as job_status, j.is_urgent,
               j.client_id,
               u.full_name as client_name, u.phone as client_phone, u.email as client_email
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN users u ON j.client_id = u.id
        WHERE a.cleaner_id = ${parseInt(cleanerId)}
        ORDER BY a.created_at DESC
        LIMIT 100
      `
      return NextResponse.json({ applications })
    }
    
    return NextResponse.json({ applications: [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Create a new application (cleaner applies to job)
export async function POST(request: Request) {
  try {
    const { jobId, cleanerId, message } = await request.json()
    
    if (!jobId || !cleanerId) {
      return NextResponse.json({ error: "jobId i cleanerId su obavezni" }, { status: 400 })
    }
    
    const sql = getSQL()
    
    // Check if already applied
    const existing = await sql`
      SELECT id FROM applications WHERE job_id = ${jobId} AND cleaner_id = ${cleanerId}
    `
    if (existing.length > 0) {
      return NextResponse.json({ error: "Već ste se prijavili na ovaj posao" }, { status: 400 })
    }
    
    // Create application
    await sql`
      INSERT INTO applications (job_id, cleaner_id, message, status)
      VALUES (${jobId}, ${cleanerId}, ${message || null}, 'pending')
    `
    
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nepoznata greška"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
