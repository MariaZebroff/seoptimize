import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Create Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Stripe webhook received')
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    console.log('Webhook body length:', body.length)
    console.log('Webhook signature:', signature ? 'present' : 'missing')

    let event: Stripe.Event

    // SECURITY: Always require webhook signature verification
    if (!STRIPE_CONFIG.webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured - webhook security disabled')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    if (!signature) {
      console.error('❌ Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 400 }
      )
    }

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      )
      console.log('✅ Webhook signature verified:', event.type, event.id)
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        
        // Handle payment success and update subscription
        const result = await handlePaymentSuccess(paymentIntent)
        if (!result.success) {
          console.error('Failed to update subscription:', result.error)
          // You might want to send an alert or notification here
        } else {
          console.log('Subscription updated successfully:', result.subscription)
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', failedPayment.id)
        
        // Handle failed payment
        await handlePaymentFailure(failedPayment)
        break

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)
        
        // Handle successful checkout
        await handleCheckoutSuccess(session)
        break

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription created:', subscription.id)
        
        // Handle new subscription
        await handleSubscriptionCreated(subscription)
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', updatedSubscription.id)
        
        // Handle subscription update
        await handleSubscriptionUpdated(updatedSubscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        console.log('Subscription cancelled:', deletedSubscription.id)
        
        // Handle subscription cancellation
        await handleSubscriptionCancelled(deletedSubscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Helper functions to handle different webhook events
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing successful payment:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata: paymentIntent.metadata,
  })

  try {
    const { plan, planName, userId } = paymentIntent.metadata || {}
    
    console.log('Payment metadata:', { plan, planName, userId })
    
    if (!plan) {
      console.error('No plan information in payment metadata')
      return { success: false, error: 'No plan information in payment metadata' }
    }

    if (!userId) {
      console.error('No user ID in payment metadata')
      return { success: false, error: 'No user ID in payment metadata' }
    }

    // Create or update user subscription (using only existing columns)
    const now = new Date()
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    
    const subscriptionData = {
      user_id: userId,
      plan_id: plan,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString()
    }

    console.log('Subscription data to insert/update:', subscriptionData)

    // Check if subscription already exists
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing subscription:', fetchError)
      return { success: false, error: `Error fetching existing subscription: ${fetchError.message}` }
    }

    if (existingSubscription) {
      // Update existing subscription
      console.log('Updating existing subscription:', existingSubscription.id)
      const { data: updatedSubscription, error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: plan,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString()
        })
        .eq('id', existingSubscription.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        return { success: false, error: `Error updating subscription: ${updateError.message}` }
      } else {
        console.log('Subscription updated successfully for user:', userId, updatedSubscription)
        return { success: true, subscription: updatedSubscription }
      }
    } else {
      // Create new subscription
      console.log('Creating new subscription for user:', userId)
      const { data: newSubscription, error: insertError } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)
        .select()
        .single()

      if (insertError) {
        console.error('Error creating subscription:', insertError)
        return { success: false, error: `Error creating subscription: ${insertError.message}` }
      } else {
        console.log('Subscription created successfully for user:', userId, newSubscription)
        return { success: true, subscription: newSubscription }
      }
    }

  } catch (error) {
    console.error('Error processing payment success:', error)
    return { success: false, error: `Error processing payment success: ${error}` }
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing failed payment:', {
    id: paymentIntent.id,
    last_payment_error: paymentIntent.last_payment_error,
  })

  // TODO: Implement your business logic here
  // - Notify user of payment failure
  // - Send retry email
  // - Log the failure
}

async function handleCheckoutSuccess(session: Stripe.Checkout.Session) {
  console.log('Processing successful checkout:', {
    id: session.id,
    customer_email: session.customer_details?.email,
    amount_total: session.amount_total,
    metadata: session.metadata,
  })

  // TODO: Implement your business logic here
  // - Activate user's subscription
  // - Send welcome email
  // - Grant access to premium features
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing new subscription:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    current_period_start: (subscription as any).current_period_start,
    current_period_end: (subscription as any).current_period_end,
  })

  // TODO: Implement your business logic here
  // - Activate user's subscription
  // - Send welcome email
  // - Grant access to premium features
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription update:', {
    id: subscription.id,
    status: subscription.status,
    current_period_start: (subscription as any).current_period_start,
    current_period_end: (subscription as any).current_period_end,
  })

  // TODO: Implement your business logic here
  // - Update user's subscription status
  // - Handle plan changes
  // - Send notification email
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  console.log('Processing subscription cancellation:', {
    id: subscription.id,
    customer: subscription.customer,
    canceled_at: subscription.canceled_at,
  })

  // TODO: Implement your business logic here
  // - Revoke user's premium access
  // - Send cancellation confirmation email
  // - Offer retention incentives
}
