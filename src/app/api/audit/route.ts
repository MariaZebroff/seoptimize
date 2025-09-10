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
    
    const { url, siteId } = await request.json()
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

    console.log('Starting audit service')
    
    // Try Puppeteer audit first
    let auditResult
    try {
      console.log('Attempting Puppeteer audit...')
      const puppeteerService = PuppeteerAuditService.getInstance()
      auditResult = await puppeteerService.auditWebsite(url)
      
      if (auditResult.status === 'success') {
        console.log('Puppeteer audit successful:', auditResult)
        
        // Save audit result to database
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
      }
    } catch (puppeteerError) {
      console.log('Puppeteer audit failed, trying HTTP fallback:', puppeteerError instanceof Error ? puppeteerError.message : 'Unknown error')
    }

    // Fallback to HTTP audit
    try {
      console.log('Attempting HTTP audit fallback...')
      const httpService = HttpAuditService.getInstance()
      auditResult = await httpService.auditWebsite(url)
      console.log('HTTP audit result:', auditResult)
      
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
          { error: auditResult.error || 'Failed to audit website with both methods' },
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
      console.error('Both audit methods failed:', httpError)
      return NextResponse.json(
        { error: 'Failed to audit website. The site may be blocking automated requests.' },
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
