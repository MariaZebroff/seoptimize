import { NextRequest, NextResponse } from 'next/server'
import { PuppeteerAuditService } from '@/lib/puppeteerAuditService'
import { HttpAuditService } from '@/lib/httpAuditService'

export async function POST(request: NextRequest) {
  try {
    console.log('Audit API called')
    const { url } = await request.json()
    console.log('URL received:', url)
    
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
        return NextResponse.json(
          { error: auditResult.error || 'Failed to audit website with both methods' },
          { status: 500 }
        )
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
