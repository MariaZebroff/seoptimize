import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, planId, paymentIntentId } = await request.json()
    
    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'userId and planId are required' },
        { status: 400 }
      )
    }

    console.log('Test webhook: Processing payment for user:', userId, 'plan:', planId)

    // Simulate the webhook processing
    const subscriptionData = {
      user_id: userId,
      plan_id: planId,
      status: 'active',
      stripe_customer_id: `customer_${userId}`,
      stripe_subscription_id: `sub_${paymentIntentId || userId}_${Date.now()}`,
      stripe_payment_intent_id: paymentIntentId || `pi_${userId}_${Date.now()}`,
      amount_paid: planId === 'basic' ? 9.99 : planId === 'pro' ? 49.99 : 0,
      currency: 'usd',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Test webhook: Subscription data:', subscriptionData)

    // Check if subscription already exists
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing subscription:', fetchError)
      return NextResponse.json(
        { error: `Error fetching existing subscription: ${fetchError.message}` },
        { status: 500 }
      )
    }

    let result
    if (existingSubscription) {
      // Update existing subscription
      console.log('Test webhook: Updating existing subscription:', existingSubscription.id)
      const { data: updatedSubscription, error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: planId,
          stripe_customer_id: `customer_${userId}`,
          stripe_subscription_id: `sub_${paymentIntentId || userId}_${Date.now()}`,
          stripe_payment_intent_id: paymentIntentId || `pi_${userId}_${Date.now()}`,
          amount_paid: planId === 'basic' ? 9.99 : planId === 'pro' ? 49.99 : 0,
          currency: 'usd',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        return NextResponse.json(
          { error: `Error updating subscription: ${updateError.message}` },
          { status: 500 }
        )
      } else {
        console.log('Test webhook: Subscription updated successfully for user:', userId, updatedSubscription)
        result = updatedSubscription
      }
    } else {
      // Create new subscription
      console.log('Test webhook: Creating new subscription for user:', userId)
      const { data: newSubscription, error: insertError } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)
        .select()
        .single()

      if (insertError) {
        console.error('Error creating subscription:', insertError)
        return NextResponse.json(
          { error: `Error creating subscription: ${insertError.message}` },
          { status: 500 }
        )
      } else {
        console.log('Test webhook: Subscription created successfully for user:', userId, newSubscription)
        result = newSubscription
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      subscription: result
    })

  } catch (error) {
    console.error('Error processing test webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}


