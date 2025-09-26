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

    console.log('Reactivating subscription for user:', userId)

    // Use service role key for direct database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update subscription status to active
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'cancelled')
      .select()
      .single()

    if (updateError) {
      console.error('Error reactivating subscription:', updateError)
      return NextResponse.json(
        { error: 'Failed to reactivate subscription', details: updateError.message },
        { status: 500 }
      )
    }

    if (!updatedSubscription) {
      return NextResponse.json(
        { error: 'No cancelled subscription found to reactivate' },
        { status: 404 }
      )
    }

    console.log('Subscription reactivated successfully:', updatedSubscription)

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: updatedSubscription
    })

  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    )
  }
}


