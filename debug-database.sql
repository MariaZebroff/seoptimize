-- DEBUG DATABASE - Run these queries in Supabase SQL Editor
-- Copy and paste the results here so I can see what's in the database

-- 1. Check if user_subscriptions table exists and has data
SELECT 'user_subscriptions table check' as query_name;
SELECT COUNT(*) as total_subscriptions FROM user_subscriptions;

-- 2. Check all subscriptions in the table
SELECT 'All subscriptions' as query_name;
SELECT 
  id,
  user_id,
  plan_id,
  plan_name,
  status,
  amount_paid,
  current_period_start,
  current_period_end,
  created_at
FROM user_subscriptions
ORDER BY created_at DESC;

-- 3. Find your user ID by email
SELECT 'Find user by email' as query_name;
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users 
WHERE email = 'zebroffmaria12@gmail.com';

-- 4. Check subscriptions for your specific user (replace USER_ID with the ID from query 3)
SELECT 'Subscriptions for your user' as query_name;
-- First run query 3 to get your user_id, then replace USER_ID below with that ID
-- SELECT * FROM user_subscriptions WHERE user_id = 'USER_ID_FROM_QUERY_3';

-- 5. Check if user_usage table exists and has data
SELECT 'user_usage table check' as query_name;
SELECT COUNT(*) as total_usage_records FROM user_usage;

-- 6. Check all usage records
SELECT 'All usage records' as query_name;
SELECT 
  id,
  user_id,
  month,
  audits_used,
  ai_calls_used,
  created_at
FROM user_usage
ORDER BY created_at DESC;

-- 7. Check if there are any active Basic plan subscriptions
SELECT 'Active Basic plan subscriptions' as query_name;
SELECT 
  id,
  user_id,
  plan_id,
  plan_name,
  status,
  amount_paid,
  created_at
FROM user_subscriptions 
WHERE plan_id = 'basic' AND status = 'active'
ORDER BY created_at DESC;

-- 8. Check table structure
SELECT 'Table structure check' as query_name;
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_subscriptions', 'user_usage')
ORDER BY table_name, ordinal_position;

