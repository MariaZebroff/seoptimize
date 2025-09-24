import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabaseServer'
import { getPlanById } from '@/lib/plans'

export async function POST(request: NextRequest) {
  try {
    const { userId, planId = 'pro' } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    console.log('Setting Pro Plan for user:', userId)

    const supabase = createSupabaseServiceClient()

    // Get Pro plan details
    const proPlan = getPlanById('pro')
    if (!proPlan) {
      return NextResponse.json({ error: 'Pro plan not found' }, { status: 404 })
    }

    // Prepare subscription data (without plan_name to avoid column issues)
    const subscriptionData = {
      user_id: userId,
      plan_id: planId,
      status: 'active',
      stripe_customer_id: `test_customer_${userId}`,
      stripe_subscription_id: `test_sub_${userId}`,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (existingSubscription) {
      // Update existing subscription
      const { data: updatedSubscription, error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: planId,
          stripe_customer_id: `test_customer_${userId}`,
          stripe_subscription_id: `test_sub_${userId}`,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        return NextResponse.json({ error: 'Failed to update subscription', details: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Subscription updated to Pro Plan',
        subscription: updatedSubscription,
        plan: proPlan
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
        message: 'Subscription created for Pro Plan',
        subscription: newSubscription,
        plan: proPlan
      })
    }

  } catch (error) {
    console.error('Error setting Pro Plan:', error)
    return NextResponse.json(
      { error: 'Failed to set Pro Plan' },
      { status: 500 }
    )
  }
}
