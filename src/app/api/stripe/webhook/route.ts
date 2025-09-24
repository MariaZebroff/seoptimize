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
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    let event: Stripe.Event

    // For development/testing, skip signature verification if webhook secret is not set
    if (!STRIPE_CONFIG.webhookSecret) {
      console.log('⚠️  Webhook secret not set - skipping signature verification (development mode)')
      try {
        event = JSON.parse(body)
      } catch (err) {
        console.error('Failed to parse webhook body:', err)
        return NextResponse.json(
          { error: 'Invalid JSON body' },
          { status: 400 }
        )
      }
    } else {
      // Production mode with signature verification
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing stripe-signature header' },
          { status: 400 }
        )
      }

      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          STRIPE_CONFIG.webhookSecret
        )
      } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        )
      }
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
    return NextResponse.json(
      { error: 'Webhook handler failed' },
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

    // Create or update user subscription
    const subscriptionData = {
      user_id: userId,
      plan_id: plan,
      plan_name: planName,
      status: 'active',
      stripe_customer_id: `customer_${userId}`,
      stripe_subscription_id: `sub_${paymentIntent.id}`,
      stripe_payment_intent_id: paymentIntent.id,
      amount_paid: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
          plan_name: planName,
          stripe_customer_id: `customer_${userId}`,
          stripe_subscription_id: `sub_${paymentIntent.id}`,
          stripe_payment_intent_id: paymentIntent.id,
          amount_paid: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
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
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
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
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
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
