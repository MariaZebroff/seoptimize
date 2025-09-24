import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { SubscriptionService } from '@/lib/subscriptionService'

export async function GET(request: NextRequest) {
  try {
    // Get user from request
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ usage: null }, { status: 401 })
    }

    const usage = await SubscriptionService.getUserUsage(user.id)
    return NextResponse.json({ usage })

  } catch (error) {
    console.error('Error fetching user usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user usage' },
      { status: 500 }
    )
  }
}
