-- Create pages table if it doesn't exist
-- Run this in your Supabase SQL editor

-- Create pages table for individual pages under sites
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  path TEXT NOT NULL, -- The path part of the URL (e.g., /about, /contact)
  is_main_page BOOLEAN DEFAULT FALSE, -- True if this is the main domain page
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pages_site_id ON pages(site_id);
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_url ON pages(url);

-- Enable Row Level Security for pages table
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Create policies for pages table (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own pages" ON pages;
DROP POLICY IF EXISTS "Users can insert their own pages" ON pages;
DROP POLICY IF EXISTS "Users can update their own pages" ON pages;
DROP POLICY IF EXISTS "Users can delete their own pages" ON pages;

CREATE POLICY "Users can view their own pages" ON pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pages" ON pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pages" ON pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages" ON pages
  FOR DELETE USING (auth.uid() = user_id);

-- Verify the table was created
SELECT 
  'Pages table created successfully' as status,
  COUNT(*) as existing_pages
FROM pages;
