# 🧹 30-Day Data Retention System - Setup Guide

## Overview
This system automatically cleans up audit data older than 30 days to keep your database optimized while preserving important user data.

## What Gets Cleaned Up
- **audits** - Audit results older than 30 days
- **audit_history** - Audit history older than 30 days  
- **page_audit_usage** - Page audit usage older than 30 days
- **user_usage** - Monthly usage data older than 3 months

## What Is Preserved
- **sites** - User sites (kept permanently)
- **pages** - User pages (kept permanently)
- **user_subscriptions** - Subscription data (kept permanently)
- **Recent audit data** - Last 30 days

## Setup Instructions

### Step 1: Run the Database Setup
Execute the SQL script in your Supabase SQL editor:

```sql
-- Copy and paste the entire content of 30-day-retention-system.sql
-- This will create all necessary functions and indexes
```

### Step 2: Test the System
1. **Visit the test page**: `http://localhost:3000/test-cleanup`
2. **Get current statistics**: Click "📊 Get Statistics"
3. **Test manual cleanup**: Use "🧹 Manual" with 1 day to test
4. **Run actual cleanup**: Click "🧹 Run 30-Day Cleanup"

### Step 3: Set Up Automatic Cleanup (Optional)

#### Option A: Using pg_cron (Recommended)
```sql
-- Enable pg_cron extension in Supabase
-- Then uncomment this line in the SQL script:
SELECT cron.schedule('cleanup-audit-data', '0 2 * * *', 'SELECT cleanup_old_audit_data();');
```

#### Option B: External Cron Job
Set up a cron job to call the cleanup API:
```bash
# Run daily at 2 AM
0 2 * * * curl -X POST http://your-domain.com/api/admin/cleanup-audit-data -H "Content-Type: application/json" -d '{"action":"cleanup"}'
```

#### Option C: Manual Cleanup
Run cleanup manually when needed using the test page or API.

## API Endpoints

### Get Statistics
```bash
GET /api/admin/cleanup-audit-data
```

### Run 30-Day Cleanup
```bash
POST /api/admin/cleanup-audit-data
Content-Type: application/json

{
  "action": "cleanup"
}
```

### Run Manual Cleanup
```bash
POST /api/admin/cleanup-audit-data
Content-Type: application/json

{
  "action": "cleanup_manual",
  "daysToKeep": 7
}
```

## Testing the System

### 1. Check Current Data
```sql
-- Run in Supabase SQL editor
SELECT * FROM get_audit_data_stats();
```

### 2. Test Manual Cleanup (Safe)
```sql
-- Keep only 1 day of data (for testing)
SELECT * FROM cleanup_old_audit_data_manual(1);
```

### 3. Run Actual Cleanup
```sql
-- Keep 30 days of data
SELECT * FROM cleanup_old_audit_data();
```

### 4. Verify Results
```sql
-- Check stats again
SELECT * FROM get_audit_data_stats();
```

## Monitoring

### Check Cleanup Statistics
```sql
SELECT * FROM get_audit_data_stats();
```

### Monitor Database Size
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('audits', 'audit_history', 'page_audit_usage', 'user_usage')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Customization

### Change Retention Period
Modify the functions in the SQL script:
```sql
-- Change from 30 days to 60 days
cutoff_date := NOW() - INTERVAL '60 days';
```

### Add More Tables
Add DELETE statements for additional tables:
```sql
-- Add cleanup for another table
DELETE FROM your_table 
WHERE created_at < cutoff_date;
```

### Modify Cleanup Frequency
Change the cron schedule:
```sql
-- Run every 6 hours instead of daily
SELECT cron.schedule('cleanup-audit-data', '0 */6 * * *', 'SELECT cleanup_old_audit_data();');
```

## Safety Features

### 1. Dry Run Testing
Always test with manual cleanup first using a small number of days.

### 2. Backup Before Cleanup
```sql
-- Create backup of old data before cleanup
CREATE TABLE audits_backup AS 
SELECT * FROM audits WHERE created_at < NOW() - INTERVAL '30 days';
```

### 3. Gradual Cleanup
```sql
-- Clean up in batches to avoid locking
DELETE FROM audits 
WHERE created_at < NOW() - INTERVAL '30 days' 
AND id IN (
  SELECT id FROM audits 
  WHERE created_at < NOW() - INTERVAL '30 days' 
  LIMIT 1000
);
```

## Troubleshooting

### Function Not Found Error
```sql
-- Check if functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%cleanup%';
```

### Permission Denied
```sql
-- Grant permissions
GRANT EXECUTE ON FUNCTION cleanup_old_audit_data() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_data_manual(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_data_stats() TO authenticated;
```

### Cleanup Not Running
1. Check if pg_cron is enabled
2. Verify cron job exists: `SELECT * FROM cron.job;`
3. Check cron logs: `SELECT * FROM cron.job_run_details;`

## Performance Considerations

### Indexes
The system creates indexes on `created_at` columns for faster cleanup:
```sql
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_history_created_at ON audit_history(created_at);
CREATE INDEX IF NOT EXISTS idx_page_audit_usage_created_at ON page_audit_usage(created_at);
```

### Batch Processing
For large datasets, consider batch processing:
```sql
-- Process in batches of 1000 records
DO $$
DECLARE
  batch_size INTEGER := 1000;
  deleted_count INTEGER;
BEGIN
  LOOP
    DELETE FROM audits 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND id IN (
      SELECT id FROM audits 
      WHERE created_at < NOW() - INTERVAL '30 days' 
      LIMIT batch_size
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    EXIT WHEN deleted_count = 0;
    COMMIT;
  END LOOP;
END $$;
```

## Expected Results

### Before Cleanup
- Large database with old audit data
- Slower queries on audit tables
- Higher storage costs

### After Cleanup
- Optimized database with only recent data
- Faster queries on audit tables
- Lower storage costs
- Preserved user sites, pages, and subscriptions

## Next Steps

1. **Run the SQL script** in your Supabase SQL editor
2. **Test the system** using the test page
3. **Set up automatic cleanup** using pg_cron or external cron
4. **Monitor the system** regularly
5. **Customize** retention periods as needed

The system is now ready to keep your database optimized while preserving important user data! 🎉


