import { NextRequest, NextResponse } from 'next/server'
import { stripe, validateStripeConfig } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    validateStripeConfig()

    const { amount, currency = 'usd', metadata = {} } = await request.json()

    // Debug logging
    console.log('Payment intent request:', { amount, currency, metadata })

    // Validate amount
    if (!amount || amount < 0.50) { // Minimum $0.50
      console.log('Amount validation failed:', { amount, isValid: !!amount, isAboveMin: amount >= 0.50 })
      return NextResponse.json(
        { error: 'Invalid amount. Minimum is $0.50' },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
