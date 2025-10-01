import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for direct database access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Auto-creating database tables...')
    
    const results: any = {
      tables: {},
      errors: {}
    }

    // Try to create user_subscriptions table
    try {
      // First check if table exists
      const { data: tableCheck, error: checkError } = await supabase
        .from('user_subscriptions')
        .select('count')
        .limit(1)

      if (checkError && checkError.code === '42P01') {
        console.log('user_subscriptions table does not exist, creating...')
        
        // Create the table using raw SQL
        const { data: createData, error: createError } = await supabase
          .rpc('exec_sql', {
            sql: `
              CREATE TABLE user_subscriptions (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                plan_id VARCHAR(50) NOT NULL DEFAULT 'free',
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
          created: !createError,
          error: createError?.message || null
        }
      } else if (checkError) {
        results.tables.user_subscriptions = {
          exists: false,
          error: checkError.message
        }
      } else {
        results.tables.user_subscriptions = {
          exists: true,
          accessible: true
        }
      }
    } catch (error) {
      results.tables.user_subscriptions = {
        created: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Try to create user_usage table
    try {
      const { data: tableCheck, error: checkError } = await supabase
        .from('user_usage')
        .select('count')
        .limit(1)

      if (checkError && checkError.code === '42P01') {
        console.log('user_usage table does not exist, creating...')
        
        const { data: createData, error: createError } = await supabase
          .rpc('exec_sql', {
            sql: `
              CREATE TABLE user_usage (
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
          created: !createError,
          error: createError?.message || null
        }
      } else if (checkError) {
        results.tables.user_usage = {
          exists: false,
          error: checkError.message
        }
      } else {
        results.tables.user_usage = {
          exists: true,
          accessible: true
        }
      }
    } catch (error) {
      results.tables.user_usage = {
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
    console.error('Error auto-creating tables:', error)
    return NextResponse.json(
      { error: 'Failed to auto-create tables' },
      { status: 500 }
    )
  }
}


