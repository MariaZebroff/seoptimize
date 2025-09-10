export interface HttpAuditResult {
  title: string
  metaDescription: string
  h1Tags: string[]
  brokenLinks: string[]
  mobileScore: number
  performanceScore: number
  accessibilityScore: number
  seoScore: number
  bestPracticesScore: number
  url: string
  timestamp: string
  status: 'success' | 'error'
  error?: string
}

export class HttpAuditService {
  static getInstance(): HttpAuditService {
    return new HttpAuditService()
  }

  async auditWebsite(url: string): Promise<HttpAuditResult> {
    try {
      console.log('Starting HTTP audit for URL:', url)
      
      // Validate URL
      new URL(url)
      
      // Make HTTP request with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      console.log('HTML received, length:', html.length)

      // Parse HTML for SEO data
      const seoData = this.parseHTMLForSEO(html)
      console.log('SEO data extracted:', seoData)

      // Calculate basic scores
      const scores = this.calculateBasicScores(seoData, html)

      const result: HttpAuditResult = {
        ...seoData,
        ...scores,
        url,
        timestamp: new Date().toISOString(),
        status: 'success'
      }

      console.log('HTTP audit completed successfully:', result)
      return result

    } catch (error) {
      console.error('HTTP audit error:', error)
      return {
        title: '',
        metaDescription: '',
        h1Tags: [],
        brokenLinks: [],
        mobileScore: 0,
        performanceScore: 0,
        accessibilityScore: 0,
        seoScore: 0,
        bestPracticesScore: 0,
        url,
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private parseHTMLForSEO(html: string) {
    // Simple regex-based HTML parsing
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

    const metaDescriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const metaDescription = metaDescriptionMatch ? metaDescriptionMatch[1].trim() : ''

    // Extract H1 tags
    const h1Matches = html.match(/<h1[^>]*>([^<]*)<\/h1>/gi) || []
    const h1Tags = h1Matches.map(match => {
      const contentMatch = match.match(/<h1[^>]*>([^<]*)<\/h1>/i)
      return contentMatch ? contentMatch[1].trim() : ''
    }).filter(text => text.length > 0)

    // Simple broken link detection (look for common patterns)
    const brokenLinkPatterns = [
      /href=["']#["']/gi,
      /href=["']javascript:void\(0\)["']/gi,
      /href=["']javascript:["']/gi
    ]
    
    const brokenLinks: string[] = []
    brokenLinkPatterns.forEach(pattern => {
      const matches = html.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const hrefMatch = match.match(/href=["']([^"']*)["']/i)
          if (hrefMatch) {
            brokenLinks.push(hrefMatch[1])
          }
        })
      }
    })

    return {
      title,
      metaDescription,
      h1Tags,
      brokenLinks: brokenLinks.slice(0, 10)
    }
  }

  private calculateBasicScores(seoData: { title: string; metaDescription: string; h1Tags: string[]; brokenLinks: string[] }, html: string) {
    let seoScore = 0
    let accessibilityScore = 0
    let bestPracticesScore = 0

    // SEO scoring
    if (seoData.title && seoData.title.length > 0) {
      seoScore += 30
      if (seoData.title.length >= 30 && seoData.title.length <= 60) {
        seoScore += 20
      }
    }

    if (seoData.metaDescription && seoData.metaDescription.length > 0) {
      seoScore += 30
      if (seoData.metaDescription.length >= 120 && seoData.metaDescription.length <= 160) {
        seoScore += 20
      }
    }

    if (seoData.h1Tags.length > 0) {
      seoScore += 20
      if (seoData.h1Tags.length === 1) {
        seoScore += 10
      }
    }

    // Accessibility scoring (basic checks)
    const imageMatches = html.match(/<img[^>]*>/gi) || []
    const imagesWithAlt = imageMatches.filter(img => /alt=["'][^"']*["']/i.test(img)).length
    if (imageMatches.length > 0) {
      const altRatio = imagesWithAlt / imageMatches.length
      accessibilityScore += Math.round(altRatio * 50)
    }

    const linkMatches = html.match(/<a[^>]*>/gi) || []
    const linksWithText = linkMatches.filter(link => {
      const linkContent = link.replace(/<[^>]*>/g, '').trim()
      return linkContent.length > 0
    }).length
    if (linkMatches.length > 0) {
      const textRatio = linksWithText / linkMatches.length
      accessibilityScore += Math.round(textRatio * 50)
    }

    // Best practices scoring
    const httpsLinks = (html.match(/https:/gi) || []).length
    const httpLinks = (html.match(/http:/gi) || []).length
    const totalLinks = httpsLinks + httpLinks
    if (totalLinks > 0) {
      const httpsRatio = httpsLinks / totalLinks
      bestPracticesScore += Math.round(httpsRatio * 50)
    }

    // Check for viewport meta tag
    if (/<meta[^>]*name=["']viewport["'][^>]*>/i.test(html)) {
      bestPracticesScore += 25
    }

    // Check for charset declaration
    if (/<meta[^>]*charset/i.test(html)) {
      bestPracticesScore += 25
    }

    // Performance score (basic estimation based on HTML size)
    const htmlSize = html.length
    let performanceScore = 100
    if (htmlSize > 1000000) performanceScore -= 30 // 1MB+
    else if (htmlSize > 500000) performanceScore -= 20 // 500KB+
    else if (htmlSize > 100000) performanceScore -= 10 // 100KB+

    return {
      mobileScore: performanceScore,
      performanceScore,
      accessibilityScore: Math.min(100, accessibilityScore),
      seoScore: Math.min(100, seoScore),
      bestPracticesScore: Math.min(100, bestPracticesScore)
    }
  }
}
