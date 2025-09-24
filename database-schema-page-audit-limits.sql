-- Database schema for page-specific audit limits
-- Run this in your Supabase SQL editor

-- Create table to track audits per page URL for Basic Plan users
CREATE TABLE IF NOT EXISTS page_audit_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  audit_count INTEGER NOT NULL DEFAULT 0,
  last_audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, page_url, last_audit_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_audit_usage_user_id ON page_audit_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_page_audit_usage_page_url ON page_audit_usage(page_url);
CREATE INDEX IF NOT EXISTS idx_page_audit_usage_date ON page_audit_usage(last_audit_date);
CREATE INDEX IF NOT EXISTS idx_page_audit_usage_user_date ON page_audit_usage(user_id, last_audit_date);

-- Enable Row Level Security (RLS)
ALTER TABLE page_audit_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for page_audit_usage
CREATE POLICY "Users can view their own page audit usage" ON page_audit_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own page audit usage" ON page_audit_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own page audit usage" ON page_audit_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own page audit usage" ON page_audit_usage
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to check page audit limits
CREATE OR REPLACE FUNCTION check_page_audit_limits(user_uuid UUID, page_url TEXT, max_audits_per_page INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_audit_count INTEGER;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get current audit count for this page today
  SELECT COALESCE(audit_count, 0) INTO current_audit_count
  FROM page_audit_usage
  WHERE user_id = user_uuid 
    AND page_url = page_url 
    AND last_audit_date = today_date;
  
  -- Check if user can perform more audits on this page
  RETURN current_audit_count < max_audits_per_page;
END;
$$ LANGUAGE plpgsql;

-- Create function to get current page audit count
CREATE OR REPLACE FUNCTION get_page_audit_count(user_uuid UUID, page_url TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_audit_count INTEGER;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get current audit count for this page today
  SELECT COALESCE(audit_count, 0) INTO current_audit_count
  FROM page_audit_usage
  WHERE user_id = user_uuid 
    AND page_url = page_url 
    AND last_audit_date = today_date;
  
  RETURN current_audit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to record page audit usage
CREATE OR REPLACE FUNCTION record_page_audit_usage(user_uuid UUID, page_url TEXT)
RETURNS VOID AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Insert or update audit count for this page today
  INSERT INTO page_audit_usage (user_id, page_url, audit_count, last_audit_date)
  VALUES (user_uuid, page_url, 1, today_date)
  ON CONFLICT (user_id, page_url, last_audit_date)
  DO UPDATE SET
    audit_count = page_audit_usage.audit_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to reset daily page audit counts (for cleanup)
CREATE OR REPLACE FUNCTION reset_daily_page_audit_counts()
RETURNS VOID AS $$
BEGIN
  -- Delete old records (older than 7 days to keep some history)
  DELETE FROM page_audit_usage 
  WHERE last_audit_date < CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON page_audit_usage TO authenticated;
GRANT EXECUTE ON FUNCTION check_page_audit_limits(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_page_audit_count(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION record_page_audit_usage(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_daily_page_audit_counts() TO authenticated;

-- Create a view for easy monitoring of page audit usage
CREATE OR REPLACE VIEW page_audit_usage_summary AS
SELECT 
  user_id,
  page_url,
  audit_count,
  last_audit_date,
  CASE 
    WHEN audit_count >= 2 THEN 'Limit Reached'
    ELSE 'Available'
  END as status
FROM page_audit_usage
WHERE last_audit_date = CURRENT_DATE
ORDER BY user_id, page_url;

GRANT SELECT ON page_audit_usage_summary TO authenticated;
