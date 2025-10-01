import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/subscriptionService'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    console.log('=== AUDIT LIMIT DEBUG ===')
    console.log('Testing user ID:', userId)
    
    // Get user plan
    const userPlan = await SubscriptionService.getUserPlan(userId)
    console.log('User plan:', userPlan.id, userPlan.limits)
    
    // Get 3-day usage
    const threeDayUsage = await SubscriptionService.getUser3DayUsage(userId)
    console.log('3-day usage:', threeDayUsage)
    
    // Check if user can perform audit
    const auditCheck = await SubscriptionService.canUserPerformAudit(userId, 'https://test.com')
    console.log('Audit check result:', auditCheck)
    
    return NextResponse.json({
      userId,
      userPlan: {
        id: userPlan.id,
        limits: userPlan.limits
      },
      threeDayUsage,
      auditCheck
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



