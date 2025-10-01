import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting reset all users to free plan')

    // Use service role key for direct database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update all user subscriptions to free plan
    const { data: updatedSubscriptions, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        plan_id: 'free',
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .neq('plan_id', 'free') // Only update non-free plans
      .select('user_id')

    if (updateError) {
      console.error('Error resetting users to free plan:', updateError)
      return NextResponse.json(
        { error: 'Failed to reset users to free plan', details: updateError.message },
        { status: 500 }
      )
    }

    const affectedUsers = updatedSubscriptions?.length || 0

    console.log(`Successfully reset ${affectedUsers} users to free plan`)

    // Also clear any localStorage data that might be cached
    // This is handled on the client side, but we log it for reference
    console.log('Note: Client-side localStorage cache should be cleared manually')

    return NextResponse.json({
      success: true,
      message: `Successfully reset ${affectedUsers} users to free plan`,
      affectedUsers: affectedUsers,
      updatedSubscriptions: updatedSubscriptions
    })

  } catch (error) {
    console.error('Error in reset all users to free:', error)
    return NextResponse.json(
      { error: 'Failed to reset users to free plan' },
      { status: 500 }
    )
  }
}



