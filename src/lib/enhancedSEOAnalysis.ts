export interface SEOAnalysisResult {
  // Basic SEO Data
  title: string
  metaDescription: string
  h1Tags: string[]
  h2Tags: string[]
  h3Tags: string[]
  h4Tags: string[]
  h5Tags: string[]
  h6Tags: string[]
  
  // Character and Word Counts
  titleCharacterCount: number
  titleWordCount: number
  metaDescriptionCharacterCount: number
  metaDescriptionWordCount: number
  contentWordCount: number
  contentCharacterCount: number
  
  // Heading Word Counts
  h1WordCount: number
  h2WordCount: number
  h3WordCount: number
  h4WordCount: number
  h5WordCount: number
  h6WordCount: number
  
  // Advanced SEO Metrics
  keywordDensity: { [key: string]: number }
  headingStructure: {
    h1Count: number
    h2Count: number
    h3Count: number
    h4Count: number
    h5Count: number
    h6Count: number
    totalHeadings: number
    structureScore: number
  }
  
  // Meta Tags Analysis
  metaTags: {
    title: string
    description: string
    keywords: string
    author: string
    robots: string
    viewport: string
    charset: string
    canonical: string
    ogTitle: string
    ogDescription: string
    ogImage: string
    twitterCard: string
    twitterTitle: string
    twitterDescription: string
    twitterImage: string
  }
  
  // Content Analysis
  contentAnalysis: {
    readabilityScore: number
    averageSentenceLength: number
    paragraphCount: number
    listCount: number
    imageCount: number
    videoCount: number
    linkCount: number
    internalLinkCount: number
    externalLinkCount: number
  }
  
  // SEO Suggestions
  suggestions: SEOSuggestion[]
  
  // Overall SEO Score
  seoScore: number
  seoGrade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface SEOSuggestion {
  id: string
  category: 'title' | 'meta' | 'headings' | 'content' | 'images' | 'links' | 'technical'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  currentValue?: string
  recommendedValue?: string
  impact: string
  effort: 'easy' | 'medium' | 'hard'
  steps: string[]
  resources: string[]
}

export class EnhancedSEOAnalysis {
  static analyze(content: string, url: string, extractedData?: any): SEOAnalysisResult {
    const analysis = new EnhancedSEOAnalysis()
    return analysis.performAnalysis(content, url, extractedData)
  }

  private performAnalysis(content: string, url: string, extractedData?: any): SEOAnalysisResult {
    console.log('🔍 Enhanced SEO Analysis: Starting analysis for URL:', url)
    console.log('📄 Content length:', content.length)
    console.log('🔍 Using extracted data:', !!extractedData)
    
    try {
      // Use extracted data if available, otherwise extract from content
      const basicData = extractedData ? this.useExtractedData(extractedData) : this.extractBasicSEOData(content)
      console.log('✅ Basic SEO data extracted:', {
        title: basicData.title,
        metaDescription: basicData.metaDescription,
        h1Count: basicData.h1Tags.length,
        h2Count: basicData.h2Tags.length
      })
      
      // Perform advanced analysis
      const characterCounts = this.analyzeCharacterCounts(basicData)
      const keywordAnalysis = this.analyzeKeywords(basicData, content)
      const headingStructure = this.analyzeHeadingStructure(basicData)
      const metaTags = this.extractMetaTags(content)
      const contentAnalysis = this.analyzeContent(content)
      
      console.log('✅ Advanced analysis completed:', {
        characterCounts,
        keywordCount: Object.keys(keywordAnalysis).length,
        headingStructure,
        metaTagsCount: Object.keys(metaTags).length,
        contentAnalysis
      })
      
      // Generate suggestions
      const suggestions = this.generateSuggestions(basicData, characterCounts, keywordAnalysis, headingStructure, metaTags, contentAnalysis)
      console.log('✅ Suggestions generated:', suggestions.length)
      
      // Calculate overall SEO score
      const seoScore = this.calculateSEOScore(basicData, characterCounts, headingStructure, metaTags, contentAnalysis)
      const seoGrade = this.calculateSEOGrade(seoScore)
      
      console.log('✅ SEO score calculated:', { seoScore, seoGrade })
      
      const result = {
        ...basicData,
        ...characterCounts,
        keywordDensity: keywordAnalysis,
        headingStructure,
        metaTags,
        contentAnalysis,
        suggestions,
        seoScore,
        seoGrade
      }
      
      console.log('✅ Enhanced SEO analysis completed successfully')
      return result
      
    } catch (error) {
      console.error('❌ Enhanced SEO analysis error:', error instanceof Error ? error.message : 'Unknown error')
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  private useExtractedData(extractedData: any) {
    // Use the already extracted data from the main audit process
    return {
      title: extractedData.title || '',
      metaDescription: extractedData.metaDescription || '',
      h1Tags: extractedData.h1Tags || [],
      h2Tags: extractedData.h2Tags || [],
      h3Tags: extractedData.h3Tags || [],
      h4Tags: extractedData.h4Tags || [],
      h5Tags: extractedData.h5Tags || [],
      h6Tags: extractedData.h6Tags || [],
      titleWordCount: extractedData.titleWordCount || 0,
      metaDescriptionWordCount: extractedData.metaDescriptionWordCount || 0,
      h1WordCount: extractedData.h1WordCount || 0,
      h2WordCount: extractedData.h2WordCount || 0,
      h3WordCount: extractedData.h3WordCount || 0,
      h4WordCount: extractedData.h4WordCount || 0,
      h5WordCount: extractedData.h5WordCount || 0,
      h6WordCount: extractedData.h6WordCount || 0
    }
  }

  private extractBasicSEOData(content: string) {
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
    const titleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''
    const titleWordCount = countWords(title)

    // Extract meta description and word count
    const metaDescriptionMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    const metaDescription = metaDescriptionMatch ? metaDescriptionMatch[1].trim() : ''
    const metaDescriptionWordCount = countWords(metaDescription)

    // Extract all heading levels
    const h1Matches = content.match(/<h1[^>]*>(.*?)<\/h1>/gi)
    const h2Matches = content.match(/<h2[^>]*>(.*?)<\/h2>/gi)
    const h3Matches = content.match(/<h3[^>]*>(.*?)<\/h3>/gi)
    const h4Matches = content.match(/<h4[^>]*>(.*?)<\/h4>/gi)
    const h5Matches = content.match(/<h5[^>]*>(.*?)<\/h5>/gi)
    const h6Matches = content.match(/<h6[^>]*>(.*?)<\/h6>/gi)

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
      h6WordCount
    }
  }

  private analyzeCharacterCounts(basicData: any) {
    const titleCharacterCount = basicData.title.length
    const metaDescriptionCharacterCount = basicData.metaDescription.length
    
    // Extract main content (remove HTML tags)
    const contentText = basicData.title + ' ' + basicData.metaDescription + ' ' + 
      [...basicData.h1Tags, ...basicData.h2Tags, ...basicData.h3Tags, 
       ...basicData.h4Tags, ...basicData.h5Tags, ...basicData.h6Tags].join(' ')
    
    const contentWordCount = contentText.trim().split(/\s+/).filter(word => word.length > 0).length
    const contentCharacterCount = contentText.length

    return {
      titleCharacterCount,
      titleWordCount: basicData.titleWordCount,
      metaDescriptionCharacterCount,
      metaDescriptionWordCount: basicData.metaDescriptionWordCount,
      contentWordCount,
      contentCharacterCount,
      h1WordCount: basicData.h1WordCount,
      h2WordCount: basicData.h2WordCount,
      h3WordCount: basicData.h3WordCount,
      h4WordCount: basicData.h4WordCount,
      h5WordCount: basicData.h5WordCount,
      h6WordCount: basicData.h6WordCount
    }
  }

  private analyzeKeywords(basicData: any, content: string) {
    // Extract all text content
    const allText = [
      basicData.title,
      basicData.metaDescription,
      ...basicData.h1Tags,
      ...basicData.h2Tags,
      ...basicData.h3Tags,
      ...basicData.h4Tags,
      ...basicData.h5Tags,
      ...basicData.h6Tags
    ].join(' ').toLowerCase()

    // Remove HTML tags and get clean text
    const cleanText = content.replace(/<[^>]*>/g, ' ').toLowerCase()
    
    // Simple keyword extraction (words longer than 3 characters)
    const words = cleanText.split(/\W+/).filter(word => word.length > 3)
    const wordCount = words.length
    
    const keywordDensity: { [key: string]: number } = {}
    const wordFreq: { [key: string]: number } = {}
    
    // Count word frequency
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    })
    
    // Calculate density for top words
    Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .forEach(([word, count]) => {
        keywordDensity[word] = (count / wordCount) * 100
      })

    return keywordDensity
  }

  private analyzeHeadingStructure(basicData: any) {
    const h1Count = basicData.h1Tags.length
    const h2Count = basicData.h2Tags.length
    const h3Count = basicData.h3Tags.length
    const h4Count = basicData.h4Tags.length
    const h5Count = basicData.h5Tags.length
    const h6Count = basicData.h6Tags.length
    const totalHeadings = h1Count + h2Count + h3Count + h4Count + h5Count + h6Count

    // Calculate structure score (0-100)
    let structureScore = 0
    
    // H1 should be present and unique
    if (h1Count === 1) structureScore += 30
    else if (h1Count > 1) structureScore += 10
    else structureScore += 0
    
    // Good heading hierarchy
    if (h2Count > 0) structureScore += 20
    if (h3Count > 0) structureScore += 15
    if (totalHeadings >= 3 && totalHeadings <= 10) structureScore += 20
    else if (totalHeadings > 10) structureScore += 10
    
    // No skipped heading levels (simplified check)
    if (h1Count > 0 && h2Count > 0) structureScore += 15

    return {
      h1Count,
      h2Count,
      h3Count,
      h4Count,
      h5Count,
      h6Count,
      totalHeadings,
      structureScore
    }
  }

  private extractMetaTags(content: string) {
    const extractMetaContent = (name: string): string => {
      const regex = new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i')
      const match = content.match(regex)
      return match ? match[1].trim() : ''
    }

    return {
      title: extractMetaContent('title'),
      description: extractMetaContent('description'),
      keywords: extractMetaContent('keywords'),
      author: extractMetaContent('author'),
      robots: extractMetaContent('robots'),
      viewport: extractMetaContent('viewport'),
      charset: content.match(/<meta[^>]*charset=["']([^"']*)["'][^>]*>/i)?.[1] || '',
      canonical: content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i)?.[1] || '',
      ogTitle: extractMetaContent('og:title'),
      ogDescription: extractMetaContent('og:description'),
      ogImage: extractMetaContent('og:image'),
      twitterCard: extractMetaContent('twitter:card'),
      twitterTitle: extractMetaContent('twitter:title'),
      twitterDescription: extractMetaContent('twitter:description'),
      twitterImage: extractMetaContent('twitter:image')
    }
  }

  private analyzeContent(content: string) {
    const cleanText = content.replace(/<[^>]*>/g, ' ')
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const paragraphs = content.split(/<\/p>|<br\s*\/?>/i).filter(p => p.trim().length > 0)
    const lists = (content.match(/<[ou]l[^>]*>/gi) || []).length
    const images = (content.match(/<img[^>]*>/gi) || []).length
    const videos = (content.match(/<video[^>]*>/gi) || []).length
    const links = (content.match(/<a[^>]*>/gi) || []).length
    const internalLinks = (content.match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) || []).length
    const externalLinks = links - internalLinks

    const averageSentenceLength = sentences.length > 0 
      ? sentences.reduce((sum, sentence) => sum + sentence.trim().split(/\s+/).length, 0) / sentences.length
      : 0

    // Simple readability score (Flesch-like)
    const words = cleanText.split(/\s+/).filter(w => w.length > 0)
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0)
    const readabilityScore = Math.max(0, Math.min(100, 206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (syllables / words.length))))

    return {
      readabilityScore: Math.round(readabilityScore),
      averageSentenceLength: Math.round(averageSentenceLength * 10) / 10,
      paragraphCount: paragraphs.length,
      listCount: lists,
      imageCount: images,
      videoCount: videos,
      linkCount: links,
      internalLinkCount: internalLinks,
      externalLinkCount: externalLinks
    }
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    const vowels = 'aeiouy'
    let count = 0
    let previousWasVowel = false
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i])
      if (isVowel && !previousWasVowel) {
        count++
      }
      previousWasVowel = isVowel
    }
    
    // Handle silent 'e'
    if (word.endsWith('e')) count--
    
    return Math.max(1, count)
  }

  private generateSuggestions(basicData: any, characterCounts: any, keywordAnalysis: any, headingStructure: any, metaTags: any, contentAnalysis: any): SEOSuggestion[] {
    const suggestions: SEOSuggestion[] = []

    // Title suggestions
    if (characterCounts.titleCharacterCount === 0) {
      suggestions.push({
        id: 'missing-title',
        category: 'title',
        priority: 'high',
        title: 'Add a Page Title',
        description: 'Your page is missing a title tag, which is essential for SEO.',
        currentValue: 'None',
        recommendedValue: 'Descriptive title (50-60 characters)',
        impact: 'Critical for search engine rankings and click-through rates',
        effort: 'easy',
        steps: [
          'Add a <title> tag to your HTML head section',
          'Make it descriptive and include your main keyword',
          'Keep it between 50-60 characters',
          'Make it unique for each page'
        ],
        resources: [
          'https://developers.google.com/search/docs/appearance/title-link',
          'https://moz.com/learn/seo/title-tag'
        ]
      })
    } else if (characterCounts.titleCharacterCount < 30) {
      suggestions.push({
        id: 'title-too-short',
        category: 'title',
        priority: 'medium',
        title: 'Title Too Short',
        description: 'Your title is too short and may not be descriptive enough.',
        currentValue: `${characterCounts.titleCharacterCount} characters`,
        recommendedValue: '50-60 characters',
        impact: 'Longer titles can improve click-through rates and keyword targeting',
        effort: 'easy',
        steps: [
          'Expand your title to be more descriptive',
          'Include relevant keywords naturally',
          'Aim for 50-60 characters',
          'Keep it compelling for users'
        ],
        resources: [
          'https://developers.google.com/search/docs/appearance/title-link'
        ]
      })
    } else if (characterCounts.titleCharacterCount > 60) {
      suggestions.push({
        id: 'title-too-long',
        category: 'title',
        priority: 'medium',
        title: 'Title Too Long',
        description: 'Your title is too long and may be truncated in search results.',
        currentValue: `${characterCounts.titleCharacterCount} characters`,
        recommendedValue: '50-60 characters',
        impact: 'Long titles may be cut off in search results, reducing effectiveness',
        effort: 'easy',
        steps: [
          'Shorten your title to 50-60 characters',
          'Keep the most important keywords at the beginning',
          'Remove unnecessary words',
          'Test how it appears in search results'
        ],
        resources: [
          'https://developers.google.com/search/docs/appearance/title-link'
        ]
      })
    }

    // Meta description suggestions
    if (characterCounts.metaDescriptionCharacterCount === 0) {
      suggestions.push({
        id: 'missing-meta-description',
        category: 'meta',
        priority: 'high',
        title: 'Add Meta Description',
        description: 'Your page is missing a meta description, which affects search result snippets.',
        currentValue: 'None',
        recommendedValue: '150-160 characters',
        impact: 'Meta descriptions appear in search results and influence click-through rates',
        effort: 'easy',
        steps: [
          'Add a meta description tag to your HTML head section',
          'Write a compelling summary of your page content',
          'Include your main keyword naturally',
          'Keep it between 150-160 characters'
        ],
        resources: [
          'https://developers.google.com/search/docs/appearance/snippet',
          'https://moz.com/learn/seo/meta-description'
        ]
      })
    } else if (characterCounts.metaDescriptionCharacterCount < 120) {
      suggestions.push({
        id: 'meta-description-too-short',
        category: 'meta',
        priority: 'medium',
        title: 'Meta Description Too Short',
        description: 'Your meta description is too short and may not be compelling enough.',
        currentValue: `${characterCounts.metaDescriptionCharacterCount} characters`,
        recommendedValue: '150-160 characters',
        impact: 'Longer descriptions can provide more context and improve click-through rates',
        effort: 'easy',
        steps: [
          'Expand your meta description to be more descriptive',
          'Include a call-to-action',
          'Aim for 150-160 characters',
          'Make it compelling for users'
        ],
        resources: [
          'https://developers.google.com/search/docs/appearance/snippet'
        ]
      })
    } else if (characterCounts.metaDescriptionCharacterCount > 160) {
      suggestions.push({
        id: 'meta-description-too-long',
        category: 'meta',
        priority: 'medium',
        title: 'Meta Description Too Long',
        description: 'Your meta description is too long and may be truncated in search results.',
        currentValue: `${characterCounts.metaDescriptionCharacterCount} characters`,
        recommendedValue: '150-160 characters',
        impact: 'Long descriptions may be cut off in search results',
        effort: 'easy',
        steps: [
          'Shorten your meta description to 150-160 characters',
          'Keep the most important information at the beginning',
          'Remove unnecessary words',
          'Test how it appears in search results'
        ],
        resources: [
          'https://developers.google.com/search/docs/appearance/snippet'
        ]
      })
    }

    // Heading structure suggestions
    if (headingStructure.h1Count === 0) {
      suggestions.push({
        id: 'missing-h1',
        category: 'headings',
        priority: 'high',
        title: 'Add H1 Heading',
        description: 'Your page is missing an H1 heading, which is important for SEO structure.',
        currentValue: '0 H1 tags',
        recommendedValue: '1 H1 tag',
        impact: 'H1 tags help search engines understand your page structure and main topic',
        effort: 'easy',
        steps: [
          'Add a single H1 tag to your page',
          'Make it descriptive and include your main keyword',
          'Use it for your main page heading',
          'Ensure it\'s unique on the page'
        ],
        resources: [
          'https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag',
          'https://moz.com/learn/seo/heading-tag'
        ]
      })
    } else if (headingStructure.h1Count > 1) {
      suggestions.push({
        id: 'multiple-h1',
        category: 'headings',
        priority: 'medium',
        title: 'Multiple H1 Headings',
        description: 'Your page has multiple H1 headings, which can confuse search engines.',
        currentValue: `${headingStructure.h1Count} H1 tags`,
        recommendedValue: '1 H1 tag',
        impact: 'Multiple H1s can dilute keyword focus and confuse search engines',
        effort: 'medium',
        steps: [
          'Keep only one H1 tag per page',
          'Convert additional H1s to H2s or H3s',
          'Use H1 for your main page heading only',
          'Maintain proper heading hierarchy'
        ],
        resources: [
          'https://moz.com/learn/seo/heading-tag'
        ]
      })
    }

    if (headingStructure.totalHeadings < 3) {
      suggestions.push({
        id: 'insufficient-headings',
        category: 'headings',
        priority: 'medium',
        title: 'Add More Headings',
        description: 'Your page has very few headings, which can make it harder to scan and understand.',
        currentValue: `${headingStructure.totalHeadings} headings`,
        recommendedValue: '3-10 headings',
        impact: 'More headings improve content structure and user experience',
        effort: 'medium',
        steps: [
          'Add H2 and H3 headings to break up content',
          'Use headings to organize your content logically',
          'Include relevant keywords in headings',
          'Maintain proper heading hierarchy (H1 > H2 > H3)'
        ],
        resources: [
          'https://moz.com/learn/seo/heading-tag'
        ]
      })
    }

    // Content suggestions
    if (contentAnalysis.readabilityScore < 60) {
      suggestions.push({
        id: 'poor-readability',
        category: 'content',
        priority: 'medium',
        title: 'Improve Content Readability',
        description: 'Your content may be difficult to read, which can affect user engagement.',
        currentValue: `Readability score: ${contentAnalysis.readabilityScore}`,
        recommendedValue: 'Readability score: 60+',
        impact: 'Better readability improves user experience and engagement',
        effort: 'medium',
        steps: [
          'Use shorter sentences and paragraphs',
          'Break up long text with headings and lists',
          'Use simpler words where possible',
          'Add bullet points and numbered lists'
        ],
        resources: [
          'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
          'https://readabilityguidelines.co.uk/'
        ]
      })
    }

    if (contentAnalysis.imageCount === 0) {
      suggestions.push({
        id: 'no-images',
        category: 'images',
        priority: 'low',
        title: 'Add Images to Your Content',
        description: 'Your page has no images, which can make it less engaging.',
        currentValue: '0 images',
        recommendedValue: '1-3 relevant images',
        impact: 'Images can improve user engagement and time on page',
        effort: 'medium',
        steps: [
          'Add relevant images to support your content',
          'Use descriptive alt text for accessibility',
          'Optimize images for web (compress, proper format)',
          'Consider using captions for context'
        ],
        resources: [
          'https://developers.google.com/search/docs/crawling-indexing/images',
          'https://web.dev/fast/#optimize-your-images'
        ]
      })
    }

    // Technical SEO suggestions
    if (!metaTags.canonical) {
      suggestions.push({
        id: 'missing-canonical',
        category: 'technical',
        priority: 'medium',
        title: 'Add Canonical URL',
        description: 'Your page is missing a canonical URL, which can help prevent duplicate content issues.',
        currentValue: 'None',
        recommendedValue: 'Canonical URL pointing to preferred version',
        impact: 'Canonical URLs help search engines understand your preferred page version',
        effort: 'easy',
        steps: [
          'Add a canonical link tag to your HTML head section',
          'Point it to the preferred version of your page',
          'Use absolute URLs',
          'Ensure it matches your preferred URL structure'
        ],
        resources: [
          'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls',
          'https://moz.com/learn/seo/canonicalization'
        ]
      })
    }

    if (!metaTags.ogTitle) {
      suggestions.push({
        id: 'missing-og-tags',
        category: 'technical',
        priority: 'low',
        title: 'Add Open Graph Tags',
        description: 'Your page is missing Open Graph tags, which affect how it appears when shared on social media.',
        currentValue: 'None',
        recommendedValue: 'Complete Open Graph meta tags',
        impact: 'Better social media sharing appearance and engagement',
        effort: 'easy',
        steps: [
          'Add og:title, og:description, and og:image meta tags',
          'Use high-quality images for og:image',
          'Keep og:title under 60 characters',
          'Keep og:description under 160 characters'
        ],
        resources: [
          'https://developers.facebook.com/docs/sharing/webmasters',
          'https://ogp.me/'
        ]
      })
    }

    return suggestions
  }

  private calculateSEOScore(basicData: any, characterCounts: any, headingStructure: any, metaTags: any, contentAnalysis: any): number {
    let score = 0

    // Title (20 points)
    if (characterCounts.titleCharacterCount > 0) {
      score += 10
      if (characterCounts.titleCharacterCount >= 30 && characterCounts.titleCharacterCount <= 60) {
        score += 10
      } else if (characterCounts.titleCharacterCount > 0) {
        score += 5
      }
    }

    // Meta description (20 points)
    if (characterCounts.metaDescriptionCharacterCount > 0) {
      score += 10
      if (characterCounts.metaDescriptionCharacterCount >= 120 && characterCounts.metaDescriptionCharacterCount <= 160) {
        score += 10
      } else if (characterCounts.metaDescriptionCharacterCount > 0) {
        score += 5
      }
    }

    // Heading structure (25 points)
    if (headingStructure.h1Count === 1) {
      score += 15
    } else if (headingStructure.h1Count > 0) {
      score += 10
    }
    
    if (headingStructure.totalHeadings >= 3) {
      score += 10
    }

    // Content quality (20 points)
    if (contentAnalysis.readabilityScore >= 60) {
      score += 10
    } else if (contentAnalysis.readabilityScore >= 40) {
      score += 5
    }
    
    if (contentAnalysis.wordCount >= 300) {
      score += 10
    } else if (contentAnalysis.wordCount >= 150) {
      score += 5
    }

    // Technical SEO (15 points)
    if (metaTags.canonical) score += 5
    if (metaTags.ogTitle) score += 5
    if (metaTags.viewport) score += 5

    return Math.min(100, score)
  }

  private calculateSEOGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }
}
