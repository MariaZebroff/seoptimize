-- Supabase Auth automatically creates the auth.users table
-- This file contains database setup for user sites and audit history

-- Sites table for user SEO analysis
CREATE TABLE IF NOT EXISTS sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audits table for storing audit history
CREATE TABLE IF NOT EXISTS audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  
  -- SEO Data
  h1_tags JSONB,
  h2_tags JSONB,
  h3_tags JSONB,
  h4_tags JSONB,
  h5_tags JSONB,
  h6_tags JSONB,
  title_word_count INTEGER,
  meta_description_word_count INTEGER,
  h1_word_count INTEGER,
  h2_word_count INTEGER,
  h3_word_count INTEGER,
  h4_word_count INTEGER,
  h5_word_count INTEGER,
  h6_word_count INTEGER,
  images_without_alt JSONB,
  images_with_alt JSONB,
  internal_links JSONB,
  external_links JSONB,
  total_links INTEGER,
  total_images INTEGER,
  images_missing_alt INTEGER,
  internal_link_count INTEGER,
  external_link_count INTEGER,
  heading_structure JSONB,
  broken_links JSONB,
  broken_link_details JSONB,
  broken_link_summary JSONB,
  
  -- Performance Metrics
  fcp_score REAL,
  lcp_score REAL,
  cls_score REAL,
  fid_score REAL,
  load_time REAL,
  performance_metrics JSONB,
  
  -- Accessibility Data
  accessibility_issues JSONB,
  accessibility_recommendations JSONB,
  accessibility_audit JSONB,
  
  -- Best Practices Data
  best_practices_issues JSONB,
  best_practices_recommendations JSONB,
  best_practices_audit JSONB,
  
  -- Overall Scores
  mobile_score INTEGER,
  performance_score INTEGER,
  accessibility_score INTEGER,
  seo_score INTEGER,
  best_practices_score INTEGER,
  
  -- Audit Status
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

-- Create policies for audits table
CREATE POLICY "Users can view own audits" ON audits
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own audits" ON audits
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own audits" ON audits
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own audits" ON audits
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at);
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON audits(user_id);
CREATE INDEX IF NOT EXISTS idx_audits_site_id ON audits(site_id);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at);
CREATE INDEX IF NOT EXISTS idx_audits_url ON audits(url);

