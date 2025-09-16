-- Update the audits table to include detailed audit data
-- This script adds new columns to the existing audits table

-- Add SEO Data columns (if they don't exist)
ALTER TABLE audits ADD COLUMN IF NOT EXISTS h2_tags JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS h3_tags JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS h4_tags JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS h5_tags JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS h6_tags JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS title_word_count INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS meta_description_word_count INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS h1_word_count INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS h2_word_count INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS h3_word_count INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS h4_word_count INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS h5_word_count INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS h6_word_count INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS images_without_alt JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS images_with_alt JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS internal_links JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS external_links JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS total_links INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS total_images INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS images_missing_alt INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS internal_link_count INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS external_link_count INTEGER;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS heading_structure JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS broken_link_details JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS broken_link_summary JSONB;

-- Add Performance Metrics columns
ALTER TABLE audits ADD COLUMN IF NOT EXISTS fcp_score REAL;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS lcp_score REAL;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS cls_score REAL;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS fid_score REAL;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS load_time REAL;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS performance_metrics JSONB;

-- Add Accessibility Data columns
ALTER TABLE audits ADD COLUMN IF NOT EXISTS accessibility_issues JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS accessibility_recommendations JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS accessibility_audit JSONB;

-- Add Best Practices Data columns
ALTER TABLE audits ADD COLUMN IF NOT EXISTS best_practices_issues JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS best_practices_recommendations JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS best_practices_audit JSONB;

-- Add Enhanced SEO Analysis column
ALTER TABLE audits ADD COLUMN IF NOT EXISTS enhanced_seo_analysis JSONB;

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

-- Update sites table to better support main domains
ALTER TABLE sites ADD COLUMN IF NOT EXISTS is_main_domain BOOLEAN DEFAULT TRUE;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS domain TEXT; -- Store just the domain part
ALTER TABLE sites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update audits table to reference pages instead of sites
ALTER TABLE audits ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE CASCADE;

-- Enable Row Level Security for pages table
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Create policies for pages table (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own pages" ON pages;
DROP POLICY IF EXISTS "Users can insert own pages" ON pages;
DROP POLICY IF EXISTS "Users can update own pages" ON pages;
DROP POLICY IF EXISTS "Users can delete own pages" ON pages;

CREATE POLICY "Users can view own pages" ON pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pages" ON pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pages" ON pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pages" ON pages
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_audits_performance_score ON audits(performance_score);
CREATE INDEX IF NOT EXISTS idx_audits_seo_score ON audits(seo_score);
CREATE INDEX IF NOT EXISTS idx_audits_accessibility_score ON audits(accessibility_score);
CREATE INDEX IF NOT EXISTS idx_audits_best_practices_score ON audits(best_practices_score);
CREATE INDEX IF NOT EXISTS idx_audits_mobile_score ON audits(mobile_score);
CREATE INDEX IF NOT EXISTS idx_pages_site_id ON pages(site_id);
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_audits_page_id ON audits(page_id);

-- Clean up duplicate pages before creating unique constraint
-- Keep only the first occurrence of each duplicate (by created_at)
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY user_id, site_id, url 
           ORDER BY created_at ASC
         ) as rn
  FROM pages
)
DELETE FROM pages 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add unique constraint to prevent duplicate pages for the same user and site
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_unique_url_per_site 
ON pages(user_id, site_id, url);

