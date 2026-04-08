import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  const { subscription, userId } = await req.json();
  
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      subscription JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  await sql`
    INSERT INTO push_subscriptions (user_id, subscription)
    VALUES (${userId}, ${JSON.stringify(subscription)})
    ON CONFLICT DO NOTHING
  `;
  
  return NextResponse.json({ success: true });
}
