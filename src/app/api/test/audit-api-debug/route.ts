import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/subscriptionService'

export async function POST(request: NextRequest) {
  try {
    const { userId, url } = await request.json()
    
    console.log('=== AUDIT API DEBUG ===')
    console.log('User ID:', userId)
    console.log('URL:', url)
    
    // Simulate the same logic as the audit API
    const effectiveUserId = userId
    const isAuthenticated = !!userId
    
    console.log('Effective user ID:', effectiveUserId)
    console.log('Is authenticated:', isAuthenticated)
    
    // Check plan restrictions
    let auditCheck
    if (isAuthenticated && effectiveUserId) {
      console.log('Checking limits for authenticated user:', effectiveUserId)
      auditCheck = await SubscriptionService.canUserPerformAudit(effectiveUserId, url)
      console.log('Authenticated user audit check:', auditCheck)
    } else {
      console.log('Using fallback service for anonymous user')
      // This shouldn't happen in our test
    }
    
    if (!auditCheck.canPerform) {
      console.log('User audit limit reached:', auditCheck.reason)
      return NextResponse.json({ 
        error: 'Audit limit reached',
        message: auditCheck.reason,
        remainingAudits: auditCheck.remainingAudits
      }, { status: 403 })
    }
    
    console.log('User can perform audit, remaining audits:', auditCheck.remainingAudits)
    
    return NextResponse.json({
      success: true,
      auditCheck,
      message: 'Audit would be allowed'
    })
  } catch (error) {
    console.error('Audit API debug error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


