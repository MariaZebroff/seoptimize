import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { SubscriptionService } from '@/lib/subscriptionService'

export async function GET(request: NextRequest) {
  try {
    // Get user from request
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ plan: null }, { status: 401 })
    }

    const plan = await SubscriptionService.getUserPlan(user.id)
    return NextResponse.json({ plan })

  } catch (error) {
    console.error('Error fetching user plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user plan' },
      { status: 500 }
    )
  }
}
