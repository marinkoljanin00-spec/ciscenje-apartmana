import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  const sql = neon(process.env.DATABASE_URL)
  
  const passwordHash = await bcrypt.hash('SjajGazda99', 10)
  
  const existing = await sql`
    SELECT id FROM users WHERE email = 'admin@tvojcistac.com'
  `
  
  if (existing.length > 0) {
    console.log('Admin already exists')
    return
  }
  
  await sql`
    INSERT INTO users (email, password_hash, full_name, role, created_at, email_verified)
    VALUES ('admin@tvojcistac.com', ${passwordHash}, 'Administrator', 'admin', NOW(), TRUE)
  `
  console.log('Admin created successfully')
}

createAdmin()
