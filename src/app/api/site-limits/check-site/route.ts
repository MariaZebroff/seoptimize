import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { SiteLimitService } from '@/lib/siteLimitService'
import { getPlanById } from '@/lib/plans'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('Site limit check: User not authenticated, checking plan limits only')
      // For unauthenticated users, we can't check their actual site count
      // but we can still enforce plan limits
      const { searchParams } = new URL(request.url)
      const planId = searchParams.get('planId')
      
      if (!planId) {
        return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
      }
      
      const plan = getPlanById(planId)
      if (!plan) {
        return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
      }
      
      // For unauthenticated users, we can't check actual site count
      // So we'll be conservative and assume they have 0 sites
      const currentCount = 0
      const canAdd = plan.limits.maxSites === -1 || currentCount < plan.limits.maxSites
      
      return NextResponse.json({
        canAdd,
        currentCount,
        maxSites: plan.limits.maxSites,
        reason: canAdd ? undefined : `You have reached your limit of ${plan.limits.maxSites} site(s). Upgrade to a higher plan for more sites.`
      })
    }

    // For authenticated users, extract planId and validate
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    const plan = getPlanById(planId)
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    const siteLimitCheck = await SiteLimitService.canUserAddSite(user.id, plan)

    return NextResponse.json({
      canAdd: siteLimitCheck.canAdd,
      currentCount: siteLimitCheck.currentCount,
      maxSites: siteLimitCheck.maxSites,
      reason: siteLimitCheck.reason
    })

  } catch (error) {
    console.error('Error checking site limits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
