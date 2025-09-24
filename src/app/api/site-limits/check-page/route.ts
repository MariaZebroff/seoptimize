import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { SiteLimitService } from '@/lib/siteLimitService'
import { getPlanById } from '@/lib/plans'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('Page limit check: User not authenticated, checking plan limits only')
      // For unauthenticated users, we can't check their actual page count
      // but we can still enforce plan limits
      const { searchParams } = new URL(request.url)
      const siteId = searchParams.get('siteId')
      const planId = searchParams.get('planId')
      
      if (!siteId || !planId) {
        return NextResponse.json({ error: 'Site ID and Plan ID are required' }, { status: 400 })
      }
      
      const plan = getPlanById(planId)
      if (!plan) {
        return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
      }
      
      // For unauthenticated users, we can't check actual page count
      // So we'll be conservative and assume they have 0 pages
      const currentCount = 0
      const canAdd = plan.limits.maxPagesPerSite === -1 || currentCount < plan.limits.maxPagesPerSite
      
      return NextResponse.json({
        canAdd,
        currentCount,
        maxPagesPerSite: plan.limits.maxPagesPerSite,
        reason: canAdd ? undefined : `You have reached your limit of ${plan.limits.maxPagesPerSite} pages per site. Upgrade to a higher plan for more pages.`
      })
    }

    // For authenticated users, extract parameters and validate
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const planId = searchParams.get('planId')

    if (!siteId || !planId) {
      return NextResponse.json({ error: 'Site ID and Plan ID are required' }, { status: 400 })
    }

    const plan = getPlanById(planId)
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    const pageLimitCheck = await SiteLimitService.canUserAddPage(user.id, siteId, plan)

    return NextResponse.json({
      canAdd: pageLimitCheck.canAdd,
      currentCount: pageLimitCheck.currentCount,
      maxPagesPerSite: pageLimitCheck.maxPagesPerSite,
      reason: pageLimitCheck.reason
    })

  } catch (error) {
    console.error('Error checking page limits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
