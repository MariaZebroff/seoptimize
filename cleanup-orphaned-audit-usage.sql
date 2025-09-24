-- Clean up orphaned page audit usage records
-- Run this in your Supabase SQL editor to clean up any existing orphaned data

-- First, let's see what orphaned records we have
SELECT 
  'Orphaned page audit usage records' as description,
  COUNT(*) as count
FROM page_audit_usage pau
LEFT JOIN pages p ON pau.page_url = p.url AND pau.user_id = p.user_id
LEFT JOIN sites s ON pau.page_url = s.url AND pau.user_id = s.user_id
WHERE p.id IS NULL AND s.id IS NULL;

-- Show some examples of orphaned records
SELECT 
  pau.user_id,
  pau.page_url,
  pau.audit_count,
  pau.last_audit_date
FROM page_audit_usage pau
LEFT JOIN pages p ON pau.page_url = p.url AND pau.user_id = p.user_id
LEFT JOIN sites s ON pau.page_url = s.url AND pau.user_id = s.user_id
WHERE p.id IS NULL AND s.id IS NULL
LIMIT 10;

-- Delete orphaned page audit usage records
-- These are records where the page_url doesn't match any existing page or site URL
DELETE FROM page_audit_usage 
WHERE id IN (
  SELECT pau.id
  FROM page_audit_usage pau
  LEFT JOIN pages p ON pau.page_url = p.url AND pau.user_id = p.user_id
  LEFT JOIN sites s ON pau.page_url = s.url AND pau.user_id = s.user_id
  WHERE p.id IS NULL AND s.id IS NULL
);

-- Show the cleanup results
SELECT 
  'Remaining page audit usage records' as description,
  COUNT(*) as count
FROM page_audit_usage;

-- Show remaining records grouped by user
SELECT 
  user_id,
  COUNT(*) as audit_records,
  COUNT(DISTINCT page_url) as unique_pages
FROM page_audit_usage
GROUP BY user_id
ORDER BY user_id;

-- Optional: Show all current page audit usage records for verification
SELECT 
  pau.user_id,
  pau.page_url,
  pau.audit_count,
  pau.last_audit_date,
  CASE 
    WHEN p.id IS NOT NULL THEN 'Page exists'
    WHEN s.id IS NOT NULL THEN 'Site exists'
    ELSE 'ORPHANED'
  END as status
FROM page_audit_usage pau
LEFT JOIN pages p ON pau.page_url = p.url AND pau.user_id = p.user_id
LEFT JOIN sites s ON pau.page_url = s.url AND pau.user_id = s.user_id
ORDER BY pau.user_id, pau.page_url;
