import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('Manual set Basic plan: Setting subscription for email:', email)

    // Use service role key for direct database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error fetching users:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found with that email' },
        { status: 404 }
      )
    }

    console.log('Found user:', user.id)

    // Create or update subscription to Basic plan
    const now = new Date()
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    const subscriptionData = {
      user_id: user.id,
      plan_id: 'basic',
      status: 'active',
      stripe_customer_id: `customer_${user.id}`,
      stripe_subscription_id: `sub_${user.id}_${Date.now()}`,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let result
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
        return NextResponse.json(
          { error: 'Failed to update subscription', details: updateError.message },
          { status: 500 }
        )
      }
      result = updated
    } else {
      // Create new subscription
      const { data: newSubscription, error: insertError } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)
        .select()
        .single()

      if (insertError) {
        console.error('Error creating subscription:', insertError)
        return NextResponse.json(
          { error: 'Failed to create subscription', details: insertError.message },
          { status: 500 }
        )
      }
      result = newSubscription
    }

    console.log('Basic plan subscription set successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'Basic plan subscription set successfully',
      user: {
        id: user.id,
        email: user.email
      },
      subscription: result
    })

  } catch (error) {
    console.error('Error setting Basic plan subscription:', error)
    return NextResponse.json(
      { error: 'Failed to set Basic plan subscription' },
      { status: 500 }
    )
  }
}


