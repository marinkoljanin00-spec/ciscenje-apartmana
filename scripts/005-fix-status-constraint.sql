-- Drop existing check constraint if exists
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- Add new check constraint with all valid statuses
ALTER TABLE jobs ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('open', 'closed', 'in_progress', 'accepted', 'waiting_for_client', 'confirmed', 'completed', 'cancelled'));

-- Also update applications status constraint
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled'));
