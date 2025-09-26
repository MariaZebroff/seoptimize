-- Fix Database Tables - Run this in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor → New Query

-- 1. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL DEFAULT 'free',
  plan_name VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'incomplete')),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  amount_paid DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'usd',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_usage table
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  audits_used INTEGER NOT NULL DEFAULT 0,
  ai_calls_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id_month ON user_usage(user_id, month);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can insert their own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can update their own usage" ON user_usage;

-- 6. Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. Create RLS policies for user_usage
CREATE POLICY "Users can view their own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON user_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. Create function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON user_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_usage_updated_at ON user_usage;
CREATE TRIGGER update_user_usage_updated_at 
  BEFORE UPDATE ON user_usage 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Insert default free subscription for your user (replace with your actual user ID)
-- First, let's find your user ID
SELECT id, email FROM auth.users WHERE email = 'zebroffmaria12@gmail.com';

-- Then insert a free subscription (replace 'YOUR_USER_ID_HERE' with the actual user ID from above)
-- INSERT INTO user_subscriptions (user_id, plan_id, plan_name, status, current_period_start, current_period_end)
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'free',
--   'Free Tier',
--   'active',
--   NOW(),
--   NOW() + INTERVAL '1 year'
-- );

-- 11. Verify tables were created
SELECT 'user_subscriptions' as table_name, count(*) as row_count FROM user_subscriptions
UNION ALL
SELECT 'user_usage' as table_name, count(*) as row_count FROM user_usage;

