import { NextRequest, NextResponse } from 'next/server'
import { stripe, validateStripeConfig } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    // Validate Stripe configuration
    validateStripeConfig()

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const paymentIntentId = searchParams.get('payment_intent_id')

    if (!sessionId && !paymentIntentId) {
      return NextResponse.json(
        { error: 'Session ID or Payment Intent ID is required' },
        { status: 400 }
      )
    }

    let paymentData = null

    if (sessionId) {
      // Retrieve checkout session
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      paymentData = {
        id: session.id,
        status: session.payment_status,
        amount: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_details?.email,
        metadata: session.metadata,
      }
    } else if (paymentIntentId) {
      // Retrieve payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      paymentData = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      }
    }

    return NextResponse.json({ payment: paymentData })

  } catch (error) {
    console.error('Error retrieving payment status:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve payment status' },
      { status: 500 }
    )
  }
}



