-- Add new columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS property_type TEXT DEFAULT 'stan';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS rating DECIMAL(2, 1) DEFAULT 5.0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create applications table for cleaners applying to jobs
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  cleaner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, cleaner_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_cleaner_id ON applications(cleaner_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_urgent ON jobs(is_urgent);
