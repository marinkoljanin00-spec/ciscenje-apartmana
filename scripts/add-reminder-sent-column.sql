-- Add reminder_sent column to jobs table for cron reminders
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;
