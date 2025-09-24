import { NextRequest, NextResponse } from 'next/server'
import { PSIAuditService } from '@/lib/psiAuditService'
import { HttpAuditService } from '@/lib/httpAuditService'
import { createSupabaseServerClient, saveAuditResultServer } from '@/lib/supabaseServer'
import { SubscriptionService } from '@/lib/subscriptionService'
import { SubscriptionServiceFallback } from '@/lib/subscriptionServiceFallback'

// Helper function to get user from request
async function getUserFromRequest() {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Debug: Check what cookies are available
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log('Audit API: Available cookies:', allCookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`))
    
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('Audit API: Supabase auth result:', { user: user?.id, error: error?.message })
    
    // Debug: Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Audit API: Session check:', { session: session?.user?.id, error: sessionError?.message })
    
    return { user, error }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return { user: null, error }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Audit API called')
    
    // Parse request body with error handling
    let url: string
    let siteId: string | undefined
    let clientUserId: string | undefined
    
    try {
      const body = await request.json()
      url = body.url
      siteId = body.siteId
      clientUserId = body.userId // Get user ID from client
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    console.log('URL received:', url)
    console.log('Site ID received:', siteId)
    
    // Get user from request
    const { user, error: userError } = await getUserFromRequest()
    
    if (!url) {
      console.log('No URL provided')
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Use client user ID if available, otherwise fall back to server-side auth
    const effectiveUserId = clientUserId || user?.id
    const isAuthenticated = !!(clientUserId || user)
    
    console.log('Audit API: Client user ID:', clientUserId)
    console.log('Audit API: Server user ID:', user?.id)
    console.log('Audit API: Effective user ID:', effectiveUserId)
    console.log('Audit API: Is authenticated:', isAuthenticated)

    // Check plan restrictions for all users (authenticated and anonymous)
    try {
      let auditCheck
      if (isAuthenticated && effectiveUserId) {
        // For authenticated users, be more lenient - allow audits and let client-side handle limits
        console.log('Audit API: Authenticated user detected, allowing audit (limits handled client-side)')
        auditCheck = { canPerform: true, remainingAudits: -1 }
        console.log('Authenticated user audit check:', auditCheck)
      } else {
        // For unauthenticated users, use the fallback service
        console.log('Audit API: Using fallback SubscriptionServiceFallback for anonymous user')
        auditCheck = await SubscriptionServiceFallback.canUserPerformAudit('anonymous-user')
        console.log('Anonymous user audit check:', auditCheck)
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
    } catch (error) {
      console.error('Error checking audit limits:', error)
      // Only continue with audit if it's a database access error, not a limit enforcement error
      if (error instanceof Error && error.message.includes('table') || error instanceof Error && error.message.includes('database')) {
        console.log('Database error detected, continuing with audit')
      } else {
        console.log('Subscription service error, blocking audit for safety')
        return NextResponse.json({ 
          error: 'Unable to verify audit limits',
          message: 'Please try again later or contact support if the issue persists.'
        }, { status: 500 })
      }
    }

    // Validate URL format
    try {
      new URL(url)
      console.log('URL validation passed')
    } catch {
      console.log('Invalid URL format')
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    console.log('Starting PSI audit service with enhanced error handling')
    
    // Try PSI audit first with better error handling
    let auditResult
    try {
      console.log('Attempting PSI audit...')
      const psiService = PSIAuditService.getInstance()
      auditResult = await psiService.auditWebsite(url)
      
      if (auditResult.status === 'success') {
        console.log('PSI audit successful')
        
        // Save audit result to database with error handling
        try {
          const { data: savedAudit, error: saveError } = await saveAuditResultServer(auditResult, siteId, user?.id)
          if (saveError) {
            console.error('Failed to save audit result:', saveError)
          } else {
            console.log('Audit result saved to database:', savedAudit?.id)
            
            // Record audit usage for all users
            try {
              if (isAuthenticated && effectiveUserId) {
                await SubscriptionService.recordAuditUsage(effectiveUserId, url)
                console.log('Audit usage recorded for authenticated user:', effectiveUserId, 'for URL:', url)
              } else {
                // For unauthenticated users, use a shared identifier
                const fallbackUserId = 'anonymous-user'
                await SubscriptionServiceFallback.recordAuditUsage(fallbackUserId)
                console.log('Audit usage recorded for unauthenticated user:', fallbackUserId)
              }
            } catch (usageError) {
              console.error('Failed to record audit usage:', usageError)
            }
          }
        } catch (saveError) {
          console.error('Error saving audit result:', saveError)
        }
        
        return NextResponse.json(auditResult)
      } else {
        console.log('PSI audit returned error status:', auditResult.error)
      }
    } catch (psiError) {
      console.log('PSI audit failed with exception:', psiError instanceof Error ? psiError.message : 'Unknown error')
    }

    // Fallback to HTTP audit with enhanced error handling
    try {
      console.log('Attempting HTTP audit fallback...')
      const httpService = HttpAuditService.getInstance()
      auditResult = await httpService.auditWebsite(url)
      console.log('HTTP audit completed with status:', auditResult.status)
      
      if (auditResult.status === 'error') {
        console.log('HTTP audit also failed:', auditResult.error)
        
        // Save failed audit result to database
        try {
          const userIdForSave = effectiveUserId || 'anonymous-user'
          const { data: savedAudit, error: saveError } = await saveAuditResultServer(auditResult, siteId, userIdForSave)
          if (saveError) {
            console.error('Failed to save failed audit result:', saveError)
          } else {
            console.log('Failed audit result saved to database:', savedAudit?.id)
          }
        } catch (saveError) {
          console.error('Error saving failed audit result:', saveError)
        }
        
        return NextResponse.json(
          { 
            error: auditResult.error || 'Failed to audit website with both methods',
            details: 'Both PSI and HTTP audit methods failed. The website may be blocking automated requests or experiencing issues.'
          },
          { status: 500 }
        )
      }

      // Save successful HTTP audit result to database
      try {
        // Use consistent user ID for anonymous users
        const userIdForSave = effectiveUserId || 'anonymous-user'
        const { data: savedAudit, error: saveError } = await saveAuditResultServer(auditResult, siteId, userIdForSave)
        if (saveError) {
          console.error('Failed to save HTTP audit result:', saveError)
        } else {
          console.log('HTTP audit result saved to database:', savedAudit?.id)
          
          // Record audit usage for all users
          try {
            if (isAuthenticated && effectiveUserId) {
              await SubscriptionService.recordAuditUsage(effectiveUserId, url)
              console.log('Audit usage recorded for authenticated user:', effectiveUserId, 'for URL:', url)
            } else {
              // For unauthenticated users, use a shared identifier
              const fallbackUserId = 'anonymous-user'
              await SubscriptionServiceFallback.recordAuditUsage(fallbackUserId)
              console.log('Audit usage recorded for unauthenticated user:', fallbackUserId)
            }
          } catch (usageError) {
            console.error('Failed to record audit usage:', usageError)
          }
        }
      } catch (saveError) {
        console.error('Error saving HTTP audit result:', saveError)
      }

      return NextResponse.json(auditResult)
    } catch (httpError) {
      console.error('HTTP audit failed with exception:', httpError)
      
      // Create a comprehensive error response
      const errorResult = {
        title: '',
        metaDescription: '',
        h1Tags: [],
        h2Tags: [],
        h3Tags: [],
        h4Tags: [],
        h5Tags: [],
        h6Tags: [],
        titleWordCount: 0,
        metaDescriptionWordCount: 0,
        h1WordCount: 0,
        h2WordCount: 0,
        h3WordCount: 0,
        h4WordCount: 0,
        h5WordCount: 0,
        h6WordCount: 0,
        imagesWithoutAlt: [],
        imagesWithAlt: [],
        internalLinks: [],
        externalLinks: [],
        totalLinks: 0,
        totalImages: 0,
        imagesMissingAlt: 0,
        internalLinkCount: 0,
        externalLinkCount: 0,
        headingStructure: {},
        brokenLinks: [],
        mobileScore: 0,
        performanceScore: 0,
        accessibilityScore: 0,
        seoScore: 0,
        bestPracticesScore: 0,
        url,
        timestamp: new Date().toISOString(),
        status: 'error' as const,
        error: httpError instanceof Error ? httpError.message : 'Unknown error occurred'
      }
      
      // Save error result to database
      try {
        const userIdForSave = effectiveUserId || 'anonymous-user'
        const { data: savedAudit, error: saveError } = await saveAuditResultServer(errorResult, siteId, userIdForSave)
        if (saveError) {
          console.error('Failed to save error audit result:', saveError)
        } else {
          console.log('Error audit result saved to database:', savedAudit?.id)
        }
      } catch (saveError) {
        console.error('Error saving error audit result:', saveError)
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to audit website. Both PSI and HTTP methods failed.',
          details: 'The website may be blocking automated requests, experiencing server issues, or the URL may be invalid.',
          suggestion: 'Please verify the URL is correct and accessible, then try again.'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Audit API error:', error)
    return NextResponse.json(
      { error: 'Failed to audit website. Please check the URL and try again.' },
      { status: 500 }
    )
  }
}
