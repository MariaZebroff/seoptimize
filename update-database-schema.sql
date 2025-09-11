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

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_audits_performance_score ON audits(performance_score);
CREATE INDEX IF NOT EXISTS idx_audits_seo_score ON audits(seo_score);
CREATE INDEX IF NOT EXISTS idx_audits_accessibility_score ON audits(accessibility_score);
CREATE INDEX IF NOT EXISTS idx_audits_best_practices_score ON audits(best_practices_score);
CREATE INDEX IF NOT EXISTS idx_audits_mobile_score ON audits(mobile_score);
