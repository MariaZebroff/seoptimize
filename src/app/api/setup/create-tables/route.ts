import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('Creating subscription tables...')

    // Use service role client for direct database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const results: any = {
      tables: {},
      errors: {}
    }

    // Create user_subscriptions table
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
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
        `
      })

      results.tables.user_subscriptions = {
        created: !error,
        error: error?.message || null
      }
    } catch (error) {
      results.tables.user_subscriptions = {
        created: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Create user_usage table
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS user_usage (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            month VARCHAR(7) NOT NULL,
            audits_used INTEGER NOT NULL DEFAULT 0,
            ai_calls_used INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, month)
          );
        `
      })

      results.tables.user_usage = {
        created: !error,
        error: error?.message || null
      }
    } catch (error) {
      results.tables.user_usage = {
        created: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Create indexes
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
          CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
          CREATE INDEX IF NOT EXISTS idx_user_usage_user_id_month ON user_usage(user_id, month);
        `
      })

      results.indexes = {
        created: !error,
        error: error?.message || null
      }
    } catch (error) {
      results.indexes = {
        created: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Enable RLS and create policies
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
          ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
          DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON user_subscriptions;
          DROP POLICY IF EXISTS "Users can update their own subscriptions" ON user_subscriptions;
          
          CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
            FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
            FOR UPDATE USING (auth.uid() = user_id);
          
          DROP POLICY IF EXISTS "Users can view their own usage" ON user_usage;
          DROP POLICY IF EXISTS "Users can insert their own usage" ON user_usage;
          DROP POLICY IF EXISTS "Users can update their own usage" ON user_usage;
          
          CREATE POLICY "Users can view their own usage" ON user_usage
            FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can insert their own usage" ON user_usage
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Users can update their own usage" ON user_usage
            FOR UPDATE USING (auth.uid() = user_id);
        `
      })

      results.policies = {
        created: !error,
        error: error?.message || null
      }
    } catch (error) {
      results.policies = {
        created: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Table creation completed',
      results
    })

  } catch (error) {
    console.error('Error creating tables:', error)
    return NextResponse.json(
      { error: 'Failed to create tables' },
      { status: 500 }
    )
  }
}

