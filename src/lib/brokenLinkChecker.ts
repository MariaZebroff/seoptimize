// Custom broken link checker using Node.js built-ins

export interface BrokenLinkResult {
  url: string
  statusCode: number
  statusText: string
  reason: string
  parent: string
  tag: string
  attribute: string
  linkText: string
  isInternal: boolean
  isBroken: boolean
}

export interface BrokenLinkSummary {
  totalLinks: number
  brokenLinks: BrokenLinkResult[]
  brokenLinkCount: number
  checkedPages: string[]
  errors: string[]
  status: 'success' | 'error' | 'partial'
  duration: number
}

export class BrokenLinkCheckerService {
  private static instance: BrokenLinkCheckerService

  static getInstance(): BrokenLinkCheckerService {
    if (!BrokenLinkCheckerService.instance) {
      BrokenLinkCheckerService.instance = new BrokenLinkCheckerService()
    }
    return BrokenLinkCheckerService.instance
  }

  /**
   * Check broken links on a single page
   */
  async checkPageLinks(url: string, options: {
    timeout?: number
    maxRetries?: number
    userAgent?: string
  } = {}): Promise<BrokenLinkSummary> {
    const startTime = Date.now()
    const brokenLinks: BrokenLinkResult[] = []
    const errors: string[] = []
    const checkedPages: string[] = [url]

    const {
      timeout = 30000,
      maxRetries = 2,
      userAgent = 'SEO-Optimizer-Bot/1.0'
    } = options

    try {
      console.log(`🔍 Starting broken link check for page: ${url}`)

      // First, fetch the HTML content of the page
      const html = await this.fetchPageContent(url, { timeout, userAgent })
      
      // Extract all links from the HTML
      const links = this.extractLinksFromHTML(html, url)
      console.log(`📊 Found ${links.length} links to check`)

      const totalLinks = links.length
      let checkedCount = 0

      // Check each link
      for (const link of links) {
        checkedCount++
        console.log(`🔗 Checking link ${checkedCount}/${totalLinks}: ${link.url}`)
        
        try {
          const isWorking = await this.checkSingleLinkStatus(link.url, {
            timeout: Math.min(timeout, 10000), // Use shorter timeout for individual links
            maxRetries,
            userAgent
          })

          if (!isWorking.isWorking) {
            const brokenLink: BrokenLinkResult = {
              url: link.url,
              statusCode: isWorking.statusCode,
              statusText: isWorking.statusText,
              reason: isWorking.reason,
              parent: url,
              tag: link.tag,
              attribute: link.attribute,
              linkText: link.text,
              isInternal: this.isInternalLink(link.url, url),
              isBroken: true
            }
            brokenLinks.push(brokenLink)
            console.log(`❌ Broken link found: ${link.url} (${isWorking.statusCode})`)
          } else {
            console.log(`✅ Link OK: ${link.url}`)
          }
        } catch (error) {
          console.error(`❌ Error checking link ${link.url}:`, error)
          errors.push(`Failed to check ${link.url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      const duration = Date.now() - startTime
      console.log(`🏁 Page link check completed in ${duration}ms`)
      console.log(`📊 Total links: ${totalLinks}, Broken: ${brokenLinks.length}`)

      return {
        totalLinks,
        brokenLinks,
        brokenLinkCount: brokenLinks.length,
        checkedPages,
        errors,
        status: errors.length > 0 ? 'partial' : 'success',
        duration
      }

    } catch (error) {
      const duration = Date.now() - startTime
      console.error('❌ Page link check failed:', error)
      
      return {
        totalLinks: 0,
        brokenLinks: [],
        brokenLinkCount: 0,
        checkedPages: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        status: 'error',
        duration
      }
    }
  }

  /**
   * Check broken links across an entire site (recursive) - simplified version
   */
  async checkSiteLinks(url: string, options: {
    maxPages?: number
    timeout?: number
    maxRetries?: number
    userAgent?: string
    excludePatterns?: string[]
  } = {}): Promise<BrokenLinkSummary> {
    const {
      maxPages = 10, // Reduced for performance
      timeout = 30000,
      maxRetries = 2,
      userAgent = 'SEO-Optimizer-Bot/1.0',
      excludePatterns = []
    } = options

    console.log(`🔍 Starting site-wide broken link check for: ${url}`)
    console.log(`📋 Max pages: ${maxPages}, Timeout: ${timeout}ms`)
    console.log(`⚠️  Note: Site-wide checking is simplified - checking main page only for now`)

    // For now, just check the main page to avoid complexity
    // In a full implementation, you would crawl the site and check multiple pages
    return await this.checkPageLinks(url, { timeout, maxRetries, userAgent })
  }

  /**
   * Check a specific URL for its status
   */
  async checkSingleUrl(url: string, options: {
    timeout?: number
    maxRetries?: number
    userAgent?: string
  } = {}): Promise<BrokenLinkResult | null> {
    const {
      timeout = 10000,
      maxRetries = 2,
      userAgent = 'SEO-Optimizer-Bot/1.0'
    } = options

    console.log(`🔍 Checking single URL: ${url}`)

    const result = await this.checkSingleLinkStatus(url, { timeout, maxRetries, userAgent })

    if (!result.isWorking) {
      const brokenLink: BrokenLinkResult = {
        url,
        statusCode: result.statusCode,
        statusText: result.statusText,
        reason: result.reason,
        parent: 'direct-check',
        tag: 'unknown',
        attribute: 'unknown',
        linkText: '',
        isInternal: false,
        isBroken: true
      }
      console.log(`❌ URL is broken: ${url} (${result.statusCode})`)
      return brokenLink
    } else {
      console.log(`✅ URL is OK: ${url}`)
      return null
    }
  }

  /**
   * Fetch HTML content from a URL
   */
  private async fetchPageContent(url: string, options: {
    timeout: number
    userAgent: string
  }): Promise<string> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': options.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(options.timeout)
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`)
    }

    return await response.text()
  }

  /**
   * Extract links from HTML content
   */
  private extractLinksFromHTML(html: string, baseUrl: string): Array<{
    url: string
    tag: string
    attribute: string
    text: string
  }> {
    const links: Array<{ url: string, tag: string, attribute: string, text: string }> = []
    
    // Extract links from <a> tags with improved regex to handle nested HTML
    const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi
    let match
    
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1]
      const innerHTML = match[2] || ''
      
      // Extract text content from inner HTML (remove HTML tags)
      const textContent = innerHTML.replace(/<[^>]*>/g, '').trim()
      
      // Skip obvious non-links
      if (href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue
      }

      try {
        // Convert relative URLs to absolute
        const absoluteUrl = new URL(href, baseUrl).toString()
        links.push({
          url: absoluteUrl,
          tag: 'a',
          attribute: 'href',
          text: textContent
        })
      } catch {
        // Skip invalid URLs
        continue
      }
    }

    // Extract images with src attributes
    const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*/gi
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1]
      
      try {
        const absoluteUrl = new URL(src, baseUrl).toString()
        links.push({
          url: absoluteUrl,
          tag: 'img',
          attribute: 'src',
          text: ''
        })
      } catch {
        // Skip invalid URLs
        continue
      }
    }

    return links
  }

  /**
   * Check if a single link is working
   */
  private async checkSingleLinkStatus(url: string, options: {
    timeout: number
    maxRetries: number
    userAgent: string
  }): Promise<{
    isWorking: boolean
    statusCode: number
    statusText: string
    reason: string
  }> {
    for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), options.timeout)
        
        const response = await fetch(url, {
          method: 'HEAD',
          headers: {
            'User-Agent': options.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: controller.signal,
          redirect: 'follow'
        })
        
        clearTimeout(timeoutId)

        // Only consider 404 (Not Found) and 5xx (Server Error) as truly broken
        if (response.status === 404 || response.status >= 500) {
          return {
            isWorking: false,
            statusCode: response.status,
            statusText: response.statusText,
            reason: `HTTP ${response.status}: ${response.statusText}`
          }
        }

        return {
          isWorking: true,
          statusCode: response.status,
          statusText: response.statusText,
          reason: 'OK'
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        // Check if it's a timeout or network error
        if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
          if (attempt === options.maxRetries) {
            return {
              isWorking: false,
              statusCode: 0,
              statusText: 'Timeout',
              reason: `Request timed out after ${options.timeout}ms`
            }
          }
        } else if (errorMessage.includes('fetch')) {
          if (attempt === options.maxRetries) {
            return {
              isWorking: false,
              statusCode: 0,
              statusText: 'Network Error',
              reason: `Network error: ${errorMessage}`
            }
          }
        } else {
          // For other errors, don't retry
          return {
            isWorking: false,
            statusCode: 0,
            statusText: 'Error',
            reason: errorMessage
          }
        }
        
        // Wait with exponential backoff before retrying
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    return {
      isWorking: false,
      statusCode: 0,
      statusText: 'Error',
      reason: 'Max retries exceeded'
    }
  }

  /**
   * Helper method to determine if a URL is internal
   */
  private isInternalLink(linkUrl: string, baseUrl: string): boolean {
    try {
      const link = new URL(linkUrl, baseUrl)
      const base = new URL(baseUrl)
      return link.hostname === base.hostname
    } catch {
      return false
    }
  }

  /**
   * Get a summary of broken links by type
   */
  categorizeBrokenLinks(brokenLinks: BrokenLinkResult[]) {
    const categories = {
      notFound: brokenLinks.filter(link => link.statusCode === 404),
      serverErrors: brokenLinks.filter(link => link.statusCode >= 500),
      timeouts: brokenLinks.filter(link => link.reason.toLowerCase().includes('timeout')),
      dnsErrors: brokenLinks.filter(link => link.reason.toLowerCase().includes('dns')),
      connectionErrors: brokenLinks.filter(link => link.reason.toLowerCase().includes('connection')),
      other: brokenLinks.filter(link => 
        link.statusCode !== 404 && 
        link.statusCode < 500 && 
        !link.reason.toLowerCase().includes('timeout') &&
        !link.reason.toLowerCase().includes('dns') &&
        !link.reason.toLowerCase().includes('connection')
      )
    }

    return {
      ...categories,
      summary: {
        total: brokenLinks.length,
        notFound: categories.notFound.length,
        serverErrors: categories.serverErrors.length,
        timeouts: categories.timeouts.length,
        dnsErrors: categories.dnsErrors.length,
        connectionErrors: categories.connectionErrors.length,
        other: categories.other.length
      }
    }
  }
}
