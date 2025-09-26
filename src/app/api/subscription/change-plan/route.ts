import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId, planId } = await request.json()
    
    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'User ID and Plan ID are required' },
        { status: 400 }
      )
    }

    console.log('Changing plan for user:', userId, 'to plan:', planId)

    // Use service role key for direct database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // For free plan, just update the subscription
    if (planId === 'free') {
      const { data: updatedSubscription, error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: 'free',
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('Error changing to free plan:', updateError)
        return NextResponse.json(
          { error: 'Failed to change to free plan', details: updateError.message },
          { status: 500 }
        )
      }

      console.log('Successfully changed to free plan:', updatedSubscription)

      return NextResponse.json({
        success: true,
        message: 'Successfully switched to Free plan',
        subscription: updatedSubscription
      })
    }

    // For paid plans, we need to handle payment
    // This endpoint is mainly for free plan changes
    // Paid plan changes should go through the payment flow
    return NextResponse.json(
      { error: 'Paid plan changes must go through the payment flow' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error changing plan:', error)
    return NextResponse.json(
      { error: 'Failed to change plan' },
      { status: 500 }
    )
  }
}


