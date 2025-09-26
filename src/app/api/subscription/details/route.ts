import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('Subscription details API: Starting request')
    
    // Use service role key for direct database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get user ID from query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      console.log('Subscription details API: No userId provided')
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    console.log('Subscription details API: Fetching subscription for user:', userId)
    
    // Get user's subscription details directly
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    console.log('Subscription details API: Subscription data:', subscription)
    
    return NextResponse.json({
      subscription: subscription || null,
      success: true
    })

  } catch (error) {
    console.error('Error fetching subscription details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    )
  }
}
