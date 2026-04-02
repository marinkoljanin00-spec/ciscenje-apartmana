-- Add city column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Add city column to jobs table  
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Create index for faster city filtering
CREATE INDEX IF NOT EXISTS idx_jobs_city ON jobs(city);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
