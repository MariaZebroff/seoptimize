import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { getPlanById } from '@/lib/plans'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get user from request
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Checking subscription for user:', user.id, user.email)

    // Check if user has an active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subscriptionError)
      return NextResponse.json({ error: 'Failed to fetch subscription', details: subscriptionError.message }, { status: 500 })
    }

    if (!subscription) {
      return NextResponse.json({ 
        hasSubscription: false,
        message: 'No active subscription found',
        user: {
          id: user.id,
          email: user.email
        }
      })
    }

    // Get plan details
    const plan = getPlanById(subscription.plan_id)

    return NextResponse.json({ 
      hasSubscription: true,
      subscription: subscription,
      plan: plan,
      user: {
        id: user.id,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Error checking subscription:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    )
  }
}
