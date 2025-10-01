-- Fix Supabase Security Errors
-- This script addresses the security issues found in the database linter

-- ==============================================
-- 1. FIX SECURITY DEFINER VIEWS
-- ==============================================

-- Drop and recreate user_site_summary view without SECURITY DEFINER
DROP VIEW IF EXISTS public.user_site_summary;

CREATE VIEW public.user_site_summary AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(s.id) as site_count,
    COUNT(p.id) as total_pages,
    COUNT(CASE WHEN p.is_main_page = true THEN 1 END) as main_pages,
    COUNT(CASE WHEN p.is_main_page = false THEN 1 END) as sub_pages,
    MAX(s.created_at) as latest_site_created
FROM auth.users u
LEFT JOIN public.sites s ON u.id = s.user_id
LEFT JOIN public.pages p ON s.id = p.site_id
GROUP BY u.id, u.email;

-- Grant appropriate permissions
GRANT SELECT ON public.user_site_summary TO authenticated;
GRANT SELECT ON public.user_site_summary TO anon;

-- Drop and recreate page_audit_usage_summary view without SECURITY DEFINER
DROP VIEW IF EXISTS public.page_audit_usage_summary;

CREATE VIEW public.page_audit_usage_summary AS
SELECT 
    p.id as page_id,
    p.url,
    p.title,
    s.url as site_url,
    s.user_id,
    COUNT(pau.id) as audit_count,
    MAX(pau.created_at) as latest_audit,
    MIN(pau.created_at) as first_audit
FROM public.pages p
LEFT JOIN public.sites s ON p.site_id = s.id
LEFT JOIN public.page_audit_usage pau ON p.id = pau.page_id
GROUP BY p.id, p.url, p.title, s.url, s.user_id;

-- Grant appropriate permissions
GRANT SELECT ON public.page_audit_usage_summary TO authenticated;
GRANT SELECT ON public.page_audit_usage_summary TO anon;

-- ==============================================
-- 2. ENABLE RLS ON page_audit_usage_fixed TABLE
-- ==============================================

-- Enable Row Level Security on the table
ALTER TABLE public.page_audit_usage_fixed ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for page_audit_usage_fixed table

-- Policy: Users can view their own audit usage records
CREATE POLICY "Users can view own audit usage" ON public.page_audit_usage_fixed
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.pages p
            JOIN public.sites s ON p.site_id = s.id
            WHERE p.id = page_audit_usage_fixed.page_id
            AND s.user_id = auth.uid()
        )
    );

-- Policy: Users can insert their own audit usage records
CREATE POLICY "Users can insert own audit usage" ON public.page_audit_usage_fixed
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pages p
            JOIN public.sites s ON p.site_id = s.id
            WHERE p.id = page_audit_usage_fixed.page_id
            AND s.user_id = auth.uid()
        )
    );

-- Policy: Users can update their own audit usage records
CREATE POLICY "Users can update own audit usage" ON public.page_audit_usage_fixed
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.pages p
            JOIN public.sites s ON p.site_id = s.id
            WHERE p.id = page_audit_usage_fixed.page_id
            AND s.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pages p
            JOIN public.sites s ON p.site_id = s.id
            WHERE p.id = page_audit_usage_fixed.page_id
            AND s.user_id = auth.uid()
        )
    );

-- Policy: Users can delete their own audit usage records
CREATE POLICY "Users can delete own audit usage" ON public.page_audit_usage_fixed
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.pages p
            JOIN public.sites s ON p.site_id = s.id
            WHERE p.id = page_audit_usage_fixed.page_id
            AND s.user_id = auth.uid()
        )
    );

-- ==============================================
-- 3. VERIFY SECURITY SETUP
-- ==============================================

-- Check that RLS is enabled on the table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'page_audit_usage_fixed' 
AND schemaname = 'public';

-- Check that views don't have SECURITY DEFINER
SELECT schemaname, viewname, definition
FROM pg_views 
WHERE viewname IN ('user_site_summary', 'page_audit_usage_summary')
AND schemaname = 'public';

-- List all RLS policies on the table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'page_audit_usage_fixed' 
AND schemaname = 'public';

-- ==============================================
-- 4. ADDITIONAL SECURITY RECOMMENDATIONS
-- ==============================================

-- Ensure all other public tables have RLS enabled
-- (This is a check - run these queries to see which tables need RLS)

-- Check which tables in public schema don't have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false
AND tablename NOT IN ('spatial_ref_sys'); -- Exclude system tables

-- Check which tables in public schema don't have any RLS policies
SELECT t.schemaname, t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
AND t.rowsecurity = true
AND p.policyname IS NULL
AND t.tablename NOT IN ('spatial_ref_sys'); -- Exclude system tables
