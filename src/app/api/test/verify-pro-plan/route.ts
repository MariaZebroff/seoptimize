import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    console.log('Verifying Pro Plan for user:', userId)

    const supabase = createSupabaseServiceClient()
    
    // Check if user has an active Pro Plan subscription
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('plan_id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('plan_id', 'pro')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking Pro Plan subscription:', error)
      return NextResponse.json({ 
        error: 'Failed to check subscription', 
        details: error.message 
      }, { status: 500 })
    }

    const hasProPlan = !!subscription

    return NextResponse.json({ 
      hasProPlan,
      subscription: subscription || null
    })

  } catch (error) {
    console.error('Error verifying Pro Plan:', error)
    return NextResponse.json(
      { error: 'Failed to verify Pro Plan', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
