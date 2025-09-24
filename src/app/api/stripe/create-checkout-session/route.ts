import { NextRequest, NextResponse } from 'next/server'
import { stripe, validateStripeConfig, STRIPE_CONFIG } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    validateStripeConfig()

    const { 
      priceId, 
      mode = 'payment', // 'payment', 'subscription', or 'setup'
      successUrl,
      cancelUrl,
      metadata = {}
    } = await request.json()

    // Validate required fields
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${STRIPE_CONFIG.appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${STRIPE_CONFIG.appUrl}/payment/cancel`,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

