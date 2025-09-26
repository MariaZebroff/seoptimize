import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { SubscriptionService } from '@/lib/subscriptionService'

export async function GET(request: NextRequest) {
  try {
    // Get user from request
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Debug: Getting subscription info for user:', user.id)

    // Get user's plan
    const plan = await SubscriptionService.getUserPlan(user.id)
    console.log('Debug: User plan:', plan)

    // Get user's subscription
    const subscription = await SubscriptionService.getUserSubscription(user.id)
    console.log('Debug: User subscription:', subscription)

    // Get user's usage
    const usage = await SubscriptionService.getUserUsage(user.id)
    console.log('Debug: User usage:', usage)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      plan,
      subscription,
      usage
    })

  } catch (error) {
    console.error('Error getting user subscription debug info:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription info' },
      { status: 500 }
    )
  }
}

