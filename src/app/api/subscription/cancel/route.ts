import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Cancelling subscription for user:', userId)

    // Use service role key for direct database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update subscription status to cancelled
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'active')
      .select()
      .single()

    if (updateError) {
      console.error('Error cancelling subscription:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel subscription', details: updateError.message },
        { status: 500 }
      )
    }

    if (!updatedSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found to cancel' },
        { status: 404 }
      )
    }

    console.log('Subscription cancelled successfully:', updatedSubscription)

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: updatedSubscription,
      accessUntil: updatedSubscription.current_period_end
    })

  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}


