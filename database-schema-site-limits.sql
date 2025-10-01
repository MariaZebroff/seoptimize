-- Database schema for site and page limits
-- Run this in your Supabase SQL editor

-- Create user_sites table to track user's sites/domains
CREATE TABLE IF NOT EXISTS user_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  site_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, domain)
);

-- Create user_pages table to track pages within each site
CREATE TABLE IF NOT EXISTS user_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES user_sites(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  is_homepage BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, url)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sites_user_id ON user_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pages_user_id ON user_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pages_site_id ON user_pages(site_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_sites
CREATE POLICY "Users can view their own sites" ON user_sites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sites" ON user_sites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites" ON user_sites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sites" ON user_sites
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_pages
CREATE POLICY "Users can view their own pages" ON user_pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pages" ON user_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pages" ON user_pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages" ON user_pages
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to get domain from URL
CREATE OR REPLACE FUNCTION extract_domain(url TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Extract domain from URL (e.g., https://example.com/page -> example.com)
  RETURN regexp_replace(
    regexp_replace(url, '^https?://', ''),
    '/.*$', ''
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to check site limits
CREATE OR REPLACE FUNCTION check_site_limits(user_uuid UUID, plan_max_sites INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_site_count INTEGER;
BEGIN
  -- Count current sites for user
  SELECT COUNT(*) INTO current_site_count
  FROM user_sites
  WHERE user_id = user_uuid;
  
  -- Check if user can add more sites
  RETURN current_site_count < plan_max_sites;
END;
$$ LANGUAGE plpgsql;

-- Create function to check page limits per site
CREATE OR REPLACE FUNCTION check_page_limits(user_uuid UUID, site_uuid UUID, plan_max_pages INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_page_count INTEGER;
BEGIN
  -- Count current pages for the site
  SELECT COUNT(*) INTO current_page_count
  FROM user_pages
  WHERE user_id = user_uuid AND site_id = site_uuid;
  
  -- Check if user can add more pages to this site
  RETURN current_page_count < plan_max_pages;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user's current site count
CREATE OR REPLACE FUNCTION get_user_site_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM user_sites
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to get user's current page count for a site
CREATE OR REPLACE FUNCTION get_user_page_count(user_uuid UUID, site_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM user_pages
    WHERE user_id = user_uuid AND site_id = site_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to get or create site for a URL
CREATE OR REPLACE FUNCTION get_or_create_site(user_uuid UUID, url TEXT, site_name TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  domain_name TEXT;
  site_id UUID;
BEGIN
  -- Extract domain from URL
  domain_name := extract_domain(url);
  
  -- Try to find existing site
  SELECT id INTO site_id
  FROM user_sites
  WHERE user_id = user_uuid AND domain = domain_name;
  
  -- If site doesn't exist, create it
  IF site_id IS NULL THEN
    INSERT INTO user_sites (user_id, domain, site_name)
    VALUES (user_uuid, domain_name, COALESCE(site_name, domain_name))
    RETURNING id INTO site_id;
  END IF;
  
  RETURN site_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to add page to site
CREATE OR REPLACE FUNCTION add_page_to_site(user_uuid UUID, url TEXT, page_title TEXT DEFAULT NULL, is_homepage BOOLEAN DEFAULT FALSE)
RETURNS UUID AS $$
DECLARE
  site_id UUID;
  page_id UUID;
  domain_name TEXT;
BEGIN
  -- Extract domain and get/create site
  domain_name := extract_domain(url);
  site_id := get_or_create_site(user_uuid, url, domain_name);
  
  -- Add page to site
  INSERT INTO user_pages (user_id, site_id, url, page_title, is_homepage)
  VALUES (user_uuid, site_id, url, page_title, is_homepage)
  ON CONFLICT (user_id, url) DO UPDATE SET
    page_title = EXCLUDED.page_title,
    is_homepage = EXCLUDED.is_homepage,
    updated_at = NOW()
  RETURNING id INTO page_id;
  
  RETURN page_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for user site summary
CREATE OR REPLACE VIEW user_site_summary AS
SELECT 
  us.user_id,
  us.id as site_id,
  us.domain,
  us.site_name,
  us.created_at as site_created_at,
  COUNT(up.id) as page_count,
  MAX(up.created_at) as last_page_added
FROM user_sites us
LEFT JOIN user_pages up ON us.id = up.site_id
GROUP BY us.user_id, us.id, us.domain, us.site_name, us.created_at;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_pages TO authenticated;
GRANT SELECT ON user_site_summary TO authenticated;
GRANT EXECUTE ON FUNCTION extract_domain(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_site_limits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_page_limits(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_site_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_page_count(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_site(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_page_to_site(UUID, TEXT, TEXT, BOOLEAN) TO authenticated;




