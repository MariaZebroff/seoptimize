import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Get user from request
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Debug: Getting subscription info for user:', user.id)

    // Use service role client for direct database access
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all subscriptions for this user
    const { data: subscriptions, error: subError } = await serviceSupabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    console.log('Debug: Subscriptions query result:', { subscriptions, subError })

    // Get the most recent subscription
    const { data: recentSubscription, error: recentError } = await serviceSupabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    console.log('Debug: Recent subscription query result:', { recentSubscription, recentError })

    // Get active subscriptions
    const { data: activeSubscriptions, error: activeError } = await serviceSupabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    console.log('Debug: Active subscriptions query result:', { activeSubscriptions, activeError })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      allSubscriptions: subscriptions || [],
      recentSubscription: recentSubscription || null,
      activeSubscriptions: activeSubscriptions || [],
      errors: {
        all: subError?.message || null,
        recent: recentError?.message || null,
        active: activeError?.message || null
      }
    })

  } catch (error) {
    console.error('Error getting user subscription debug info:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription info' },
      { status: 500 }
    )
  }
}

