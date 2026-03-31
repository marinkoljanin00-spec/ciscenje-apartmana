-- Add cleaner_id to jobs table for tracking which cleaner accepted the job
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cleaner_id INTEGER REFERENCES users(id);

-- Add profile fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS description TEXT;

-- Update status column to support new statuses
-- Status options: 'open', 'waiting_for_client', 'confirmed', 'rejected'
