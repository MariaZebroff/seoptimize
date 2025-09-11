import puppeteer, { Browser, Page } from 'puppeteer'
import { BrokenLinkCheckerService } from './brokenLinkChecker'

// Conditional imports for Lighthouse (only when needed)
let lighthouse: any = null
let chromeLauncher: any = null

// Function to run Lighthouse in a child process
async function runLighthouseInChildProcess(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process')
    const path = require('path')
    
    // Create a temporary script to run Lighthouse
    const scriptPath = path.join(process.cwd(), 'lighthouse-script.js')
    const fs = require('fs')
    
    const lighthouseScript = `
const lighthouse = require('lighthouse').default || require('lighthouse')
const chromeLauncher = require('chrome-launcher')

async function runLighthouse() {
  let chrome = null
  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security'
      ]
    })
    
    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port
    }
    
    const result = await lighthouse('${url}', options)
    console.log(JSON.stringify(result.lhr))
  } catch (error) {
    console.error('Lighthouse error:', error.message)
    process.exit(1)
  } finally {
    if (chrome) {
      await chrome.kill()
    }
  }
}

runLighthouse()
`
    
    fs.writeFileSync(scriptPath, lighthouseScript)
    
    const child = spawn('node', [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    let output = ''
    let errorOutput = ''
    
    child.stdout.on('data', (data: Buffer) => {
      output += data.toString()
    })
    
    child.stderr.on('data', (data: Buffer) => {
      errorOutput += data.toString()
    })
    
    child.on('close', (code: number) => {
      // Clean up the temporary script
      try {
        fs.unlinkSync(scriptPath)
      } catch (e) {
        // Ignore cleanup errors
      }
      
      if (code === 0 && output) {
        try {
          const result = JSON.parse(output)
          resolve(result)
        } catch (parseError) {
          reject(new Error('Failed to parse Lighthouse output'))
        }
      } else {
        reject(new Error(errorOutput || 'Lighthouse process failed'))
      }
    })
    
    child.on('error', (error: Error) => {
      reject(error)
    })
  })
}

export interface DetailedMetrics {
  fcp: number
  lcp: number
  cls: number
  fid: number
  loadTime: number
  domContentLoaded: number
  firstByte: number
  totalBlockingTime: number
  speedIndex: number
}

export interface AuditIssue {
  id: string
  title: string
  description: string
  score: number
  category: 'performance' | 'accessibility' | 'best-practices' | 'seo'
  severity: 'error' | 'warning' | 'info'
  impact: 'high' | 'medium' | 'low'
  recommendation: string
  documentation?: string
}

export interface DetailedAuditResults {
  performance: {
    score: number
    metrics: DetailedMetrics
    issues: AuditIssue[]
    opportunities: Array<{
      id: string
      title: string
      description: string
      score: number
      savings: string
    }>
  }
  accessibility: {
    score: number
    issues: AuditIssue[]
    passedAudits: string[]
    failedAudits: string[]
  }
  'best-practices': {
    score: number
    issues: AuditIssue[]
    passedAudits: string[]
    failedAudits: string[]
  }
  seo: {
    score: number
    issues: AuditIssue[]
    passedAudits: string[]
    failedAudits: string[]
  }
}

export interface PuppeteerAuditResult {
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
  // New detailed audit results
  detailedResults?: DetailedAuditResults
  lighthouseResults?: any
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
      const seoData = await this.extractSEOData(page, url)
      console.log('SEO data extracted:', seoData)
      
      console.log('Calculating performance metrics...')
      // Calculate basic performance metrics
      const performanceMetrics = await this.calculatePerformanceMetrics(page)
      console.log('Performance metrics calculated:', performanceMetrics)

      // Run Lighthouse audit for detailed results (optional - don't let it break the main audit)
      let lighthouseResults = null
      let detailedResults = undefined
      
      // Check if Lighthouse should be enabled (can be disabled via environment variable)
      const lighthouseEnabled = process.env.ENABLE_LIGHTHOUSE !== 'false'
      
      if (lighthouseEnabled) {
        console.log('Attempting Lighthouse audit (optional)...')
        
        // Run Lighthouse in a separate try-catch to ensure it doesn't break the main audit
        try {
          // Add a timeout to prevent Lighthouse from hanging
          const lighthousePromise = this.runLighthouseAudit(url)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Lighthouse timeout')), 30000)
          )
          
          lighthouseResults = await Promise.race([lighthousePromise, timeoutPromise])
          
          if (lighthouseResults) {
            detailedResults = this.processLighthouseResults(lighthouseResults)
            console.log('Lighthouse results processed successfully')
          } else {
            console.log('Lighthouse audit returned no results, continuing with basic audit')
          }
        } catch (lighthouseError) {
          console.log('Lighthouse audit failed (this is optional):', lighthouseError instanceof Error ? lighthouseError.message : 'Unknown error')
          console.log('Continuing with basic audit without Lighthouse data')
          // Don't throw - just continue without Lighthouse data
        }
      } else {
        console.log('Lighthouse audit disabled, using basic audit only')
      }

      const result: PuppeteerAuditResult = {
        ...seoData,
        ...performanceMetrics,
        url,
        timestamp: new Date().toISOString(),
        status: 'success',
        detailedResults,
        lighthouseResults
      }

      console.log('Puppeteer audit completed successfully:', result)
      return result

    } catch (error) {
      console.error('Puppeteer audit error:', error)
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

  private async extractSEOData(page: Page, url: string) {
    // Extract basic SEO data from the page
    const basicSeoData = await page.evaluate(() => {
      // Helper function to count words
      const countWords = (text: string): number => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length
      }

      // Helper function to extract heading text
      const extractHeadingText = (headings: NodeListOf<Element>): string[] => {
        return Array.from(headings)
          .map(heading => {
            const text = heading.textContent?.trim() || ''
            return text.replace(/\s+/g, ' ').trim()
          })
          .filter(text => text.length > 0)
      }

      // Extract title and word count
      const title = document.title || ''
      const titleWordCount = countWords(title)
      
      // Extract meta description and word count
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
      const metaDescriptionWordCount = countWords(metaDescription)
      
      // Extract all heading levels
      const h1Tags = extractHeadingText(document.querySelectorAll('h1'))
      const h2Tags = extractHeadingText(document.querySelectorAll('h2'))
      const h3Tags = extractHeadingText(document.querySelectorAll('h3'))
      const h4Tags = extractHeadingText(document.querySelectorAll('h4'))
      const h5Tags = extractHeadingText(document.querySelectorAll('h5'))
      const h6Tags = extractHeadingText(document.querySelectorAll('h6'))

      // Calculate word counts for each heading level
      const h1WordCount = h1Tags.reduce((total, text) => total + countWords(text), 0)
      const h2WordCount = h2Tags.reduce((total, text) => total + countWords(text), 0)
      const h3WordCount = h3Tags.reduce((total, text) => total + countWords(text), 0)
      const h4WordCount = h4Tags.reduce((total, text) => total + countWords(text), 0)
      const h5WordCount = h5Tags.reduce((total, text) => total + countWords(text), 0)
      const h6WordCount = h6Tags.reduce((total, text) => total + countWords(text), 0)

      // Extract images and alt text analysis
      const images = Array.from(document.querySelectorAll('img'))
      const imagesWithoutAlt: string[] = []
      const imagesWithAlt: string[] = []
      
      images.forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || 'unknown'
        const alt = img.getAttribute('alt')
        
        if (!alt || alt.trim() === '') {
          imagesWithoutAlt.push(src)
        } else {
          imagesWithAlt.push(src)
        }
      })

      const totalImages = images.length
      const imagesMissingAlt = imagesWithoutAlt.length

      // Extract and analyze links with text content
      const links = Array.from(document.querySelectorAll('a[href]'))
      const internalLinks: Array<{url: string, text: string}> = []
      const externalLinks: Array<{url: string, text: string}> = []
      
      const currentDomain = window.location.hostname
      
      links.forEach(link => {
        const href = link.getAttribute('href')
        if (!href) return

        // Skip obvious non-links for classification
        if (href.includes('javascript:') || href.includes('void(0)') || href === '#') {
          return
        }

        // Extract link text content
        const linkText = link.textContent?.trim() || ''

        // Classify as internal or external
        try {
          const linkUrl = new URL(href, window.location.href)
          if (linkUrl.hostname === currentDomain || linkUrl.hostname === '') {
            internalLinks.push({url: href, text: linkText})
          } else {
            externalLinks.push({url: href, text: linkText})
          }
        } catch {
          // Relative links are considered internal
          if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            internalLinks.push({url: href, text: linkText})
          } else {
            externalLinks.push({url: href, text: linkText})
          }
        }
      })

      const totalLinks = links.length
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
        // brokenLinks will be added after comprehensive check
      }
    })

    // Perform comprehensive broken link checking
    console.log('🔍 Starting comprehensive broken link check...')
    const brokenLinkChecker = BrokenLinkCheckerService.getInstance()
    const brokenLinkResult = await brokenLinkChecker.checkPageLinks(url, {
      timeout: 15000,
      maxRetries: 2,
      userAgent: 'SEO-Optimizer-Bot/1.0 (Puppeteer)'
    })

    // Combine basic SEO data with broken link results
    return {
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

  private async runLighthouseAudit(url: string): Promise<any> {
    try {
      console.log('Starting Lighthouse audit for:', url)
      
      // Run Lighthouse in a child process to avoid Next.js compatibility issues
      const result = await runLighthouseInChildProcess(url)
      
      if (!result) {
        console.log('Lighthouse returned no result')
        return null
      }
      
      console.log('Lighthouse audit completed successfully')
      return result
    } catch (error) {
      console.log('Lighthouse audit failed (expected in some environments):', error instanceof Error ? error.message : 'Unknown error')
      return null
    }
  }

  private processLighthouseResults(lighthouseResults: any): DetailedAuditResults | undefined {
    if (!lighthouseResults) return undefined

    try {
      const { audits, categories } = lighthouseResults

      // Process performance metrics
      const performanceMetrics: DetailedMetrics = {
        fcp: audits['first-contentful-paint']?.numericValue || 0,
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        cls: audits['cumulative-layout-shift']?.numericValue || 0,
        fid: audits['max-potential-fid']?.numericValue || 0,
        loadTime: audits['load-fast-3g']?.numericValue || 0,
        domContentLoaded: audits['dom-content-loaded']?.numericValue || 0,
        firstByte: audits['server-response-time']?.numericValue || 0,
        totalBlockingTime: audits['total-blocking-time']?.numericValue || 0,
        speedIndex: audits['speed-index']?.numericValue || 0,
      }

      // Process performance issues and opportunities
      const performanceIssues = this.extractAuditIssues(audits, 'performance')
      const performanceOpportunities = this.extractOpportunities(audits, 'performance')

      // Process accessibility issues
      const accessibilityIssues = this.extractAuditIssues(audits, 'accessibility')
      const accessibilityPassed = this.extractPassedAudits(audits, 'accessibility')
      const accessibilityFailed = this.extractFailedAudits(audits, 'accessibility')

      // Process best practices issues
      const bestPracticesIssues = this.extractAuditIssues(audits, 'best-practices')
      const bestPracticesPassed = this.extractPassedAudits(audits, 'best-practices')
      const bestPracticesFailed = this.extractFailedAudits(audits, 'best-practices')

      // Process SEO issues
      const seoIssues = this.extractAuditIssues(audits, 'seo')
      const seoPassed = this.extractPassedAudits(audits, 'seo')
      const seoFailed = this.extractFailedAudits(audits, 'seo')

      return {
        performance: {
          score: Math.round(categories.performance?.score * 100) || 0,
          metrics: performanceMetrics,
          issues: performanceIssues,
          opportunities: performanceOpportunities
        },
        accessibility: {
          score: Math.round(categories.accessibility?.score * 100) || 0,
          issues: accessibilityIssues,
          passedAudits: accessibilityPassed,
          failedAudits: accessibilityFailed
        },
        'best-practices': {
          score: Math.round(categories['best-practices']?.score * 100) || 0,
          issues: bestPracticesIssues,
          passedAudits: bestPracticesPassed,
          failedAudits: bestPracticesFailed
        },
        seo: {
          score: Math.round(categories.seo?.score * 100) || 0,
          issues: seoIssues,
          passedAudits: seoPassed,
          failedAudits: seoFailed
        }
      }
    } catch (error) {
      console.error('Error processing Lighthouse results:', error)
      return undefined
    }
  }

  private extractAuditIssues(audits: any, category: string): AuditIssue[] {
    const issues: AuditIssue[] = []
    
    Object.entries(audits).forEach(([id, audit]: [string, any]) => {
      if (audit && audit.score !== null && audit.score < 1 && this.isCategoryAudit(id, category)) {
        const severity = audit.score === 0 ? 'error' : audit.score < 0.5 ? 'warning' : 'info'
        const impact = audit.score === 0 ? 'high' : audit.score < 0.5 ? 'medium' : 'low'
        
        issues.push({
          id,
          title: audit.title || id,
          description: audit.description || '',
          score: Math.round(audit.score * 100),
          category: category as any,
          severity,
          impact,
          recommendation: audit.explanation || audit.title || 'Review this issue',
          documentation: audit.documentation?.[0]?.url
        })
      }
    })
    
    return issues.sort((a, b) => a.score - b.score)
  }

  private extractOpportunities(audits: any, category: string): Array<{id: string, title: string, description: string, score: number, savings: string}> {
    const opportunities: Array<{id: string, title: string, description: string, score: number, savings: string}> = []
    
    Object.entries(audits).forEach(([id, audit]: [string, any]) => {
      if (audit && audit.details && audit.details.type === 'opportunity' && this.isCategoryAudit(id, category)) {
        opportunities.push({
          id,
          title: audit.title || id,
          description: audit.description || '',
          score: Math.round((audit.score || 0) * 100),
          savings: audit.displayValue || 'Potential savings available'
        })
      }
    })
    
    return opportunities.sort((a, b) => b.score - a.score)
  }

  private extractPassedAudits(audits: any, category: string): string[] {
    return Object.entries(audits)
      .filter(([id, audit]: [string, any]) => 
        audit && audit.score === 1 && this.isCategoryAudit(id, category)
      )
      .map(([id]) => id)
  }

  private extractFailedAudits(audits: any, category: string): string[] {
    return Object.entries(audits)
      .filter(([id, audit]: [string, any]) => 
        audit && audit.score !== null && audit.score < 1 && this.isCategoryAudit(id, category)
      )
      .map(([id]) => id)
  }

  private isCategoryAudit(auditId: string, category: string): boolean {
    // This is a simplified mapping - in a real implementation, you'd want to use
    // Lighthouse's actual audit categorization
    const categoryMappings = {
      performance: [
        'first-contentful-paint', 'largest-contentful-paint', 'cumulative-layout-shift',
        'max-potential-fid', 'speed-index', 'total-blocking-time', 'server-response-time',
        'render-blocking-resources', 'unused-css-rules', 'unused-javascript',
        'modern-image-formats', 'efficient-animated-content', 'preload-lcp-image'
      ],
      accessibility: [
        'color-contrast', 'image-alt', 'label', 'link-name', 'button-name',
        'form-field-multiple-labels', 'heading-order', 'html-has-lang',
        'html-lang-valid', 'input-image-alt', 'label-content-name-mismatch'
      ],
      'best-practices': [
        'is-on-https', 'uses-http2', 'no-vulnerable-libraries', 'notification-on-start',
        'deprecations', 'console-errors', 'csp-xss', 'errors-in-console'
      ],
      seo: [
        'meta-description', 'document-title', 'link-text', 'crawlable-anchors',
        'is-crawlable', 'robots-txt', 'hreflang', 'canonical', 'font-display'
      ]
    }
    
    return categoryMappings[category as keyof typeof categoryMappings]?.includes(auditId) || false
  }
}
