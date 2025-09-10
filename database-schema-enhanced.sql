-- Enhanced database schema with expanded SEO functionality
-- This script adds new columns for comprehensive SEO analysis

-- Add new columns to audits table for enhanced SEO data
ALTER TABLE audits 
ADD COLUMN IF NOT EXISTS h2_tags JSONB,
ADD COLUMN IF NOT EXISTS h3_tags JSONB,
ADD COLUMN IF NOT EXISTS h4_tags JSONB,
ADD COLUMN IF NOT EXISTS h5_tags JSONB,
ADD COLUMN IF NOT EXISTS h6_tags JSONB,
ADD COLUMN IF NOT EXISTS title_word_count INTEGER,
ADD COLUMN IF NOT EXISTS meta_description_word_count INTEGER,
ADD COLUMN IF NOT EXISTS h1_word_count INTEGER,
ADD COLUMN IF NOT EXISTS h2_word_count INTEGER,
ADD COLUMN IF NOT EXISTS h3_word_count INTEGER,
ADD COLUMN IF NOT EXISTS h4_word_count INTEGER,
ADD COLUMN IF NOT EXISTS h5_word_count INTEGER,
ADD COLUMN IF NOT EXISTS h6_word_count INTEGER,
ADD COLUMN IF NOT EXISTS images_without_alt JSONB,
ADD COLUMN IF NOT EXISTS images_with_alt JSONB,
ADD COLUMN IF NOT EXISTS internal_links JSONB,
ADD COLUMN IF NOT EXISTS external_links JSONB,
ADD COLUMN IF NOT EXISTS total_links INTEGER,
ADD COLUMN IF NOT EXISTS total_images INTEGER,
ADD COLUMN IF NOT EXISTS images_missing_alt INTEGER,
ADD COLUMN IF NOT EXISTS internal_link_count INTEGER,
ADD COLUMN IF NOT EXISTS external_link_count INTEGER,
ADD COLUMN IF NOT EXISTS heading_structure JSONB;

-- Create indexes for new SEO fields
CREATE INDEX IF NOT EXISTS idx_audits_title_word_count ON audits(title_word_count);
CREATE INDEX IF NOT EXISTS idx_audits_meta_word_count ON audits(meta_description_word_count);
CREATE INDEX IF NOT EXISTS idx_audits_images_missing_alt ON audits(images_missing_alt);
CREATE INDEX IF NOT EXISTS idx_audits_total_links ON audits(total_links);
CREATE INDEX IF NOT EXISTS idx_audits_total_images ON audits(total_images);

-- Add comments for documentation
COMMENT ON COLUMN audits.h2_tags IS 'Array of H2 heading texts';
COMMENT ON COLUMN audits.h3_tags IS 'Array of H3 heading texts';
COMMENT ON COLUMN audits.h4_tags IS 'Array of H4 heading texts';
COMMENT ON COLUMN audits.h5_tags IS 'Array of H5 heading texts';
COMMENT ON COLUMN audits.h6_tags IS 'Array of H6 heading texts';
COMMENT ON COLUMN audits.title_word_count IS 'Word count of page title';
COMMENT ON COLUMN audits.meta_description_word_count IS 'Word count of meta description';
COMMENT ON COLUMN audits.h1_word_count IS 'Word count of H1 tags combined';
COMMENT ON COLUMN audits.h2_word_count IS 'Word count of H2 tags combined';
COMMENT ON COLUMN audits.h3_word_count IS 'Word count of H3 tags combined';
COMMENT ON COLUMN audits.h4_word_count IS 'Word count of H4 tags combined';
COMMENT ON COLUMN audits.h5_word_count IS 'Word count of H5 tags combined';
COMMENT ON COLUMN audits.h6_word_count IS 'Word count of H6 tags combined';
COMMENT ON COLUMN audits.images_without_alt IS 'Array of image URLs without alt text';
COMMENT ON COLUMN audits.images_with_alt IS 'Array of image URLs with alt text';
COMMENT ON COLUMN audits.internal_links IS 'Array of internal links';
COMMENT ON COLUMN audits.external_links IS 'Array of external links';
COMMENT ON COLUMN audits.total_links IS 'Total number of links found';
COMMENT ON COLUMN audits.total_images IS 'Total number of images found';
COMMENT ON COLUMN audits.images_missing_alt IS 'Number of images missing alt text';
COMMENT ON COLUMN audits.internal_link_count IS 'Number of internal links';
COMMENT ON COLUMN audits.external_link_count IS 'Number of external links';
COMMENT ON COLUMN audits.heading_structure IS 'JSON structure showing heading hierarchy';
