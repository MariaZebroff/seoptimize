import { BrokenLinkCheckerService } from './brokenLinkChecker'

export interface HttpAuditResult {
  title: string
  metaDescription: string
  h1Tags: string[]
  h2Tags: string[]
  h3Tags: string[]
  h4Tags: string[]
  h5Tags: string[]
  h6Tags: string[]
  titleWordCount: number
  metaDescriptionWordCount: number
  h1WordCount: number
  h2WordCount: number
  h3WordCount: number
  h4WordCount: number
  h5WordCount: number
  h6WordCount: number
  imagesWithoutAlt: string[]
  imagesWithAlt: string[]
  internalLinks: Array<{url: string, text: string}>
  externalLinks: Array<{url: string, text: string}>
  totalLinks: number
  totalImages: number
  imagesMissingAlt: number
  internalLinkCount: number
  externalLinkCount: number
  headingStructure: any
  brokenLinks: Array<{url: string, text: string}>
  brokenLinkDetails?: any[]
  brokenLinkSummary?: {
    total: number
    broken: number
    status: string
    duration: number
  }
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
    const maxRetries = 3
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Starting HTTP audit attempt ${attempt}/${maxRetries} for URL:`, url)
        
        // Validate URL
        new URL(url)
        
        // Make HTTP request with enhanced timeout and retry logic
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 45000) // Increased timeout
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: controller.signal,
          redirect: 'follow',
          follow: 5 // Follow up to 5 redirects
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const html = await response.text()
        console.log(`HTML received on attempt ${attempt}, length:`, html.length)

        // Parse HTML for SEO data with error handling
        const basicSeoData = this.parseHTMLForSEO(html)
        console.log('Basic SEO data extracted successfully')

        // Perform comprehensive broken link checking with error handling
        console.log('🔍 Starting comprehensive broken link check...')
        let brokenLinkResult
        try {
          const brokenLinkChecker = BrokenLinkCheckerService.getInstance()
          brokenLinkResult = await brokenLinkChecker.checkPageLinks(url, {
            timeout: 20000, // Increased timeout
            maxRetries: 3, // Increased retries
            userAgent: 'SEO-Optimizer-Bot/1.0 (HTTP)'
          })
        } catch (brokenLinkError) {
          console.log('Broken link check failed, continuing without it:', brokenLinkError instanceof Error ? brokenLinkError.message : 'Unknown error')
          brokenLinkResult = {
            brokenLinks: [],
            totalLinks: 0,
            brokenLinkCount: 0,
            status: 'error',
            duration: 0
          }
        }

        // Combine basic SEO data with broken link results
        const seoData = {
          ...basicSeoData,
          brokenLinks: brokenLinkResult.brokenLinks.map(link => ({url: link.url, text: link.linkText})).slice(0, 10), // Limit to first 10 URLs
          brokenLinkDetails: brokenLinkResult.brokenLinks.slice(0, 20), // Keep detailed info for first 20
          brokenLinkSummary: {
            total: brokenLinkResult.totalLinks,
            broken: brokenLinkResult.brokenLinkCount,
            status: brokenLinkResult.status,
            duration: brokenLinkResult.duration
          }
        }

        // Calculate basic scores
        const scores = this.calculateBasicScores(seoData, html)

        const result: HttpAuditResult = {
          ...seoData,
          ...scores,
          url,
          timestamp: new Date().toISOString(),
          status: 'success'
        }

        console.log(`HTTP audit completed successfully on attempt ${attempt}`)
        return result

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        console.error(`HTTP audit attempt ${attempt} failed:`, lastError.message)
        
        // If this is the last attempt, return error result
        if (attempt === maxRetries) {
          console.error('All HTTP audit attempts failed')
          return {
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
            status: 'error',
            error: lastError.message
          }
        }
        
        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Exponential backoff, max 5s
        console.log(`Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    // This should never be reached, but just in case
    throw lastError || new Error('HTTP audit failed after all retries')
  }

  private parseHTMLForSEO(html: string) {
    // Helper function to count words
    const countWords = (text: string): number => {
      return text.trim().split(/\s+/).filter(word => word.length > 0).length
    }

    // Helper function to extract heading text
    const extractHeadingText = (headingMatches: RegExpMatchArray | null): string[] => {
      if (!headingMatches) return []
      return headingMatches.map(match => {
        const textContent = match.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
        return textContent
      }).filter(text => text.length > 0)
    }

    // Extract title and word count
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''
    const titleWordCount = countWords(title)

    // Extract meta description and word count
    const metaDescriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const metaDescription = metaDescriptionMatch ? metaDescriptionMatch[1].trim() : ''
    const metaDescriptionWordCount = countWords(metaDescription)

    // Extract all heading levels
    const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi)
    const h2Matches = html.match(/<h2[^>]*>(.*?)<\/h2>/gi)
    const h3Matches = html.match(/<h3[^>]*>(.*?)<\/h3>/gi)
    const h4Matches = html.match(/<h4[^>]*>(.*?)<\/h4>/gi)
    const h5Matches = html.match(/<h5[^>]*>(.*?)<\/h5>/gi)
    const h6Matches = html.match(/<h6[^>]*>(.*?)<\/h6>/gi)

    const h1Tags = extractHeadingText(h1Matches)
    const h2Tags = extractHeadingText(h2Matches)
    const h3Tags = extractHeadingText(h3Matches)
    const h4Tags = extractHeadingText(h4Matches)
    const h5Tags = extractHeadingText(h5Matches)
    const h6Tags = extractHeadingText(h6Matches)

    // Calculate word counts for each heading level
    const h1WordCount = h1Tags.reduce((total, text) => total + countWords(text), 0)
    const h2WordCount = h2Tags.reduce((total, text) => total + countWords(text), 0)
    const h3WordCount = h3Tags.reduce((total, text) => total + countWords(text), 0)
    const h4WordCount = h4Tags.reduce((total, text) => total + countWords(text), 0)
    const h5WordCount = h5Tags.reduce((total, text) => total + countWords(text), 0)
    const h6WordCount = h6Tags.reduce((total, text) => total + countWords(text), 0)

    // Extract images and alt text analysis
    const imageMatches = html.match(/<img[^>]*>/gi) || []
    const imagesWithoutAlt: string[] = []
    const imagesWithAlt: string[] = []
    
    imageMatches.forEach(imgTag => {
      const srcMatch = imgTag.match(/src=["']([^"']*)["']/i) || imgTag.match(/data-src=["']([^"']*)["']/i)
      const src = srcMatch ? srcMatch[1] : 'unknown'
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/i)
      const alt = altMatch ? altMatch[1] : ''
      
      if (!alt || alt.trim() === '') {
        imagesWithoutAlt.push(src)
      } else {
        imagesWithAlt.push(src)
      }
    })

    const totalImages = imageMatches.length
    const imagesMissingAlt = imagesWithoutAlt.length

    // Extract and analyze links
    // Extract links with text content using improved regex
    const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi
    const internalLinks: Array<{url: string, text: string}> = []
    const externalLinks: Array<{url: string, text: string}> = []
    
    let match
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1]
      const innerHTML = match[2] || ''
      
      // Extract text content from inner HTML (remove HTML tags)
      const linkText = innerHTML.replace(/<[^>]*>/g, '').trim()

      // Skip obvious non-links for classification
      if (href.includes('javascript:') || href.includes('void(0)') || href === '#') {
        continue
      }

      // Classify as internal or external
      if (href.startsWith('http://') || href.startsWith('https://')) {
        externalLinks.push({url: href, text: linkText})
      } else if (href.startsWith('mailto:') || href.startsWith('tel:')) {
        // Skip email and phone links
      } else {
        internalLinks.push({url: href, text: linkText})
      }
    }

    const totalLinks = internalLinks.length + externalLinks.length
    const internalLinkCount = internalLinks.length
    const externalLinkCount = externalLinks.length

    // Create heading structure analysis
    const headingStructure = {
      h1: h1Tags.length,
      h2: h2Tags.length,
      h3: h3Tags.length,
      h4: h4Tags.length,
      h5: h5Tags.length,
      h6: h6Tags.length,
      total: h1Tags.length + h2Tags.length + h3Tags.length + h4Tags.length + h5Tags.length + h6Tags.length,
      hierarchy: {
        hasH1: h1Tags.length > 0,
        hasMultipleH1: h1Tags.length > 1,
        hasProperHierarchy: h1Tags.length > 0 && (h2Tags.length > 0 || h3Tags.length > 0)
      }
    }

    return {
      title,
      metaDescription,
      h1Tags,
      h2Tags,
      h3Tags,
      h4Tags,
      h5Tags,
      h6Tags,
      titleWordCount,
      metaDescriptionWordCount,
      h1WordCount,
      h2WordCount,
      h3WordCount,
      h4WordCount,
      h5WordCount,
      h6WordCount,
      imagesWithoutAlt: imagesWithoutAlt.slice(0, 20), // Limit to first 20
      imagesWithAlt: imagesWithAlt.slice(0, 20), // Limit to first 20
      internalLinks: internalLinks.slice(0, 50), // Limit to first 50
      externalLinks: externalLinks.slice(0, 50), // Limit to first 50
      totalLinks,
      totalImages,
      imagesMissingAlt,
      internalLinkCount,
      externalLinkCount,
      headingStructure,
      // brokenLinks will be added by comprehensive checker
    }
  }

  private calculateBasicScores(seoData: any, html: string) {
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
