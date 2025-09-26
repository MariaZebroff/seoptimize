import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for direct database access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating Basic plan subscription...')
    
    // Get user ID from request body
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    console.log('Creating subscription for user:', userId)

    // Check if user_subscriptions table exists
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('user_subscriptions')
        .select('count')
        .limit(1)

      if (tableError) {
        console.error('Table check error:', tableError)
        return NextResponse.json(
          { 
            error: 'user_subscriptions table does not exist or is not accessible',
            details: tableError.message,
            solution: 'Run the SQL script in Supabase SQL Editor: fix-database-tables.sql'
          },
          { status: 500 }
        )
      }

      console.log('✅ user_subscriptions table exists and is accessible')
    } catch (error) {
      console.error('Table access error:', error)
      return NextResponse.json(
        { 
          error: 'Cannot access user_subscriptions table',
          details: error instanceof Error ? error.message : 'Unknown error',
          solution: 'Run the SQL script in Supabase SQL Editor: fix-database-tables.sql'
        },
        { status: 500 }
      )
    }

    // Check if user already has a Basic plan subscription
    const { data: existingSubscriptions, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_id', 'basic')
      .eq('status', 'active')

    if (checkError) {
      console.error('Check existing subscription error:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing subscription', details: checkError.message },
        { status: 500 }
      )
    }

    if (existingSubscriptions && existingSubscriptions.length > 0) {
      console.log('✅ User already has Basic plan subscription')
      return NextResponse.json({
        success: true,
        message: 'User already has Basic plan subscription',
        subscription: existingSubscriptions[0]
      })
    }

    // Create Basic plan subscription
    const now = new Date()
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    const { data: subscription, error: createError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: 'basic',
        plan_name: 'Basic Plan',
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        amount_paid: 9.99,
        currency: 'usd'
      })
      .select()
      .single()

    if (createError) {
      console.error('Create subscription error:', createError)
      return NextResponse.json(
        { error: 'Failed to create subscription', details: createError.message },
        { status: 500 }
      )
    }

    console.log('✅ Basic plan subscription created successfully:', subscription)

    return NextResponse.json({
      success: true,
      message: 'Basic plan subscription created successfully',
      subscription: subscription
    })

  } catch (error) {
    console.error('Error creating Basic plan subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

