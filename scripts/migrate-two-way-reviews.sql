-- Migration: Two-way reviews system
-- This migration adds support for cleaners to review clients
-- Run this script on the Neon database

-- Add client rating columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS client_rating NUMERIC(2,1) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS client_review_count INTEGER DEFAULT 0;

-- Add reviewer_type to identify who is reviewing (client or cleaner)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_type VARCHAR(10) DEFAULT 'client';

-- Add reviewee columns to know who is being reviewed
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewee_id INTEGER;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewee_type VARCHAR(10) DEFAULT 'cleaner';

-- Update existing reviews to set reviewee_id (the cleaner_id is the reviewee for client reviews)
UPDATE reviews SET reviewee_id = cleaner_id, reviewee_type = 'cleaner' WHERE reviewee_id IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_type ON reviews(reviewer_type);

-- Done! The reviews table now supports:
-- reviewer_type = 'client' | 'cleaner' (who is leaving the review)
-- reviewee_type = 'client' | 'cleaner' (who is being reviewed)
-- reviewee_id = user id of the person being reviewed
