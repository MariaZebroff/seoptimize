export interface ContentQualityMetrics {
  // Readability Scores
  fleschKincaidGrade: number
  fleschReadingEase: number
  gunningFogIndex: number
  smogIndex: number
  averageWordsPerSentence: number
  averageSyllablesPerWord: number
  
  // Content Structure
  headingHierarchy: {
    h1Count: number
    h2Count: number
    h3Count: number
    h4Count: number
    h5Count: number
    h6Count: number
    hasProperHierarchy: boolean
    missingHeadings: string[]
  }
  
  // Content Depth & Quality
  wordCount: number
  paragraphCount: number
  sentenceCount: number
  averageWordsPerParagraph: number
  contentDensity: {
    textToHtmlRatio: number
    contentToNavigationRatio: number
  }
  
  // Language Analysis
  uniqueWords: number
  vocabularyDiversity: number
  passiveVoicePercentage: number
  averageWordLength: number
  
  // SEO Content Factors
  keywordDensity: { [key: string]: number }
  keywordFrequency: { [key: string]: number }
  contentLengthScore: number
  readabilityScore: number
  structureScore: number
  
  // Recommendations
  recommendations: ContentRecommendation[]
  overallScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface ContentRecommendation {
  type: 'readability' | 'structure' | 'seo' | 'quality'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  effort: 'easy' | 'medium' | 'hard'
}

export class ContentQualityAnalyzer {
  static analyze(htmlContent: string, url: string): ContentQualityMetrics {
    console.log('🔍 Starting content quality analysis...')
    
    // Extract text content from HTML
    const textContent = this.extractTextContent(htmlContent)
    const sentences = this.extractSentences(textContent)
    const words = this.extractWords(textContent)
    const paragraphs = this.extractParagraphs(textContent)
    
    // Calculate readability metrics
    const readabilityMetrics = this.calculateReadabilityMetrics(textContent, sentences, words)
    
    // Analyze content structure
    const structureMetrics = this.analyzeContentStructure(htmlContent)
    
    // Analyze content depth and quality
    const depthMetrics = this.analyzeContentDepth(textContent, sentences, words, paragraphs)
    
    // Analyze language quality
    const languageMetrics = this.analyzeLanguageQuality(textContent, words)
    
    // Analyze SEO content factors
    const seoMetrics = this.analyzeSEOContentFactors(textContent, words, htmlContent)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(readabilityMetrics, structureMetrics, depthMetrics, languageMetrics, seoMetrics)
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(readabilityMetrics, structureMetrics, depthMetrics, languageMetrics, seoMetrics)
    const grade = this.calculateGrade(overallScore)
    
    console.log('✅ Content quality analysis completed')
    
    return {
      ...readabilityMetrics,
      ...structureMetrics,
      ...depthMetrics,
      ...languageMetrics,
      ...seoMetrics,
      recommendations,
      overallScore,
      grade
    }
  }
  
  private static extractTextContent(html: string): string {
    // Remove script and style elements
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    
    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, ' ')
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim()
    
    return text
  }
  
  private static extractSentences(text: string): string[] {
    // Split by sentence endings, but be careful with abbreviations
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    return sentences.map(s => s.trim())
  }
  
  private static extractWords(text: string): string[] {
    // Extract words, removing punctuation
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || []
    return words
  }
  
  private static extractParagraphs(text: string): string[] {
    // Split by double line breaks or paragraph tags
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    return paragraphs.map(p => p.trim())
  }
  
  private static calculateReadabilityMetrics(text: string, sentences: string[], words: string[]) {
    const sentenceCount = sentences.length
    const wordCount = words.length
    const syllableCount = words.reduce((total, word) => total + this.countSyllables(word), 0)
    
    const averageWordsPerSentence = wordCount / sentenceCount || 0
    const averageSyllablesPerWord = syllableCount / wordCount || 0
    
    // Flesch Reading Ease Score
    const fleschReadingEase = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord)
    
    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade = (0.39 * averageWordsPerSentence) + (11.8 * averageSyllablesPerWord) - 15.59
    
    // Gunning Fog Index
    const complexWords = words.filter(word => this.countSyllables(word) >= 3).length
    const gunningFogIndex = 0.4 * (averageWordsPerSentence + (100 * complexWords / wordCount))
    
    // SMOG Index
    const smogIndex = 1.043 * Math.sqrt(complexWords * (30 / sentenceCount)) + 3.1291
    
    // Calculate readability score (0-100)
    const readabilityScore = Math.max(0, Math.min(100, fleschReadingEase))
    
    return {
      fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
      fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
      gunningFogIndex: Math.round(gunningFogIndex * 10) / 10,
      smogIndex: Math.round(smogIndex * 10) / 10,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
      averageSyllablesPerWord: Math.round(averageSyllablesPerWord * 10) / 10,
      readabilityScore: Math.round(readabilityScore)
    }
  }
  
  private static countSyllables(word: string): number {
    if (!word) return 0
    
    // Remove common suffixes that don't add syllables
    word = word.toLowerCase().replace(/[^a-z]/g, '')
    
    if (word.length <= 3) return 1
    
    // Count vowel groups
    const vowels = 'aeiouy'
    let syllableCount = 0
    let previousWasVowel = false
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i])
      if (isVowel && !previousWasVowel) {
        syllableCount++
      }
      previousWasVowel = isVowel
    }
    
    // Handle silent 'e'
    if (word.endsWith('e') && syllableCount > 1) {
      syllableCount--
    }
    
    // Handle 'le' endings
    if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) {
      syllableCount++
    }
    
    return Math.max(1, syllableCount)
  }
  
  private static analyzeContentStructure(html: string) {
    const headingMatches = {
      h1: (html.match(/<h1[^>]*>/gi) || []).length,
      h2: (html.match(/<h2[^>]*>/gi) || []).length,
      h3: (html.match(/<h3[^>]*>/gi) || []).length,
      h4: (html.match(/<h4[^>]*>/gi) || []).length,
      h5: (html.match(/<h5[^>]*>/gi) || []).length,
      h6: (html.match(/<h6[^>]*>/gi) || []).length
    }
    
    const hasProperHierarchy = headingMatches.h1 > 0 && 
      (headingMatches.h2 > 0 || headingMatches.h3 > 0)
    
    const missingHeadings: string[] = []
    if (headingMatches.h1 === 0) missingHeadings.push('H1')
    if (headingMatches.h1 > 1) missingHeadings.push('Multiple H1 tags')
    if (headingMatches.h2 === 0 && headingMatches.h3 === 0) missingHeadings.push('H2 or H3 subheadings')
    
    // Calculate structure score
    let structureScore = 0
    if (headingMatches.h1 === 1) structureScore += 30
    if (headingMatches.h1 <= 1) structureScore += 20
    if (headingMatches.h2 > 0) structureScore += 25
    if (headingMatches.h3 > 0) structureScore += 15
    if (hasProperHierarchy) structureScore += 10
    
    return {
      headingHierarchy: {
        h1Count: headingMatches.h1,
        h2Count: headingMatches.h2,
        h3Count: headingMatches.h3,
        h4Count: headingMatches.h4,
        h5Count: headingMatches.h5,
        h6Count: headingMatches.h6,
        hasProperHierarchy,
        missingHeadings
      },
      structureScore: Math.min(100, structureScore)
    }
  }
  
  private static analyzeContentDepth(text: string, sentences: string[], words: string[], paragraphs: string[]) {
    const wordCount = words.length
    const sentenceCount = sentences.length
    const paragraphCount = paragraphs.length
    
    const averageWordsPerParagraph = wordCount / paragraphCount || 0
    
    // Calculate content density
    const htmlLength = text.length
    const textToHtmlRatio = (text.length / htmlLength) * 100 || 0
    
    // Estimate navigation vs content (rough approximation)
    const navigationKeywords = ['menu', 'nav', 'header', 'footer', 'sidebar']
    const navigationWords = words.filter(word => navigationKeywords.includes(word)).length
    const contentToNavigationRatio = ((wordCount - navigationWords) / wordCount) * 100 || 0
    
    // Calculate content length score
    let contentLengthScore = 0
    if (wordCount >= 300) contentLengthScore += 20
    if (wordCount >= 600) contentLengthScore += 20
    if (wordCount >= 1000) contentLengthScore += 20
    if (wordCount >= 1500) contentLengthScore += 20
    if (wordCount >= 2000) contentLengthScore += 20
    
    return {
      wordCount,
      paragraphCount,
      sentenceCount,
      averageWordsPerParagraph: Math.round(averageWordsPerParagraph * 10) / 10,
      contentDensity: {
        textToHtmlRatio: Math.round(textToHtmlRatio * 10) / 10,
        contentToNavigationRatio: Math.round(contentToNavigationRatio * 10) / 10
      },
      contentLengthScore: Math.min(100, contentLengthScore)
    }
  }
  
  private static analyzeLanguageQuality(text: string, words: string[]) {
    const uniqueWords = new Set(words).size
    const vocabularyDiversity = (uniqueWords / words.length) * 100 || 0
    
    // Estimate passive voice (simplified approach)
    const passiveIndicators = ['was', 'were', 'been', 'being', 'have been', 'has been', 'had been']
    const passiveCount = passiveIndicators.reduce((count, indicator) => {
      const regex = new RegExp(`\\b${indicator}\\b`, 'gi')
      const matches = text.match(regex) || []
      return count + matches.length
    }, 0)
    
    const passiveVoicePercentage = (passiveCount / words.length) * 100 || 0
    
    const averageWordLength = words.reduce((total, word) => total + word.length, 0) / words.length || 0
    
    return {
      uniqueWords,
      vocabularyDiversity: Math.round(vocabularyDiversity * 10) / 10,
      passiveVoicePercentage: Math.round(passiveVoicePercentage * 10) / 10,
      averageWordLength: Math.round(averageWordLength * 10) / 10
    }
  }
  
  private static analyzeSEOContentFactors(text: string, words: string[], html: string) {
    // Extract potential keywords (most frequent words, excluding common words)
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'])
    
    const wordFrequency: { [key: string]: number } = {}
    words.forEach(word => {
      if (word.length > 3 && !commonWords.has(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1
      }
    })
    
    // Get top keywords
    const sortedKeywords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
    
    const keywordDensity: { [key: string]: number } = {}
    const keywordFrequency: { [key: string]: number } = {}
    
    sortedKeywords.forEach(([word, count]) => {
      keywordDensity[word] = (count / words.length) * 100
      keywordFrequency[word] = count
    })
    
    return {
      keywordDensity,
      keywordFrequency
    }
  }
  
  private static generateRecommendations(
    readability: any,
    structure: any,
    depth: any,
    language: any,
    seo: any
  ): ContentRecommendation[] {
    const recommendations: ContentRecommendation[] = []
    
    // Readability recommendations
    if (readability.fleschReadingEase < 60) {
      recommendations.push({
        type: 'readability',
        priority: 'high',
        title: 'Improve Readability',
        description: `Your content has a Flesch Reading Ease score of ${readability.fleschReadingEase}. Aim for 60-70 for general audiences.`,
        impact: 'High - Better user engagement and comprehension',
        effort: 'medium'
      })
    }
    
    if (readability.averageWordsPerSentence > 20) {
      recommendations.push({
        type: 'readability',
        priority: 'medium',
        title: 'Shorten Sentences',
        description: `Average sentence length is ${readability.averageWordsPerSentence} words. Try to keep sentences under 20 words.`,
        impact: 'Medium - Improved readability',
        effort: 'easy'
      })
    }
    
    // Structure recommendations
    if (structure.headingHierarchy.h1Count === 0) {
      recommendations.push({
        type: 'structure',
        priority: 'high',
        title: 'Add H1 Heading',
        description: 'Your page is missing an H1 heading, which is essential for SEO and accessibility.',
        impact: 'High - Better SEO and page structure',
        effort: 'easy'
      })
    }
    
    if (structure.headingHierarchy.h1Count > 1) {
      recommendations.push({
        type: 'structure',
        priority: 'high',
        title: 'Use Single H1 Heading',
        description: 'You have multiple H1 headings. Use only one H1 per page for better SEO.',
        impact: 'High - Improved SEO structure',
        effort: 'easy'
      })
    }
    
    if (!structure.headingHierarchy.hasProperHierarchy) {
      recommendations.push({
        type: 'structure',
        priority: 'medium',
        title: 'Improve Heading Hierarchy',
        description: 'Add H2 and H3 subheadings to better organize your content.',
        impact: 'Medium - Better content organization',
        effort: 'medium'
      })
    }
    
    // Content depth recommendations
    if (depth.wordCount < 300) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        title: 'Expand Content',
        description: `Your content has only ${depth.wordCount} words. Aim for at least 300 words for better SEO.`,
        impact: 'High - Better SEO and user value',
        effort: 'hard'
      })
    }
    
    if (depth.averageWordsPerParagraph > 150) {
      recommendations.push({
        type: 'quality',
        priority: 'medium',
        title: 'Break Up Long Paragraphs',
        description: `Average paragraph length is ${depth.averageWordsPerParagraph} words. Keep paragraphs under 150 words.`,
        impact: 'Medium - Better readability',
        effort: 'easy'
      })
    }
    
    // Language quality recommendations
    if (language.passiveVoicePercentage > 15) {
      recommendations.push({
        type: 'quality',
        priority: 'low',
        title: 'Reduce Passive Voice',
        description: `${language.passiveVoicePercentage}% of your content uses passive voice. Aim for under 15%.`,
        impact: 'Low - Slightly improved readability',
        effort: 'medium'
      })
    }
    
    if (language.vocabularyDiversity < 30) {
      recommendations.push({
        type: 'quality',
        priority: 'low',
        title: 'Increase Vocabulary Diversity',
        description: `Your vocabulary diversity is ${language.vocabularyDiversity}%. Try using more varied word choices.`,
        impact: 'Low - More engaging content',
        effort: 'hard'
      })
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
  
  private static calculateOverallScore(
    readability: any,
    structure: any,
    depth: any,
    language: any,
    seo: any
  ): number {
    // Weighted scoring
    const weights = {
      readability: 0.3,
      structure: 0.25,
      contentLength: 0.2,
      language: 0.15,
      seo: 0.1
    }
    
    const scores = {
      readability: readability.readabilityScore,
      structure: structure.structureScore,
      contentLength: depth.contentLengthScore,
      language: Math.max(0, 100 - (language.passiveVoicePercentage * 2)),
      seo: 50 // Base score for SEO factors
    }
    
    const overallScore = 
      (scores.readability * weights.readability) +
      (scores.structure * weights.structure) +
      (scores.contentLength * weights.contentLength) +
      (scores.language * weights.language) +
      (scores.seo * weights.seo)
    
    return Math.round(overallScore)
  }
  
  private static calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }
}


