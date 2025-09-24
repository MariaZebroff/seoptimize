-- Reset Audit Limits for Testing
-- Run these commands in your Supabase SQL Editor

-- 1. Reset user usage for current month (this will allow users to perform audits again)
DELETE FROM user_usage 
WHERE month = TO_CHAR(CURRENT_DATE, 'YYYY-MM');

-- 2. Reset audit history (optional - only if you want to clear all audit history)
DELETE FROM audit_history;

-- 3. Reset user subscriptions (optional - only if you want to reset all subscriptions)
DELETE FROM user_subscriptions;

-- 4. Alternative: Reset only for specific users (replace 'user-id-here' with actual user ID)
-- DELETE FROM user_usage 
-- WHERE user_id = 'user-id-here' 
-- AND month = TO_CHAR(CURRENT_DATE, 'YYYY-MM');

-- 5. Check what's in the user_usage table before reset
SELECT 
    user_id,
    month,
    audits_used,
    ai_calls_used,
    created_at
FROM user_usage 
ORDER BY created_at DESC;

-- 6. Check current usage after reset
SELECT 
    user_id,
    month,
    audits_used,
    ai_calls_used,
    created_at
FROM user_usage 
ORDER BY created_at DESC;

-- 7. Check audit history after reset
SELECT 
    id,
    user_id,
    url,
    created_at
FROM audit_history 
ORDER BY created_at DESC 
LIMIT 10;
