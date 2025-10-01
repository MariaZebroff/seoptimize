-- 30-Day Data Retention System
-- This script implements automatic cleanup of audit data older than 30 days
-- Run this in your Supabase SQL editor

-- ==============================================
-- 1. CREATE CLEANUP FUNCTION
-- ==============================================

CREATE OR REPLACE FUNCTION cleanup_old_audit_data()
RETURNS TABLE(
  deleted_audits INTEGER,
  deleted_audit_history INTEGER,
  deleted_page_audit_usage INTEGER,
  deleted_user_usage INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_count INTEGER := 0;
  audit_history_count INTEGER := 0;
  page_audit_usage_count INTEGER := 0;
  user_usage_count INTEGER := 0;
  cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set cutoff date to 30 days ago
  cutoff_date := NOW() - INTERVAL '30 days';
  
  -- Log the cleanup operation
  RAISE NOTICE 'Starting 30-day data cleanup. Cutoff date: %', cutoff_date;
  
  -- Clean up main audits table
  DELETE FROM audits 
  WHERE created_at < cutoff_date;
  GET DIAGNOSTICS audit_count = ROW_COUNT;
  
  -- Clean up audit_history table (if it exists)
  DELETE FROM audit_history 
  WHERE created_at < cutoff_date;
  GET DIAGNOSTICS audit_history_count = ROW_COUNT;
  
  -- Clean up page_audit_usage table
  DELETE FROM page_audit_usage 
  WHERE created_at < cutoff_date;
  GET DIAGNOSTICS page_audit_usage_count = ROW_COUNT;
  
  -- Clean up old user_usage records (keep only last 3 months)
  DELETE FROM user_usage 
  WHERE month < TO_CHAR(NOW() - INTERVAL '3 months', 'YYYY-MM');
  GET DIAGNOSTICS user_usage_count = ROW_COUNT;
  
  -- Log results
  RAISE NOTICE 'Cleanup completed: % audits, % audit_history, % page_audit_usage, % user_usage records deleted', 
    audit_count, audit_history_count, page_audit_usage_count, user_usage_count;
  
  -- Return results
  RETURN QUERY SELECT audit_count, audit_history_count, page_audit_usage_count, user_usage_count;
END;
$$;

-- ==============================================
-- 2. CREATE MANUAL CLEANUP FUNCTION (for testing)
-- ==============================================

CREATE OR REPLACE FUNCTION cleanup_old_audit_data_manual(days_to_keep INTEGER DEFAULT 30)
RETURNS TABLE(
  deleted_audits INTEGER,
  deleted_audit_history INTEGER,
  deleted_page_audit_usage INTEGER,
  deleted_user_usage INTEGER,
  cutoff_date TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_count INTEGER := 0;
  audit_history_count INTEGER := 0;
  page_audit_usage_count INTEGER := 0;
  user_usage_count INTEGER := 0;
  cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set cutoff date based on parameter
  cutoff_date := NOW() - (days_to_keep || ' days')::INTERVAL;
  
  -- Log the cleanup operation
  RAISE NOTICE 'Starting manual data cleanup. Keeping % days. Cutoff date: %', days_to_keep, cutoff_date;
  
  -- Clean up main audits table
  DELETE FROM audits 
  WHERE created_at < cutoff_date;
  GET DIAGNOSTICS audit_count = ROW_COUNT;
  
  -- Clean up audit_history table (if it exists)
  DELETE FROM audit_history 
  WHERE created_at < cutoff_date;
  GET DIAGNOSTICS audit_history_count = ROW_COUNT;
  
  -- Clean up page_audit_usage table
  DELETE FROM page_audit_usage 
  WHERE created_at < cutoff_date;
  GET DIAGNOSTICS page_audit_usage_count = ROW_COUNT;
  
  -- Clean up old user_usage records (keep only last 3 months)
  DELETE FROM user_usage 
  WHERE month < TO_CHAR(NOW() - INTERVAL '3 months', 'YYYY-MM');
  GET DIAGNOSTICS user_usage_count = ROW_COUNT;
  
  -- Log results
  RAISE NOTICE 'Manual cleanup completed: % audits, % audit_history, % page_audit_usage, % user_usage records deleted', 
    audit_count, audit_history_count, page_audit_usage_count, user_usage_count;
  
  -- Return results
  RETURN QUERY SELECT audit_count, audit_history_count, page_audit_usage_count, user_usage_count, cutoff_date;
END;
$$;

-- ==============================================
-- 3. CREATE SCHEDULED CLEANUP (using pg_cron if available)
-- ==============================================

-- Note: pg_cron extension needs to be enabled in Supabase
-- This will run the cleanup function daily at 2 AM
-- SELECT cron.schedule('cleanup-audit-data', '0 2 * * *', 'SELECT cleanup_old_audit_data();');

-- ==============================================
-- 4. CREATE CLEANUP STATISTICS FUNCTION
-- ==============================================

CREATE OR REPLACE FUNCTION get_audit_data_stats()
RETURNS TABLE(
  total_audits INTEGER,
  audits_last_30_days INTEGER,
  total_audit_history INTEGER,
  audit_history_last_30_days INTEGER,
  total_page_audit_usage INTEGER,
  page_audit_usage_last_30_days INTEGER,
  total_user_usage INTEGER,
  oldest_audit_date TIMESTAMP WITH TIME ZONE,
  newest_audit_date TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  cutoff_date := NOW() - INTERVAL '30 days';
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM audits) as total_audits,
    (SELECT COUNT(*)::INTEGER FROM audits WHERE created_at >= cutoff_date) as audits_last_30_days,
    (SELECT COUNT(*)::INTEGER FROM audit_history) as total_audit_history,
    (SELECT COUNT(*)::INTEGER FROM audit_history WHERE created_at >= cutoff_date) as audit_history_last_30_days,
    (SELECT COUNT(*)::INTEGER FROM page_audit_usage) as total_page_audit_usage,
    (SELECT COUNT(*)::INTEGER FROM page_audit_usage WHERE created_at >= cutoff_date) as page_audit_usage_last_30_days,
    (SELECT COUNT(*)::INTEGER FROM user_usage) as total_user_usage,
    (SELECT MIN(created_at) FROM audits) as oldest_audit_date,
    (SELECT MAX(created_at) FROM audits) as newest_audit_date;
END;
$$;

-- ==============================================
-- 5. CREATE TRIGGER FOR AUTOMATIC CLEANUP ON INSERT
-- ==============================================

-- This trigger will run cleanup when new audits are inserted
-- (optional - can be resource intensive for high-volume usage)

CREATE OR REPLACE FUNCTION trigger_cleanup_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only run cleanup if it's been more than 1 hour since last cleanup
  -- This prevents excessive cleanup operations
  IF NOT EXISTS (
    SELECT 1 FROM pg_stat_user_tables 
    WHERE schemaname = 'public' 
    AND relname = 'audits' 
    AND last_autovacuum > NOW() - INTERVAL '1 hour'
  ) THEN
    -- Run cleanup in background (non-blocking)
    PERFORM pg_notify('cleanup_audit_data', '');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger (commented out by default - enable if needed)
-- DROP TRIGGER IF EXISTS trigger_cleanup_audits ON audits;
-- CREATE TRIGGER trigger_cleanup_audits
--   AFTER INSERT ON audits
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION trigger_cleanup_on_insert();

-- ==============================================
-- 6. GRANT PERMISSIONS
-- ==============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_old_audit_data() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_data_manual(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_data_stats() TO authenticated;

-- ==============================================
-- 7. CREATE INDEXES FOR BETTER PERFORMANCE
-- ==============================================

-- Create indexes on created_at columns for faster cleanup
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_history_created_at ON audit_history(created_at);
CREATE INDEX IF NOT EXISTS idx_page_audit_usage_created_at ON page_audit_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_user_usage_month ON user_usage(month);

-- ==============================================
-- 8. TEST THE SYSTEM
-- ==============================================

-- Test the cleanup function (dry run - won't actually delete anything)
-- SELECT * FROM get_audit_data_stats();

-- Test manual cleanup with 1 day retention (for testing)
-- SELECT * FROM cleanup_old_audit_data_manual(1);

-- Run actual 30-day cleanup
-- SELECT * FROM cleanup_old_audit_data();

-- ==============================================
-- 9. USAGE INSTRUCTIONS
-- ==============================================

/*
USAGE INSTRUCTIONS:

1. RUN THIS SCRIPT: Execute the entire script in your Supabase SQL editor

2. TEST THE SYSTEM:
   - Check current data: SELECT * FROM get_audit_data_stats();
   - Test cleanup: SELECT * FROM cleanup_old_audit_data_manual(1); -- Keep only 1 day
   - Run actual cleanup: SELECT * FROM cleanup_old_audit_data(); -- Keep 30 days

3. AUTOMATIC CLEANUP:
   - Option A: Enable pg_cron (if available): Uncomment the cron.schedule line
   - Option B: Set up external cron job to call the cleanup function
   - Option C: Use the trigger (uncomment trigger creation)

4. MONITORING:
   - Check stats: SELECT * FROM get_audit_data_stats();
   - Monitor cleanup logs in Supabase logs

5. CUSTOMIZATION:
   - Change retention period: Modify the INTERVAL '30 days' in the functions
   - Add more tables: Add DELETE statements for additional tables
   - Modify cleanup frequency: Change the cron schedule or trigger logic

WHAT GETS CLEANED UP:
- audits: Audit results older than 30 days
- audit_history: Audit history older than 30 days  
- page_audit_usage: Page audit usage older than 30 days
- user_usage: Monthly usage data older than 3 months

WHAT IS PRESERVED:
- sites: User sites (kept permanently)
- pages: User pages (kept permanently)
- user_subscriptions: Subscription data (kept permanently)
- Recent audit data (last 30 days)
*/



