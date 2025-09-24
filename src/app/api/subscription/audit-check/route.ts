import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { SubscriptionService } from '@/lib/subscriptionService'
import { SubscriptionServiceFallback } from '@/lib/subscriptionServiceFallback'

// Helper function to get user from request
async function getUserFromRequest() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return { user: null, error }
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Audit check API: Starting request')
    
    // Get user from request
    const { user, error: userError } = await getUserFromRequest()
    
    if (userError) {
      console.error('Error getting user:', userError)
      // If there's an auth error, use fallback service
      console.log('Audit check API: Auth error, using fallback service')
      const auditCheck = await SubscriptionServiceFallback.canUserPerformAudit('anonymous-user')
      console.log('Audit check API: Result from fallback service:', auditCheck)
      return NextResponse.json(auditCheck)
    }
    
    if (!user) {
      console.log('Audit check API: No user found, using fallback service')
      const auditCheck = await SubscriptionServiceFallback.canUserPerformAudit('anonymous-user')
      console.log('Audit check API: Result from fallback service:', auditCheck)
      return NextResponse.json(auditCheck)
    }

    console.log('Audit check API: User found:', user.id)
    
    // Try the main service first, fallback if it fails
    let auditCheck
    try {
      auditCheck = await SubscriptionService.canUserPerformAudit(user.id)
      console.log('Audit check API: Result from main service:', auditCheck)
    } catch (error) {
      console.log('Audit check API: Main service failed, using fallback:', error)
      auditCheck = await SubscriptionServiceFallback.canUserPerformAudit(user.id)
      console.log('Audit check API: Result from fallback service:', auditCheck)
    }
    
    return NextResponse.json(auditCheck)

  } catch (error) {
    console.error('Error checking audit limits:', error)
    // Use fallback service as last resort
    try {
      const auditCheck = await SubscriptionServiceFallback.canUserPerformAudit('anonymous-user')
      console.log('Audit check API: Result from fallback service (catch block):', auditCheck)
      return NextResponse.json(auditCheck)
    } catch (fallbackError) {
      console.error('Fallback service also failed:', fallbackError)
      return NextResponse.json(
        { 
          canPerform: true, // Default to allowing audits
          reason: undefined,
          remainingAudits: 1
        },
        { status: 200 }
      )
    }
  }
}
