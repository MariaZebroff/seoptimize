import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Try to get user from request first
    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // No-op for API routes
          },
        },
      }
    )
    
    const { data: { user }, error } = await supabaseClient.auth.getUser()
    
    // If no user from auth, try to get user ID from request body
    let userId = user?.id
    if (!userId) {
      const body = await request.json().catch(() => ({}))
      userId = body.userId
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'No user ID provided' }, { status: 400 })
    }

    // For testing purposes, if the user doesn't exist in auth.users, 
    // we'll create a mock subscription record without the foreign key constraint
    console.log('Setting Basic Plan for user:', userId)

    // Create or update user subscription to Basic Plan
    const now = new Date()
    const currentPeriodStart = now.toISOString()
    const currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    
    const subscriptionData = {
      user_id: userId,
      plan_id: 'basic',
      status: 'active',
      stripe_customer_id: 'test_customer_' + Date.now(),
      stripe_subscription_id: 'test_subscription_' + Date.now(),
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd
    }

    // Check if subscription already exists
    const { data: existingSubscription, error: selectError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    // If table doesn't exist, return helpful error
    if (selectError && selectError.code === '42P01') {
      return NextResponse.json({ 
        error: 'Database table not found',
        message: 'The user_subscriptions table does not exist. Please run the database schema migration first.',
        instructions: 'Go to your Supabase dashboard > SQL Editor and run the database-schema-subscriptions.sql file'
      }, { status: 500 })
    }

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: 'basic',
          status: 'active',
          stripe_customer_id: 'test_customer_' + Date.now(),
          stripe_subscription_id: 'test_subscription_' + Date.now(),
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        return NextResponse.json({ error: 'Failed to update subscription', details: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Subscription updated to Basic Plan',
        subscription: { id: existingSubscription.id, ...subscriptionData }
      })
    } else {
      // Create new subscription
      const { data: newSubscription, error: insertError } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)
        .select()
        .single()

      if (insertError) {
        console.error('Error creating subscription:', insertError)
        return NextResponse.json({ error: 'Failed to create subscription', details: insertError.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Subscription created for Basic Plan',
        subscription: newSubscription
      })
    }

  } catch (error) {
    console.error('Error setting Basic Plan:', error)
    return NextResponse.json(
      { error: 'Failed to set Basic Plan' },
      { status: 500 }
    )
  }
}
