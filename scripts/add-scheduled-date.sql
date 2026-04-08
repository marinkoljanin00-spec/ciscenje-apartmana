-- Add scheduled_date column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS scheduled_date DATE;
