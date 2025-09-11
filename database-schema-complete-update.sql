-- Complete database schema update for broken links format
-- This script updates the audits table to support the new broken links format
-- and adds missing columns for enhanced SEO data

-- First, let's add the missing columns if they don't exist
DO $$ 
BEGIN
    -- Add broken_link_details column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'broken_link_details') THEN
        ALTER TABLE audits ADD COLUMN broken_link_details JSONB;
    END IF;
    
    -- Add broken_link_summary column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'broken_link_summary') THEN
        ALTER TABLE audits ADD COLUMN broken_link_summary JSONB;
    END IF;
    
    -- Add other enhanced SEO columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'h2_tags') THEN
        ALTER TABLE audits ADD COLUMN "h2_tags" JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'h3_tags') THEN
        ALTER TABLE audits ADD COLUMN "h3_tags" JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'h4_tags') THEN
        ALTER TABLE audits ADD COLUMN "h4_tags" JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'h5_tags') THEN
        ALTER TABLE audits ADD COLUMN "h5_tags" JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'h6_tags') THEN
        ALTER TABLE audits ADD COLUMN "h6_tags" JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'title_word_count') THEN
        ALTER TABLE audits ADD COLUMN "title_word_count" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'meta_description_word_count') THEN
        ALTER TABLE audits ADD COLUMN "meta_description_word_count" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'h1_word_count') THEN
        ALTER TABLE audits ADD COLUMN "h1_word_count" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'h2_word_count') THEN
        ALTER TABLE audits ADD COLUMN "h2_word_count" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'h3_word_count') THEN
        ALTER TABLE audits ADD COLUMN "h3_word_count" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'h4_word_count') THEN
        ALTER TABLE audits ADD COLUMN "h4_word_count" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'h5_word_count') THEN
        ALTER TABLE audits ADD COLUMN "h5_word_count" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'h6_word_count') THEN
        ALTER TABLE audits ADD COLUMN "h6_word_count" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'images_without_alt') THEN
        ALTER TABLE audits ADD COLUMN "images_without_alt" JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'images_with_alt') THEN
        ALTER TABLE audits ADD COLUMN "images_with_alt" JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'internal_links') THEN
        ALTER TABLE audits ADD COLUMN "internal_links" JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'external_links') THEN
        ALTER TABLE audits ADD COLUMN "external_links" JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'total_links') THEN
        ALTER TABLE audits ADD COLUMN "total_links" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'total_images') THEN
        ALTER TABLE audits ADD COLUMN "total_images" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'images_missing_alt') THEN
        ALTER TABLE audits ADD COLUMN "images_missing_alt" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'internal_link_count') THEN
        ALTER TABLE audits ADD COLUMN "internal_link_count" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'external_link_count') THEN
        ALTER TABLE audits ADD COLUMN "external_link_count" INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'audits' AND column_name = 'heading_structure') THEN
        ALTER TABLE audits ADD COLUMN "heading_structure" JSONB;
    END IF;
END $$;

-- Now update the broken_links column to support the new format
-- First, let's check the current data type
DO $$
DECLARE
    current_type text;
BEGIN
    SELECT data_type INTO current_type 
    FROM information_schema.columns 
    WHERE table_name = 'audits' AND column_name = 'broken_links';
    
    -- If it's not already JSONB, convert it
    IF current_type != 'jsonb' THEN
        -- Convert existing string array data to the new object format
        UPDATE audits 
        SET broken_links = (
            SELECT jsonb_agg(
                jsonb_build_object('url', value, 'text', 'No text available')
            )
            FROM jsonb_array_elements_text(broken_links::jsonb)
        )
        WHERE broken_links IS NOT NULL;
        
        -- Change the column type to JSONB
        ALTER TABLE audits 
        ALTER COLUMN broken_links TYPE JSONB USING broken_links::jsonb;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN audits.broken_links IS 'Array of broken links with URL and text properties';
COMMENT ON COLUMN audits.broken_link_details IS 'Detailed information about broken links including status codes and reasons';
COMMENT ON COLUMN audits.broken_link_summary IS 'Summary statistics for broken link analysis';
COMMENT ON COLUMN audits.internal_links IS 'Array of internal links with URL and text properties';
COMMENT ON COLUMN audits.external_links IS 'Array of external links with URL and text properties';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audits_broken_links ON audits USING GIN (broken_links);
CREATE INDEX IF NOT EXISTS idx_audits_internal_links ON audits USING GIN (internal_links);
CREATE INDEX IF NOT EXISTS idx_audits_external_links ON audits USING GIN (external_links);
CREATE INDEX IF NOT EXISTS idx_audits_broken_link_details ON audits USING GIN (broken_link_details);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'audits' 
AND column_name IN ('broken_links', 'broken_link_details', 'broken_link_summary', 'internal_links', 'external_links')
ORDER BY column_name;
