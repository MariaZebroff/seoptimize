import { DetailedAuditResults, AuditIssue, DetailedMetrics } from './puppeteerAuditService'

export interface DynamicRecommendation {
  id: string
  title: string
  description: string
  category: 'performance' | 'accessibility' | 'best-practices' | 'seo'
  priority: 'high' | 'medium' | 'low'
  impact: string
  effort: 'easy' | 'medium' | 'hard'
  steps: string[]
  resources?: string[]
  estimatedSavings?: string
}

export interface PerformanceInsights {
  score: number
  metrics: DetailedMetrics
  criticalIssues: AuditIssue[]
  opportunities: DynamicRecommendation[]
  trends: {
    fcp: 'good' | 'needs-improvement' | 'poor'
    lcp: 'good' | 'needs-improvement' | 'poor'
    cls: 'good' | 'needs-improvement' | 'poor'
    fid: 'good' | 'needs-improvement' | 'poor'
  }
}

export interface AccessibilityInsights {
  score: number
  criticalIssues: AuditIssue[]
  recommendations: DynamicRecommendation[]
  compliance: {
    wcagAA: boolean
    wcagAAA: boolean
    estimatedCompliance: number
  }
}

export interface BestPracticesInsights {
  score: number
  securityIssues: AuditIssue[]
  modernStandardsIssues: AuditIssue[]
  recommendations: DynamicRecommendation[]
}

export interface SEOInsights {
  score: number
  contentIssues: AuditIssue[]
  technicalIssues: AuditIssue[]
  recommendations: DynamicRecommendation[]
}

export class DynamicRecommendationEngine {
  static generateRecommendations(detailedResults: DetailedAuditResults): {
    performance: PerformanceInsights
    accessibility: AccessibilityInsights
    'best-practices': BestPracticesInsights
    seo: SEOInsights
  } {
    return {
      performance: this.generatePerformanceInsights(detailedResults.performance),
      accessibility: this.generateAccessibilityInsights(detailedResults.accessibility),
      'best-practices': this.generateBestPracticesInsights(detailedResults['best-practices']),
      seo: this.generateSEOInsights(detailedResults.seo)
    }
  }

  // Fallback method to generate basic recommendations from simple scores
  static generateBasicRecommendations(scores: {
    performanceScore: number
    accessibilityScore: number
    bestPracticesScore: number
    seoScore: number
  }): {
    performance: PerformanceInsights
    accessibility: AccessibilityInsights
    'best-practices': BestPracticesInsights
    seo: SEOInsights
  } {
    return {
      performance: this.generateBasicPerformanceInsights(scores.performanceScore),
      accessibility: this.generateBasicAccessibilityInsights(scores.accessibilityScore),
      'best-practices': this.generateBasicBestPracticesInsights(scores.bestPracticesScore),
      seo: this.generateBasicSEOInsights(scores.seoScore)
    }
  }

  private static generatePerformanceInsights(performance: unknown): PerformanceInsights {
    const { score, metrics, issues, opportunities } = performance
    
    // Analyze metrics trends
    const trends = {
      fcp: this.analyzeMetric(metrics.fcp, { good: 1800, poor: 3000 }),
      lcp: this.analyzeMetric(metrics.lcp, { good: 2500, poor: 4000 }),
      cls: this.analyzeMetric(metrics.cls, { good: 0.1, poor: 0.25 }),
      fid: this.analyzeMetric(metrics.fid, { good: 100, poor: 300 })
    }

    // Get critical issues (high impact)
    const criticalIssues = issues.filter((issue: AuditIssue) => issue.impact === 'high')

    // Generate dynamic recommendations based on actual issues
    const dynamicOpportunities = this.generatePerformanceRecommendations(metrics, issues, opportunities)

    return {
      score,
      metrics,
      criticalIssues,
      opportunities: dynamicOpportunities,
      trends
    }
  }

  private static generateAccessibilityInsights(accessibility: unknown): AccessibilityInsights {
    const { score, issues } = accessibility
    
    const criticalIssues = issues.filter((issue: AuditIssue) => issue.impact === 'high')
    const recommendations = this.generateAccessibilityRecommendations(issues)
    
    // Estimate WCAG compliance
    const totalAudits = issues.length + accessibility.passedAudits.length
    const passedAudits = accessibility.passedAudits.length
    const estimatedCompliance = totalAudits > 0 ? (passedAudits / totalAudits) * 100 : 0

    return {
      score,
      criticalIssues,
      recommendations,
      compliance: {
        wcagAA: estimatedCompliance >= 80,
        wcagAAA: estimatedCompliance >= 95,
        estimatedCompliance
      }
    }
  }

  private static generateBestPracticesInsights(bestPractices: unknown): BestPracticesInsights {
    const { score, issues } = bestPractices
    
    const securityIssues = issues.filter((issue: AuditIssue) => 
      issue.id.includes('https') || issue.id.includes('security') || issue.id.includes('csp')
    )
    
    const modernStandardsIssues = issues.filter((issue: AuditIssue) => 
      issue.id.includes('deprecation') || issue.id.includes('console') || issue.id.includes('http2')
    )
    
    const recommendations = this.generateBestPracticesRecommendations(issues)

    return {
      score,
      securityIssues,
      modernStandardsIssues,
      recommendations
    }
  }

  private static generateSEOInsights(seo: unknown): SEOInsights {
    const { score, issues } = seo
    
    const contentIssues = issues.filter((issue: AuditIssue) => 
      issue.id.includes('title') || issue.id.includes('description') || issue.id.includes('heading')
    )
    
    const technicalIssues = issues.filter((issue: AuditIssue) => 
      issue.id.includes('canonical') || issue.id.includes('robots') || issue.id.includes('crawlable')
    )
    
    const recommendations = this.generateSEORecommendations(issues)

    return {
      score,
      contentIssues,
      technicalIssues,
      recommendations
    }
  }

  private static analyzeMetric(value: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' {
    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.poor) return 'needs-improvement'
    return 'poor'
  }

  private static generatePerformanceRecommendations(metrics: DetailedMetrics, issues: AuditIssue[], opportunities: unknown[]): DynamicRecommendation[] {
    const recommendations: DynamicRecommendation[] = []

    // FCP recommendations
    if (metrics.fcp > 1800) {
      recommendations.push({
        id: 'optimize-fcp',
        title: 'Optimize First Contentful Paint',
        description: `Your FCP is ${Math.round(metrics.fcp)}ms, which is slower than the recommended 1.8s.`,
        category: 'performance',
        priority: metrics.fcp > 3000 ? 'high' : 'medium',
        impact: `Improving FCP by ${Math.round(metrics.fcp - 1800)}ms could significantly improve user experience.`,
        effort: 'medium',
        steps: [
          'Eliminate render-blocking resources',
          'Minify CSS and JavaScript',
          'Use critical CSS inlining',
          'Optimize server response times'
        ],
        resources: [
          'https://web.dev/first-contentful-paint/',
          'https://web.dev/render-blocking-resources/'
        ],
        estimatedSavings: `${Math.round(metrics.fcp - 1800)}ms`
      })
    }

    // LCP recommendations
    if (metrics.lcp > 2500) {
      recommendations.push({
        id: 'optimize-lcp',
        title: 'Optimize Largest Contentful Paint',
        description: `Your LCP is ${Math.round(metrics.lcp)}ms, which exceeds the recommended 2.5s.`,
        category: 'performance',
        priority: metrics.lcp > 4000 ? 'high' : 'medium',
        impact: `Improving LCP by ${Math.round(metrics.lcp - 2500)}ms could boost Core Web Vitals score.`,
        effort: 'medium',
        steps: [
          'Optimize images (use WebP, AVIF formats)',
          'Preload critical resources',
          'Use a Content Delivery Network (CDN)',
          'Optimize server response times'
        ],
        resources: [
          'https://web.dev/largest-contentful-paint/',
          'https://web.dev/optimize-lcp/'
        ],
        estimatedSavings: `${Math.round(metrics.lcp - 2500)}ms`
      })
    }

    // CLS recommendations
    if (metrics.cls > 0.1) {
      recommendations.push({
        id: 'fix-cls',
        title: 'Fix Cumulative Layout Shift',
        description: `Your CLS score is ${metrics.cls.toFixed(3)}, which exceeds the recommended 0.1.`,
        category: 'performance',
        priority: metrics.cls > 0.25 ? 'high' : 'medium',
        impact: 'Reducing layout shifts improves user experience and Core Web Vitals.',
        effort: 'easy',
        steps: [
          'Add size attributes to images and videos',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use transform animations instead of layout-triggering properties'
        ],
        resources: [
          'https://web.dev/cls/',
          'https://web.dev/optimize-cls/'
        ]
      })
    }

    // Add recommendations based on specific issues
    issues.forEach(issue => {
      if (issue.impact === 'high') {
        recommendations.push({
          id: `fix-${issue.id}`,
          title: `Fix: ${issue.title}`,
          description: issue.description,
          category: 'performance',
          priority: 'high',
          impact: `This issue is significantly impacting your performance score.`,
          effort: 'medium',
          steps: [issue.recommendation],
          resources: issue.documentation ? [issue.documentation] : undefined
        })
      }
    })

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private static generateAccessibilityRecommendations(issues: AuditIssue[]): DynamicRecommendation[] {
    const recommendations: DynamicRecommendation[] = []

    issues.forEach(issue => {
      let steps: string[] = []
      let effort: 'easy' | 'medium' | 'hard' = 'medium'

      switch (issue.id) {
        case 'color-contrast':
          steps = [
            'Check color contrast ratios using tools like WebAIM Contrast Checker',
            'Ensure text has at least 4.5:1 contrast ratio for normal text',
            'Ensure text has at least 3:1 contrast ratio for large text'
          ]
          effort = 'easy'
          break
        case 'image-alt':
          steps = [
            'Add descriptive alt text to all images',
            'Use empty alt="" for decorative images',
            'Ensure alt text describes the image content and purpose'
          ]
          effort = 'easy'
          break
        case 'label':
          steps = [
            'Associate form labels with their inputs using for/id attributes',
            'Use aria-label or aria-labelledby for complex form controls',
            'Ensure all form inputs have accessible names'
          ]
          effort = 'easy'
          break
        case 'link-name':
          steps = [
            'Ensure all links have descriptive text content',
            'Use aria-label for icon-only links',
            'Avoid generic link text like "click here" or "read more"'
          ]
          effort = 'easy'
          break
        default:
          steps = [issue.recommendation]
      }

      recommendations.push({
        id: `fix-${issue.id}`,
        title: `Fix: ${issue.title}`,
        description: issue.description,
        category: 'accessibility',
        priority: issue.impact === 'high' ? 'high' : issue.impact === 'medium' ? 'medium' : 'low',
        impact: `This accessibility issue affects users with disabilities and may impact SEO.`,
        effort,
        steps,
        resources: issue.documentation ? [issue.documentation] : undefined
      })
    })

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private static generateBestPracticesRecommendations(issues: AuditIssue[]): DynamicRecommendation[] {
    const recommendations: DynamicRecommendation[] = []

    issues.forEach(issue => {
      let steps: string[] = []
      let effort: 'easy' | 'medium' | 'hard' = 'medium'

      switch (issue.id) {
        case 'is-on-https':
          steps = [
            'Obtain an SSL certificate from a trusted Certificate Authority',
            'Configure your web server to use HTTPS',
            'Set up HTTP to HTTPS redirects',
            'Update all internal links to use HTTPS'
          ]
          effort = 'medium'
          break
        case 'no-vulnerable-libraries':
          steps = [
            'Audit your JavaScript dependencies for known vulnerabilities',
            'Update vulnerable libraries to secure versions',
            'Use tools like npm audit or Snyk to identify issues',
            'Consider using automated dependency updates'
          ]
          effort = 'medium'
          break
        case 'console-errors':
          steps = [
            'Review browser console for JavaScript errors',
            'Fix syntax errors and runtime exceptions',
            'Handle promise rejections properly',
            'Use proper error handling and logging'
          ]
          effort = 'medium'
          break
        default:
          steps = [issue.recommendation]
      }

      recommendations.push({
        id: `fix-${issue.id}`,
        title: `Fix: ${issue.title}`,
        description: issue.description,
        category: 'best-practices',
        priority: issue.impact === 'high' ? 'high' : issue.impact === 'medium' ? 'medium' : 'low',
        impact: `This best practice issue affects security, performance, or user experience.`,
        effort,
        steps,
        resources: issue.documentation ? [issue.documentation] : undefined
      })
    })

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private static generateSEORecommendations(issues: AuditIssue[]): DynamicRecommendation[] {
    const recommendations: DynamicRecommendation[] = []

    issues.forEach(issue => {
      let steps: string[] = []
      let effort: 'easy' | 'medium' | 'hard' = 'medium'

      switch (issue.id) {
        case 'document-title':
          steps = [
            'Add a unique, descriptive title tag to each page',
            'Keep titles between 30-60 characters',
            'Include your primary keyword in the title',
            'Make titles compelling and click-worthy'
          ]
          effort = 'easy'
          break
        case 'meta-description':
          steps = [
            'Add meta descriptions to all pages',
            'Keep descriptions between 120-160 characters',
            'Include a call-to-action in descriptions',
            'Make descriptions unique for each page'
          ]
          effort = 'easy'
          break
        case 'link-text':
          steps = [
            'Use descriptive anchor text for all links',
            'Avoid generic text like "click here" or "read more"',
            'Include relevant keywords in anchor text naturally',
            'Ensure link text describes the destination'
          ]
          effort = 'easy'
          break
        default:
          steps = [issue.recommendation]
      }

      recommendations.push({
        id: `fix-${issue.id}`,
        title: `Fix: ${issue.title}`,
        description: issue.description,
        category: 'seo',
        priority: issue.impact === 'high' ? 'high' : issue.impact === 'medium' ? 'medium' : 'low',
        impact: `This SEO issue may affect your search engine rankings and visibility.`,
        effort,
        steps,
        resources: issue.documentation ? [issue.documentation] : undefined
      })
    })

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // Basic fallback methods for when Lighthouse data is not available
  private static generateBasicPerformanceInsights(score: number): PerformanceInsights {
    const recommendations: DynamicRecommendation[] = []
    
    if (score < 70) {
      recommendations.push({
        id: 'improve-performance',
        title: 'Improve Overall Performance',
        description: `Your performance score is ${score}/100, which indicates room for improvement.`,
        category: 'performance',
        priority: score < 50 ? 'high' : 'medium',
        impact: 'Improving performance will enhance user experience and SEO rankings.',
        effort: 'medium',
        steps: [
          'Optimize images and use modern formats (WebP, AVIF)',
          'Minify CSS, JavaScript, and HTML files',
          'Enable compression (Gzip/Brotli)',
          'Implement browser caching',
          'Use a Content Delivery Network (CDN)',
          'Optimize server response times'
        ],
        resources: [
          'https://web.dev/performance/',
          'https://web.dev/fast/'
        ]
      })
    }

    return {
      score,
      metrics: {
        fcp: 0, lcp: 0, cls: 0, fid: 0, loadTime: 0,
        domContentLoaded: 0, firstByte: 0, totalBlockingTime: 0, speedIndex: 0
      },
      criticalIssues: [],
      opportunities: recommendations,
      trends: {
        fcp: score >= 80 ? 'good' : score >= 60 ? 'needs-improvement' : 'poor',
        lcp: score >= 80 ? 'good' : score >= 60 ? 'needs-improvement' : 'poor',
        cls: score >= 80 ? 'good' : score >= 60 ? 'needs-improvement' : 'poor',
        fid: score >= 80 ? 'good' : score >= 60 ? 'needs-improvement' : 'poor'
      }
    }
  }

  private static generateBasicAccessibilityInsights(score: number): AccessibilityInsights {
    const recommendations: DynamicRecommendation[] = []
    
    if (score < 70) {
      recommendations.push({
        id: 'improve-accessibility',
        title: 'Improve Website Accessibility',
        description: `Your accessibility score is ${score}/100. Focus on making your site more accessible to users with disabilities.`,
        category: 'accessibility',
        priority: score < 50 ? 'high' : 'medium',
        impact: 'Improving accessibility helps users with disabilities and may improve SEO rankings.',
        effort: 'medium',
        steps: [
          'Add alt text to all images',
          'Ensure proper heading structure (H1, H2, H3)',
          'Improve color contrast ratios',
          'Make all interactive elements keyboard accessible',
          'Add ARIA labels where needed',
          'Test with screen readers'
        ],
        resources: [
          'https://web.dev/accessibility/',
          'https://www.w3.org/WAI/WCAG21/quickref/'
        ]
      })
    }

    return {
      score,
      criticalIssues: [],
      recommendations,
      compliance: {
        wcagAA: score >= 80,
        wcagAAA: score >= 95,
        estimatedCompliance: score
      }
    }
  }

  private static generateBasicBestPracticesInsights(score: number): BestPracticesInsights {
    const recommendations: DynamicRecommendation[] = []
    
    if (score < 70) {
      recommendations.push({
        id: 'improve-best-practices',
        title: 'Follow Web Development Best Practices',
        description: `Your best practices score is ${score}/100. Focus on security, modern standards, and code quality.`,
        category: 'best-practices',
        priority: score < 50 ? 'high' : 'medium',
        impact: 'Following best practices improves security, performance, and maintainability.',
        effort: 'medium',
        steps: [
          'Implement HTTPS and security headers',
          'Use modern JavaScript features and avoid deprecated APIs',
          'Optimize images and use appropriate formats',
          'Add proper error handling and user feedback',
          'Use semantic HTML and proper ARIA labels',
          'Implement proper caching strategies'
        ],
        resources: [
          'https://web.dev/security/',
          'https://web.dev/learn/'
        ]
      })
    }

    return {
      score,
      securityIssues: [],
      modernStandardsIssues: [],
      recommendations
    }
  }

  private static generateBasicSEOInsights(score: number): SEOInsights {
    const recommendations: DynamicRecommendation[] = []
    
    if (score < 70) {
      recommendations.push({
        id: 'improve-seo',
        title: 'Improve SEO Optimization',
        description: `Your SEO score is ${score}/100. Focus on content optimization and technical SEO.`,
        category: 'seo',
        priority: score < 50 ? 'high' : 'medium',
        impact: 'Improving SEO will help your website rank better in search engines.',
        effort: 'medium',
        steps: [
          'Add proper meta descriptions to all pages',
          'Optimize page titles (30-60 characters)',
          'Use descriptive heading structure (H1, H2, H3)',
          'Add alt text to images',
          'Fix broken links',
          'Improve internal linking structure'
        ],
        resources: [
          'https://web.dev/discoverable/',
          'https://developers.google.com/search/docs'
        ]
      })
    }

    return {
      score,
      contentIssues: [],
      technicalIssues: [],
      recommendations
    }
  }
}
