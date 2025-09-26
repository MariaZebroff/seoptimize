import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Use service role key for direct database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get user ID and plan from request body or try to get from auth
    const body = await request.json().catch(() => ({}))
    let userId = body.userId
    let planId = body.planId || 'basic' // Default to basic plan

    // If no userId in body, try to get from auth (this might fail, but we'll handle it)
    if (!userId) {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          return NextResponse.json(
            { error: 'User ID required. Please provide userId in request body.' },
            { status: 400 }
          )
        }
        userId = user.id
      } catch (error) {
        return NextResponse.json(
          { error: 'User ID required. Please provide userId in request body.' },
          { status: 400 }
        )
      }
    }

    console.log('Creating subscription for user:', userId)

    // Create a test subscription
    const now = new Date()
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    const subscriptionData = {
      user_id: userId,
      plan_id: planId,
      status: 'active',
      stripe_customer_id: `test_customer_${userId}`,
      stripe_subscription_id: `test_sub_${userId}`,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Update existing subscription
      const { data: updated, error: updateError } = await supabase
        .from('user_subscriptions')
        .update(subscriptionData)
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        return NextResponse.json({ error: 'Failed to update subscription', details: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Subscription updated',
        subscription: updated
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
        message: 'Subscription created',
        subscription: newSubscription
      })
    }

  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
