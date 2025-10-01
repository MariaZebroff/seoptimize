-- Fix Pro Plan in Database - Run this in Supabase SQL Editor

-- First, check what's currently in the database
SELECT 'Current subscription' as status;
SELECT 
  id,
  user_id,
  plan_id,
  status,
  amount_paid,
  current_period_end,
  created_at
FROM user_subscriptions 
WHERE user_id = '6e23fb60-f86a-4c81-bbb4-cc64796feed3';

-- Update to Pro plan (this should work)
UPDATE user_subscriptions 
SET 
  plan_id = 'pro',
  amount_paid = 49.99,
  current_period_end = NOW() + INTERVAL '30 days'
WHERE user_id = '6e23fb60-f86a-4c81-bbb4-cc64796feed3';

-- Check if the update worked
SELECT 'After update' as status;
SELECT 
  id,
  user_id,
  plan_id,
  status,
  amount_paid,
  current_period_end,
  created_at
FROM user_subscriptions 
WHERE user_id = '6e23fb60-f86a-4c81-bbb4-cc64796feed3';

-- If still not working, try deleting and recreating
-- DELETE FROM user_subscriptions WHERE user_id = '6e23fb60-f86a-4c81-bbb4-cc64796feed3';

-- INSERT INTO user_subscriptions (
--   user_id,
--   plan_id,
--   status,
--   current_period_start,
--   current_period_end,
--   amount_paid,
--   currency
-- ) VALUES (
--   '6e23fb60-f86a-4c81-bbb4-cc64796feed3',
--   'pro',
--   'active',
--   NOW(),
--   NOW() + INTERVAL '30 days',
--   49.99,
--   'usd'
-- );


