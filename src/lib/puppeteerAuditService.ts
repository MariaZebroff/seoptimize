import puppeteer, { Browser, Page } from 'puppeteer'

export interface PuppeteerAuditResult {
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

export class PuppeteerAuditService {
  static getInstance(): PuppeteerAuditService {
    return new PuppeteerAuditService()
  }

  async auditWebsite(url: string): Promise<PuppeteerAuditResult> {
    let browser: Browser | null = null
    
    try {
      console.log('Starting Puppeteer audit for URL:', url)
      
      // Validate URL
      new URL(url)
      
      // Launch browser with stealth settings
      console.log('Launching browser...')
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-blink-features=AutomationControlled',
          '--disable-extensions',
          '--disable-plugins',
          '--no-default-browser-check',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-first-run',
          '--safebrowsing-disable-auto-update',
          '--disable-ipc-flooding-protection'
        ],
        timeout: 60000
      })

      console.log('Browser launched, creating new page...')
      const page = await browser.newPage()
      
      // Set realistic viewport and user agent
      await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 })
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
      
      // Set additional headers to appear more like a real browser
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      })
      
      // Remove webdriver property
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        })
      })
      
      // Navigate to page with retry logic
      console.log('Navigating to page...')
      let navigationSuccess = false
      let lastError = null
      
      // Try different navigation strategies
      const navigationStrategies = [
        { waitUntil: 'domcontentloaded' as const, timeout: 30000 },
        { waitUntil: 'networkidle0' as const, timeout: 30000 },
        { waitUntil: 'load' as const, timeout: 30000 }
      ]
      
      for (const strategy of navigationStrategies) {
        try {
          await page.goto(url, strategy)
          navigationSuccess = true
          console.log('Navigation successful with strategy:', strategy.waitUntil)
          break
        } catch (error) {
          console.log(`Navigation failed with strategy ${strategy.waitUntil}:`, error instanceof Error ? error.message : 'Unknown error')
          lastError = error
          continue
        }
      }
      
      if (!navigationSuccess) {
        throw new Error(`Failed to navigate to ${url}. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`)
      }

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 3000))

      console.log('Extracting SEO data...')
      // Extract SEO data
      const seoData = await this.extractSEOData(page)
      console.log('SEO data extracted:', seoData)
      
      console.log('Calculating performance metrics...')
      // Calculate basic performance metrics
      const performanceMetrics = await this.calculatePerformanceMetrics(page)
      console.log('Performance metrics calculated:', performanceMetrics)

      const result: PuppeteerAuditResult = {
        ...seoData,
        ...performanceMetrics,
        url,
        timestamp: new Date().toISOString(),
        status: 'success'
      }

      console.log('Puppeteer audit completed successfully:', result)
      return result

    } catch (error) {
      console.error('Puppeteer audit error:', error)
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
    } finally {
      if (browser) {
        try {
          await browser.close()
          console.log('Browser closed successfully')
        } catch (closeError) {
          console.error('Error closing browser:', closeError)
        }
      }
    }
  }

  private async extractSEOData(page: Page) {
    return await page.evaluate(() => {
      // Extract title
      const title = document.title || ''
      
      // Extract meta description
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
      
      // Extract all H1 tags (including nested text content)
      const h1Tags = Array.from(document.querySelectorAll('h1'))
        .map(h1 => {
          // Get all text content including nested elements, normalize whitespace
          const text = h1.innerText?.trim() || h1.textContent?.trim() || ''
          return text.replace(/\s+/g, ' ').trim()
        })
        .filter(text => text.length > 0)
      
      // Check for broken internal links
      const links = Array.from(document.querySelectorAll('a[href]'))
      const brokenLinks: string[] = []
      
      links.forEach(link => {
        const href = link.getAttribute('href')
        if (href) {
          // Check for obviously broken patterns
          if (href.includes('javascript:') || href.includes('void(0)') || href === '#') {
            brokenLinks.push(href)
          }
          // Check for relative links that might be broken
          else if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#')) {
            // Check if the link element has any obvious issues
            if (link.textContent?.trim() === '' || link.getAttribute('aria-hidden') === 'true') {
              brokenLinks.push(href)
            }
          }
        }
      })

      return {
        title,
        metaDescription,
        h1Tags,
        brokenLinks: brokenLinks.slice(0, 10) // Limit to first 10
      }
    })
  }

  private async calculatePerformanceMetrics(page: Page) {
    try {
      // Get basic performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')
        
        const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
        const lcp = paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        
        return {
          fcp,
          lcp,
          loadTime,
          domContentLoaded
        }
      })

      // Calculate scores based on metrics (simplified scoring)
      const performanceScore = this.calculatePerformanceScore(metrics)
      const seoScore = await this.calculateSEOScore(page)
      const accessibilityScore = await this.calculateAccessibilityScore(page)
      const bestPracticesScore = await this.calculateBestPracticesScore(page)

      return {
        mobileScore: performanceScore,
        performanceScore,
        accessibilityScore,
        seoScore,
        bestPracticesScore
      }
    } catch (error) {
      console.error('Error calculating performance metrics:', error)
      return {
        mobileScore: 0,
        performanceScore: 0,
        accessibilityScore: 0,
        seoScore: 0,
        bestPracticesScore: 0
      }
    }
  }

  private calculatePerformanceScore(metrics: { fcp: number; lcp: number; loadTime: number }): number {
    // Simplified performance scoring based on load times
    let score = 100
    
    if (metrics.fcp > 3000) score -= 30
    else if (metrics.fcp > 2000) score -= 20
    else if (metrics.fcp > 1500) score -= 10
    
    if (metrics.lcp > 4000) score -= 30
    else if (metrics.lcp > 2500) score -= 20
    else if (metrics.lcp > 2000) score -= 10
    
    if (metrics.loadTime > 3000) score -= 20
    else if (metrics.loadTime > 2000) score -= 10
    
    return Math.max(0, Math.min(100, score))
  }

  private async calculateSEOScore(page: Page): Promise<number> {
    try {
      const seoData = await page.evaluate(() => {
        const title = document.title
        const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content')
        const h1Tags = document.querySelectorAll('h1').length
        const images = document.querySelectorAll('img')
        const imagesWithAlt = Array.from(images).filter(img => img.getAttribute('alt')).length
        const links = document.querySelectorAll('a')
        const internalLinks = Array.from(links).filter(link => {
          const href = link.getAttribute('href')
          return href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')
        }).length

        return {
          hasTitle: title && title.length > 0,
          titleLength: title ? title.length : 0,
          hasMetaDescription: metaDescription && metaDescription.length > 0,
          metaDescriptionLength: metaDescription ? metaDescription.length : 0,
          h1Count: h1Tags,
          imageCount: images.length,
          imagesWithAlt,
          internalLinkCount: internalLinks
        }
      })

      let score = 0
      
      // Title scoring
      if (seoData.hasTitle) {
        score += 20
        if (seoData.titleLength >= 30 && seoData.titleLength <= 60) score += 10
      }
      
      // Meta description scoring
      if (seoData.hasMetaDescription) {
        score += 20
        if (seoData.metaDescriptionLength >= 120 && seoData.metaDescriptionLength <= 160) score += 10
      }
      
      // H1 scoring
      if (seoData.h1Count > 0) score += 15
      if (seoData.h1Count === 1) score += 5
      
      // Image alt text scoring
      if (seoData.imageCount > 0) {
        const altTextRatio = seoData.imagesWithAlt / seoData.imageCount
        score += Math.round(altTextRatio * 15)
      }
      
      // Internal links scoring
      if (seoData.internalLinkCount > 0) score += 10

      return Math.min(100, score)
    } catch (error) {
      console.error('Error calculating SEO score:', error)
      return 0
    }
  }

  private async calculateAccessibilityScore(page: Page): Promise<number> {
    try {
      const accessibilityData = await page.evaluate(() => {
        const images = document.querySelectorAll('img')
        const imagesWithAlt = Array.from(images).filter(img => img.getAttribute('alt')).length
        const links = document.querySelectorAll('a')
        const linksWithText = Array.from(links).filter(link => link.textContent?.trim()).length
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        const formInputs = document.querySelectorAll('input, textarea, select')
        const formInputsWithLabels = Array.from(formInputs).filter(input => {
          const id = input.getAttribute('id')
          const label = id ? document.querySelector(`label[for="${id}"]`) : null
          return label || input.getAttribute('aria-label') || input.getAttribute('aria-labelledby')
        }).length

        return {
          imageCount: images.length,
          imagesWithAlt,
          linkCount: links.length,
          linksWithText,
          headingCount: headings.length,
          formInputCount: formInputs.length,
          formInputsWithLabels
        }
      })

      let score = 0
      
      // Image alt text
      if (accessibilityData.imageCount > 0) {
        const altTextRatio = accessibilityData.imagesWithAlt / accessibilityData.imageCount
        score += Math.round(altTextRatio * 30)
      }
      
      // Link text
      if (accessibilityData.linkCount > 0) {
        const linkTextRatio = accessibilityData.linksWithText / accessibilityData.linkCount
        score += Math.round(linkTextRatio * 25)
      }
      
      // Headings structure
      if (accessibilityData.headingCount > 0) score += 20
      
      // Form labels
      if (accessibilityData.formInputCount > 0) {
        const labelRatio = accessibilityData.formInputsWithLabels / accessibilityData.formInputCount
        score += Math.round(labelRatio * 25)
      }

      return Math.min(100, score)
    } catch (error) {
      console.error('Error calculating accessibility score:', error)
      return 0
    }
  }

  private async calculateBestPracticesScore(page: Page): Promise<number> {
    try {
      const bestPracticesData = await page.evaluate(() => {
        const httpsLinks = Array.from(document.querySelectorAll('a[href^="https:"]')).length
        const httpLinks = Array.from(document.querySelectorAll('a[href^="http:"]')).length
        const totalLinks = Array.from(document.querySelectorAll('a[href^="http"]')).length
        const images = document.querySelectorAll('img')
        const imagesWithDimensions = Array.from(images).filter(img => 
          img.getAttribute('width') || img.getAttribute('height')
        ).length
        const scripts = document.querySelectorAll('script')
        const inlineScripts = Array.from(scripts).filter(script => !script.src).length

        return {
          httpsLinks,
          httpLinks,
          totalLinks,
          imageCount: images.length,
          imagesWithDimensions,
          scriptCount: scripts.length,
          inlineScripts
        }
      })

      let score = 0
      
      // HTTPS usage
      if (bestPracticesData.totalLinks > 0) {
        const httpsRatio = bestPracticesData.httpsLinks / bestPracticesData.totalLinks
        score += Math.round(httpsRatio * 30)
      }
      
      // Image dimensions
      if (bestPracticesData.imageCount > 0) {
        const dimensionRatio = bestPracticesData.imagesWithDimensions / bestPracticesData.imageCount
        score += Math.round(dimensionRatio * 25)
      }
      
      // Inline scripts (fewer is better)
      if (bestPracticesData.scriptCount > 0) {
        const inlineScriptRatio = bestPracticesData.inlineScripts / bestPracticesData.scriptCount
        score += Math.round((1 - inlineScriptRatio) * 25)
      }
      
      // Basic best practices
      score += 20

      return Math.min(100, score)
    } catch (error) {
      console.error('Error calculating best practices score:', error)
      return 0
    }
  }
}
