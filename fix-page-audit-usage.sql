-- Fix page audit usage data
-- Run this in your Supabase SQL editor to fix any existing incorrect data

-- First, let's see what data we have
SELECT 
  user_id,
  page_url,
  audit_count,
  last_audit_date,
  created_at,
  updated_at
FROM page_audit_usage
ORDER BY user_id, page_url, last_audit_date;

-- If you have incorrect data (like multiple records with audit_count = 1 for the same page),
-- you can delete all existing records and start fresh:
-- DELETE FROM page_audit_usage;

-- Or if you want to keep the data but fix it, you can aggregate by user, page, and date:
-- This will create a new table with the correct aggregated counts
CREATE TABLE IF NOT EXISTS page_audit_usage_fixed AS
SELECT 
  user_id,
  page_url,
  last_audit_date,
  COUNT(*) as audit_count,
  MIN(created_at) as created_at,
  MAX(updated_at) as updated_at
FROM page_audit_usage
GROUP BY user_id, page_url, last_audit_date;

-- Then replace the original table (BE CAREFUL - this will delete all existing data)
-- DROP TABLE page_audit_usage;
-- ALTER TABLE page_audit_usage_fixed RENAME TO page_audit_usage;

-- Recreate the indexes
-- CREATE INDEX IF NOT EXISTS idx_page_audit_usage_user_id ON page_audit_usage(user_id);
-- CREATE INDEX IF NOT EXISTS idx_page_audit_usage_page_url ON page_audit_usage(page_url);
-- CREATE INDEX IF NOT EXISTS idx_page_audit_usage_date ON page_audit_usage(last_audit_date);
-- CREATE INDEX IF NOT EXISTS idx_page_audit_usage_user_date ON page_audit_usage(user_id, last_audit_date);

-- Recreate the unique constraint
-- ALTER TABLE page_audit_usage ADD CONSTRAINT page_audit_usage_unique UNIQUE (user_id, page_url, last_audit_date);

-- Recreate RLS policies
-- ALTER TABLE page_audit_usage ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own page audit usage" ON page_audit_usage
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own page audit usage" ON page_audit_usage
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own page audit usage" ON page_audit_usage
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Users can delete their own page audit usage" ON page_audit_usage
--   FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
-- GRANT SELECT, INSERT, UPDATE, DELETE ON page_audit_usage TO authenticated;

-- For now, let's just clean up any duplicate records for today
-- This will keep the most recent record for each user/page combination today
DELETE FROM page_audit_usage 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, page_url, last_audit_date) id
  FROM page_audit_usage
  WHERE last_audit_date = CURRENT_DATE
  ORDER BY user_id, page_url, last_audit_date, updated_at DESC
);

-- Update audit counts to reflect the actual number of records (if they were all set to 1)
UPDATE page_audit_usage 
SET audit_count = (
  SELECT COUNT(*) 
  FROM page_audit_usage p2 
  WHERE p2.user_id = page_audit_usage.user_id 
    AND p2.page_url = page_audit_usage.page_url 
    AND p2.last_audit_date = page_audit_usage.last_audit_date
)
WHERE last_audit_date = CURRENT_DATE;

-- Show the corrected data
SELECT 
  user_id,
  page_url,
  audit_count,
  last_audit_date,
  created_at,
  updated_at
FROM page_audit_usage
WHERE last_audit_date = CURRENT_DATE
ORDER BY user_id, page_url;
