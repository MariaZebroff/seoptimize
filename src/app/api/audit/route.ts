import { NextRequest, NextResponse } from 'next/server'
import { PuppeteerAuditService } from '@/lib/puppeteerAuditService'
import { HttpAuditService } from '@/lib/httpAuditService'
import { createSupabaseServerClient, saveAuditResultServer } from '@/lib/supabaseServer'
import { createServerClient } from '@supabase/ssr'

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // No-op for API routes
        },
      },
    }
  )
  
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Audit API called')
    
    // Parse request body with error handling
    let url: string
    let siteId: string | undefined
    
    try {
      const body = await request.json()
      url = body.url
      siteId = body.siteId
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    console.log('URL received:', url)
    console.log('Site ID received:', siteId)
    
    // Get user from request
    const { user, error: userError } = await getUserFromRequest(request)
    
    if (!url) {
      console.log('No URL provided')
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
      console.log('URL validation passed')
    } catch {
      console.log('Invalid URL format')
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    console.log('Starting audit service with enhanced error handling')
    
    // Try Puppeteer audit first with better error handling
    let auditResult
    try {
      console.log('Attempting Puppeteer audit...')
      const puppeteerService = PuppeteerAuditService.getInstance()
      auditResult = await puppeteerService.auditWebsite(url)
      
      if (auditResult.status === 'success') {
        console.log('Puppeteer audit successful')
        
        // Save audit result to database with error handling
        try {
          const { data: savedAudit, error: saveError } = await saveAuditResultServer(auditResult, siteId, user?.id)
          if (saveError) {
            console.error('Failed to save audit result:', saveError)
          } else {
            console.log('Audit result saved to database:', savedAudit?.id)
          }
        } catch (saveError) {
          console.error('Error saving audit result:', saveError)
        }
        
        return NextResponse.json(auditResult)
      } else {
        console.log('Puppeteer audit returned error status:', auditResult.error)
      }
    } catch (puppeteerError) {
      console.log('Puppeteer audit failed with exception:', puppeteerError instanceof Error ? puppeteerError.message : 'Unknown error')
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
          const { data: savedAudit, error: saveError } = await saveAuditResultServer(auditResult, siteId, user?.id)
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
            details: 'Both Puppeteer and HTTP audit methods failed. The website may be blocking automated requests or experiencing issues.'
          },
          { status: 500 }
        )
      }

      // Save successful HTTP audit result to database
      try {
        const { data: savedAudit, error: saveError } = await saveAuditResultServer(auditResult, siteId, user?.id)
        if (saveError) {
          console.error('Failed to save HTTP audit result:', saveError)
        } else {
          console.log('HTTP audit result saved to database:', savedAudit?.id)
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
        const { data: savedAudit, error: saveError } = await saveAuditResultServer(errorResult, siteId, user?.id)
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
          error: 'Failed to audit website. Both Puppeteer and HTTP methods failed.',
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
