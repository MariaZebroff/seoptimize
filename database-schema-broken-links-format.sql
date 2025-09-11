-- Update broken_links field format to match internal_links format
-- This script changes broken_links from string[] to Array<{url: string, text: string}>

-- First, let's add the new broken link fields if they don't exist
ALTER TABLE audits 
ADD COLUMN IF NOT EXISTS brokenLinkDetails JSONB,
ADD COLUMN IF NOT EXISTS brokenLinkSummary JSONB;

-- Update the comment for broken_links to reflect the new format
COMMENT ON COLUMN audits.broken_links IS 'Array of broken links with url and text properties: [{"url": "...", "text": "..."}]';
COMMENT ON COLUMN audits.brokenLinkDetails IS 'Detailed broken link information with status codes and reasons';
COMMENT ON COLUMN audits.brokenLinkSummary IS 'Summary statistics for broken link analysis';

-- Create indexes for new broken link fields
CREATE INDEX IF NOT EXISTS idx_audits_broken_link_details ON audits USING GIN (brokenLinkDetails);
CREATE INDEX IF NOT EXISTS idx_audits_broken_link_summary ON audits USING GIN (brokenLinkSummary);

-- Note: The existing broken_links column will be updated by the application code
-- to use the new format: [{"url": "https://example.com", "text": "Link Text"}]
-- instead of the old format: ["https://example.com"]

