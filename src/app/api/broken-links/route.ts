import { NextRequest, NextResponse } from 'next/server'
import { BrokenLinkCheckerService } from '@/lib/brokenLinkChecker'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Broken Link API called')
    
    const body = await request.json()
    const { url, type = 'page', options = {} } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    console.log(`🔍 Starting ${type} broken link check for:`, url)

    const brokenLinkChecker = BrokenLinkCheckerService.getInstance()
    let result

    switch (type) {
      case 'site':
        result = await brokenLinkChecker.checkSiteLinks(url, {
          maxPages: options.maxPages || 10,
          timeout: options.timeout || 30000,
          maxRetries: options.maxRetries || 2,
          userAgent: options.userAgent || 'SEO-Optimizer-Bot/1.0',
          excludePatterns: options.excludePatterns || []
        })
        break
      
      case 'single':
        const singleResult = await brokenLinkChecker.checkSingleUrl(url, {
          timeout: options.timeout || 10000,
          maxRetries: options.maxRetries || 2,
          userAgent: options.userAgent || 'SEO-Optimizer-Bot/1.0'
        })
        result = {
          totalLinks: 1,
          brokenLinks: singleResult ? [singleResult] : [],
          brokenLinkCount: singleResult ? 1 : 0,
          checkedPages: ['direct-check'],
          errors: [],
          status: 'success',
          duration: 0
        }
        break
      
      case 'page':
      default:
        result = await brokenLinkChecker.checkPageLinks(url, {
          timeout: options.timeout || 30000,
          maxRetries: options.maxRetries || 2,
          userAgent: options.userAgent || 'SEO-Optimizer-Bot/1.0'
        })
        break
    }

    // Categorize broken links for better analysis
    const categorized = brokenLinkChecker.categorizeBrokenLinks(result.brokenLinks)

    console.log(`✅ Broken link check completed:`, {
      type,
      url,
      totalLinks: result.totalLinks,
      brokenLinks: result.brokenLinkCount,
      duration: result.duration,
      status: result.status
    })

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        categorized,
        metadata: {
          checkType: type,
          timestamp: new Date().toISOString(),
          options: options
        }
      }
    })

  } catch (error) {
    console.error('❌ Broken Link API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to check broken links',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Quick single URL check for GET requests
    const brokenLinkChecker = BrokenLinkCheckerService.getInstance()
    const result = await brokenLinkChecker.checkSingleUrl(url, {
      timeout: 10000,
      maxRetries: 1
    })

    return NextResponse.json({
      success: true,
      data: {
        url,
        isBroken: !!result,
        result: result || null,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Quick broken link check error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to check URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
