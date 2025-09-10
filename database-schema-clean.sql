-- Clean database schema setup
-- This script will drop existing policies and recreate them properly

-- Drop existing policies for audits table
DROP POLICY IF EXISTS "Users can view own audits" ON audits;
DROP POLICY IF EXISTS "Users can insert own audits" ON audits;
DROP POLICY IF EXISTS "Users can update own audits" ON audits;
DROP POLICY IF EXISTS "Users can delete own audits" ON audits;

-- Drop existing policies for sites table
DROP POLICY IF EXISTS "Users can view own sites" ON sites;
DROP POLICY IF EXISTS "Users can insert own sites" ON sites;
DROP POLICY IF EXISTS "Users can update own sites" ON sites;
DROP POLICY IF EXISTS "Users can delete own sites" ON sites;

-- Drop existing tables if they exist (optional - only if you want to start fresh)
-- DROP TABLE IF EXISTS audits CASCADE;
-- DROP TABLE IF EXISTS sites CASCADE;

-- Create sites table for user SEO analysis
CREATE TABLE IF NOT EXISTS sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audits table for storing audit history
CREATE TABLE IF NOT EXISTS audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  h1_tags JSONB,
  broken_links JSONB,
  mobile_score INTEGER,
  performance_score INTEGER,
  accessibility_score INTEGER,
  seo_score INTEGER,
  best_practices_score INTEGER,
  status TEXT NOT NULL,
  error_message TEXT,
  audit_type TEXT DEFAULT 'full',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Create policies for sites table
CREATE POLICY "Users can view own sites" ON sites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sites" ON sites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites" ON sites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites" ON sites
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for audits table (more permissive for server-side operations)
CREATE POLICY "Users can view own audits" ON audits
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow inserts for authenticated users and anonymous audits
-- More permissive for server-side API operations
CREATE POLICY "Users can insert own audits" ON audits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own audits" ON audits
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own audits" ON audits
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at);
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON audits(user_id);
CREATE INDEX IF NOT EXISTS idx_audits_site_id ON audits(site_id);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at);
CREATE INDEX IF NOT EXISTS idx_audits_url ON audits(url);
