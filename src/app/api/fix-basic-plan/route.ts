import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { SubscriptionService } from '@/lib/subscriptionService'

export async function POST(request: NextRequest) {
  try {
    // Get user from request
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Fix Basic Plan: Setting subscription for user:', user.id)

    // Create or update subscription to Basic plan
    const subscription = await SubscriptionService.createOrUpdateSubscription(
      user.id,
      'basic',
      `customer_${user.id}`,
      `sub_${user.id}_${Date.now()}`
    )

    console.log('Fix Basic Plan: Subscription created/updated:', subscription)

    return NextResponse.json({
      success: true,
      message: 'Basic plan subscription set successfully',
      subscription
    })

  } catch (error) {
    console.error('Error setting Basic plan subscription:', error)
    return NextResponse.json(
      { error: 'Failed to set Basic plan subscription' },
      { status: 500 }
    )
  }
}


