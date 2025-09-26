import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting expired subscription cleanup')

    // Use service role key for direct database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const now = new Date().toISOString()

    // Find cancelled subscriptions that have passed their period end
    const { data: expiredSubscriptions, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('status', 'cancelled')
      .lt('current_period_end', now)

    if (fetchError) {
      console.error('Error fetching expired subscriptions:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch expired subscriptions', details: fetchError.message },
        { status: 500 }
      )
    }

    console.log(`Found ${expiredSubscriptions?.length || 0} expired subscriptions`)

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired subscriptions found',
        processed: 0
      })
    }

    // Update expired subscriptions to free tier
    const userIds = expiredSubscriptions.map(sub => sub.user_id)
    
    const { data: updatedSubscriptions, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        plan_id: 'free',
        status: 'active',
        updated_at: now
      })
      .in('user_id', userIds)
      .select()

    if (updateError) {
      console.error('Error updating expired subscriptions:', updateError)
      return NextResponse.json(
        { error: 'Failed to update expired subscriptions', details: updateError.message },
        { status: 500 }
      )
    }

    console.log(`Successfully updated ${updatedSubscriptions?.length || 0} expired subscriptions to free tier`)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${updatedSubscriptions?.length || 0} expired subscriptions`,
      processed: updatedSubscriptions?.length || 0,
      subscriptions: updatedSubscriptions
    })

  } catch (error) {
    console.error('Error in subscription cleanup:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup expired subscriptions' },
      { status: 500 }
    )
  }
}


