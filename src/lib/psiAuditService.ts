import psi from 'psi'
import { BrokenLinkCheckerService } from './brokenLinkChecker'
import { EnhancedSEOAnalysis, SEOAnalysisResult } from './enhancedSEOAnalysis'
import { ContentQualityAnalyzer, ContentQualityMetrics } from './contentQualityAnalyzer'

export interface PSIAuditResult {
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
  
  // Official Lighthouse Scores from PSI API
  mobileScore: number
  performanceScore: number
  accessibilityScore: number
  seoScore: number
  bestPracticesScore: number
  
  // Core Web Vitals
  fcpScore: number
  lcpScore: number
  clsScore: number
  fidScore: number
  loadTime: number
  
  // Performance Metrics
  performanceMetrics: any
  
  // Accessibility Data
  accessibilityIssues: any
  accessibilityRecommendations: any
  accessibilityAudit: any
  
  // Best Practices Data
  bestPracticesIssues: any
  bestPracticesRecommendations: any
  bestPracticesAudit: any
  
  // Audit Status
  url: string
  timestamp: string
  status: 'success' | 'error'
  error?: string
  
  // Enhanced SEO Analysis
  enhancedSEOAnalysis?: SEOAnalysisResult
  
  // Content Quality Analysis
  contentQualityAnalysis?: ContentQualityMetrics
  
  // PSI API Results
  psiResults?: {
    mobile: any
    desktop: any
  }
}

export class PSIAuditService {
  static getInstance(): PSIAuditService {
    return new PSIAuditService()
  }

  async auditWebsite(url: string): Promise<PSIAuditResult> {
    const maxRetries = 3
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Starting PSI audit attempt ${attempt}/${maxRetries} for URL:`, url)
        
        // Validate URL
        new URL(url)
        
        // Get PageSpeed Insights API key from environment
        const apiKey = process.env.PAGESPEED_INSIGHTS_API_KEY
        
        if (!apiKey) {
          throw new Error('PageSpeed Insights API key not found. Please set PAGESPEED_INSIGHTS_API_KEY environment variable.')
        }

        console.log('Fetching HTML content for SEO analysis...')
        // Fetch HTML content for SEO analysis
        const htmlContent = await this.fetchHTMLContent(url)
        console.log('HTML content fetched successfully, length:', htmlContent.length)

        console.log('Extracting SEO data...')
        // Extract SEO data from HTML
        const seoData = this.parseHTMLForSEO(htmlContent)
        console.log('SEO data extracted successfully')

        console.log('Running PageSpeed Insights API...')
        // Run PageSpeed Insights API for both mobile and desktop
        const [mobileResults, desktopResults] = await Promise.all([
          this.runPSI(url, 'mobile', apiKey),
          this.runPSI(url, 'desktop', apiKey)
        ])
        console.log('PSI API calls completed successfully')

        // Perform enhanced SEO analysis
        console.log('🔍 Starting enhanced SEO analysis...')
        let enhancedSEOAnalysis
        try {
          enhancedSEOAnalysis = EnhancedSEOAnalysis.analyze(htmlContent, url, seoData)
          console.log('✅ Enhanced SEO analysis completed:', {
            seoScore: enhancedSEOAnalysis.seoScore,
            seoGrade: enhancedSEOAnalysis.seoGrade,
            suggestionsCount: enhancedSEOAnalysis.suggestions.length
          })
        } catch (error) {
          console.error('❌ Enhanced SEO analysis failed:', error instanceof Error ? error.message : 'Unknown error')
          enhancedSEOAnalysis = null
        }

        // Perform content quality analysis
        console.log('📝 Starting content quality analysis...')
        let contentQualityAnalysis
        try {
          contentQualityAnalysis = ContentQualityAnalyzer.analyze(htmlContent, url)
          console.log('✅ Content quality analysis completed:', {
            overallScore: contentQualityAnalysis.overallScore,
            grade: contentQualityAnalysis.grade,
            wordCount: contentQualityAnalysis.wordCount,
            readabilityScore: contentQualityAnalysis.readabilityScore,
            recommendationsCount: contentQualityAnalysis.recommendations.length
          })
        } catch (error) {
          console.error('❌ Content quality analysis failed:', error instanceof Error ? error.message : 'Unknown error')
          contentQualityAnalysis = null
        }

        // Perform broken link checking
        console.log('🔍 Starting broken link check...')
        let brokenLinkResult
        try {
          const brokenLinkChecker = BrokenLinkCheckerService.getInstance()
          brokenLinkResult = await brokenLinkChecker.checkPageLinks(url, {
            timeout: 15000,
            maxRetries: 2,
            userAgent: 'SEO-Optimizer-Bot/1.0 (PSI)'
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

        // Process PSI results and extract scores
        const processedResults = this.processPSIResults(mobileResults, desktopResults)
        console.log('PSI results processed successfully')

        // Combine all data
        const result: PSIAuditResult = {
          ...seoData,
          brokenLinks: brokenLinkResult.brokenLinks.map(link => ({url: link.url, text: link.linkText})).slice(0, 10),
          brokenLinkDetails: brokenLinkResult.brokenLinks.slice(0, 20),
          brokenLinkSummary: {
            total: brokenLinkResult.totalLinks,
            broken: brokenLinkResult.brokenLinkCount,
            status: brokenLinkResult.status,
            duration: brokenLinkResult.duration
          },
          // Official Lighthouse scores from PSI API
          mobileScore: processedResults.mobileScore,
          performanceScore: processedResults.performanceScore,
          accessibilityScore: processedResults.accessibilityScore,
          seoScore: processedResults.seoScore,
          bestPracticesScore: processedResults.bestPracticesScore,
          // Core Web Vitals
          fcpScore: processedResults.fcpScore,
          lcpScore: processedResults.lcpScore,
          clsScore: processedResults.clsScore,
          fidScore: processedResults.fidScore,
          loadTime: processedResults.loadTime,
          // Audit data
          performanceMetrics: processedResults.performanceMetrics,
          accessibilityIssues: processedResults.accessibilityIssues,
          accessibilityRecommendations: processedResults.accessibilityRecommendations,
          accessibilityAudit: processedResults.accessibilityAudit,
          bestPracticesIssues: processedResults.bestPracticesIssues,
          bestPracticesRecommendations: processedResults.bestPracticesRecommendations,
          bestPracticesAudit: processedResults.bestPracticesAudit,
          url,
          timestamp: new Date().toISOString(),
          status: 'success',
          enhancedSEOAnalysis,
          contentQualityAnalysis,
          psiResults: {
            mobile: mobileResults,
            desktop: desktopResults
          }
        }

        console.log(`PSI audit completed successfully on attempt ${attempt}`)
        return result

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        console.error(`PSI audit attempt ${attempt} failed:`, lastError.message)
        
        // If this is the last attempt, return error result
        if (attempt === maxRetries) {
          console.error('All PSI audit attempts failed')
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
            fcpScore: 0,
            lcpScore: 0,
            clsScore: 0,
            fidScore: 0,
            loadTime: 0,
            performanceMetrics: {},
            accessibilityIssues: null,
            accessibilityRecommendations: null,
            accessibilityAudit: null,
            bestPracticesIssues: null,
            bestPracticesRecommendations: null,
            bestPracticesAudit: null,
            url,
            timestamp: new Date().toISOString(),
            status: 'error',
            error: lastError.message
          }
        }
        
        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        console.log(`Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    // This should never be reached, but just in case
    throw lastError || new Error('PSI audit failed after all retries')
  }

  private async fetchHTMLContent(url: string): Promise<string> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    
    try {
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
        redirect: 'follow'
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.text()
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
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
      imagesWithoutAlt: imagesWithoutAlt.slice(0, 20),
      imagesWithAlt: imagesWithAlt.slice(0, 20),
      internalLinks: internalLinks.slice(0, 50),
      externalLinks: externalLinks.slice(0, 50),
      totalLinks,
      totalImages,
      imagesMissingAlt,
      internalLinkCount,
      externalLinkCount,
      headingStructure
    }
  }

  private async runPSI(url: string, strategy: 'mobile' | 'desktop', apiKey: string): Promise<any> {
    try {
      console.log(`Running PSI for ${strategy}...`)
      
      const result = await psi(url, {
        key: apiKey,
        strategy: strategy,
        category: ['performance', 'accessibility', 'best-practices', 'seo']
      })
      
      console.log(`PSI ${strategy} completed successfully`)
      return result
    } catch (error) {
      console.error(`PSI ${strategy} failed:`, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  private processPSIResults(mobileResults: any, desktopResults: any) {
    // Use mobile results as primary (Google's recommendation)
    const primaryResults = mobileResults
    
    // Extract scores - the PSI API returns scores as 0-1, we need to convert to 0-100
    // The psi package wraps the response in a 'data' property
    const categories = primaryResults?.data?.lighthouseResult?.categories || {}
    const mobileScore = Math.round((categories?.performance?.score || 0) * 100)
    const performanceScore = Math.round((categories?.performance?.score || 0) * 100)
    const accessibilityScore = Math.round((categories?.accessibility?.score || 0) * 100)
    const seoScore = Math.round((categories?.seo?.score || 0) * 100)
    const bestPracticesScore = Math.round((categories?.['best-practices']?.score || 0) * 100)

    // Extract Core Web Vitals
    const audits = primaryResults?.data?.lighthouseResult?.audits || {}
    const fcpScore = audits['first-contentful-paint']?.numericValue || 0
    const lcpScore = audits['largest-contentful-paint']?.numericValue || 0
    const clsScore = audits['cumulative-layout-shift']?.numericValue || 0
    const fidScore = audits['max-potential-fid']?.numericValue || 0
    const loadTime = audits['load-fast-3g']?.numericValue || 0

    // Extract audit issues and recommendations
    const accessibilityIssues = this.extractAuditIssues(audits, 'accessibility')
    const bestPracticesIssues = this.extractAuditIssues(audits, 'best-practices')

    return {
      mobileScore,
      performanceScore,
      accessibilityScore,
      seoScore,
      bestPracticesScore,
      fcpScore,
      lcpScore,
      clsScore,
      fidScore,
      loadTime,
      performanceMetrics: {
        fcp: fcpScore,
        lcp: lcpScore,
        cls: clsScore,
        fid: fidScore,
        loadTime
      },
      accessibilityIssues,
      accessibilityRecommendations: accessibilityIssues.map(issue => issue.recommendation),
      accessibilityAudit: categories?.accessibility,
      bestPracticesIssues,
      bestPracticesRecommendations: bestPracticesIssues.map(issue => issue.recommendation),
      bestPracticesAudit: categories?.['best-practices']
    }
  }

  private extractAuditIssues(audits: any, category: string): Array<{id: string, title: string, description: string, score: number, recommendation: string}> {
    const issues: Array<{id: string, title: string, description: string, score: number, recommendation: string}> = []
    
    Object.entries(audits).forEach(([id, audit]: [string, any]) => {
      if (audit && audit.score !== null && audit.score < 1 && this.isCategoryAudit(id, category)) {
        issues.push({
          id,
          title: audit.title || id,
          description: audit.description || '',
          score: Math.round(audit.score * 100),
          recommendation: audit.explanation || audit.title || 'Review this issue'
        })
      }
    })
    
    return issues.sort((a, b) => a.score - b.score)
  }

  private isCategoryAudit(auditId: string, category: string): boolean {
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
