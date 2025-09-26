-- Update your subscription to Pro plan
-- Run this in Supabase SQL Editor

UPDATE user_subscriptions 
SET 
  plan_id = 'pro',
  amount_paid = 49.99,
  current_period_end = NOW() + INTERVAL '30 days'
WHERE user_id = '6e23fb60-f86a-4c81-bbb4-cc64796feed3';

-- Verify the update
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

