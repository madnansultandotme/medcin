-- Migration: Fix services duration field type from text to integer
-- This migration updates the duration column to store minutes as an integer

-- Step 1: Add new integer column
ALTER TABLE services ADD COLUMN duration_new INTEGER;

-- Step 2: Convert existing text values to integers (if any exist)
-- Assuming format like "30 minutes" or "1 hour" or just "30"
UPDATE services 
SET duration_new = CASE
  -- If it's already a number
  WHEN duration ~ '^\d+$' THEN duration::integer
  -- If it contains 'hour' or 'hr'
  WHEN duration ~* 'hour|hr' THEN 
    CASE 
      WHEN duration ~* '^\d+\.5' THEN (substring(duration from '^\d+')::integer * 60) + 30
      ELSE substring(duration from '^\d+')::integer * 60
    END
  -- If it contains 'min'
  WHEN duration ~* 'min' THEN substring(duration from '\d+')::integer
  -- Default to 30 minutes if can't parse
  ELSE 30
END
WHERE duration_new IS NULL;

-- Step 3: Drop old column
ALTER TABLE services DROP COLUMN duration;

-- Step 4: Rename new column to duration
ALTER TABLE services RENAME COLUMN duration_new TO duration;

-- Step 5: Add NOT NULL constraint
ALTER TABLE services ALTER COLUMN duration SET NOT NULL;

-- Step 6: Add default value of 30 minutes for new records
ALTER TABLE services ALTER COLUMN duration SET DEFAULT 30;
