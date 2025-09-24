-- Fix missing main page entries for existing sites
-- Run this in your Supabase SQL editor to create main page entries for sites that don't have them

-- First, let's see what sites are missing main page entries
SELECT 
  'Sites missing main page entries' as description,
  COUNT(*) as count
FROM sites s
LEFT JOIN pages p ON s.id = p.site_id AND p.is_main_page = true
WHERE p.id IS NULL;

-- Show some examples of sites missing main pages
SELECT 
  s.id as site_id,
  s.url as site_url,
  s.title as site_title,
  s.user_id,
  s.created_at
FROM sites s
LEFT JOIN pages p ON s.id = p.site_id AND p.is_main_page = true
WHERE p.id IS NULL
LIMIT 10;

-- Create main page entries for sites that don't have them
INSERT INTO pages (user_id, site_id, url, title, path, is_main_page, created_at, updated_at)
SELECT 
  s.user_id,
  s.id as site_id,
  s.url,
  s.title,
  CASE 
    WHEN s.url ~ '^https?://[^/]+/?$' THEN '/'
    ELSE regexp_replace(s.url, '^https?://[^/]+', '')
  END as path,
  true as is_main_page,
  s.created_at,
  NOW() as updated_at
FROM sites s
LEFT JOIN pages p ON s.id = p.site_id AND p.is_main_page = true
WHERE p.id IS NULL;

-- Show the results
SELECT 
  'Main pages created' as description,
  COUNT(*) as count
FROM pages 
WHERE is_main_page = true;

-- Show sites with their main pages
SELECT 
  s.url as site_url,
  s.title as site_title,
  p.url as main_page_url,
  p.is_main_page,
  p.created_at as page_created_at
FROM sites s
JOIN pages p ON s.id = p.site_id AND p.is_main_page = true
ORDER BY s.created_at DESC
LIMIT 10;

-- Verify no sites are missing main pages now
SELECT 
  'Sites still missing main page entries' as description,
  COUNT(*) as count
FROM sites s
LEFT JOIN pages p ON s.id = p.site_id AND p.is_main_page = true
WHERE p.id IS NULL;
