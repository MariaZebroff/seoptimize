import OpenAI from 'openai'

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null

const getOpenAIClient = (): OpenAI => {
  if (!openai) {
    let apiKey: string | undefined
    
    if (typeof window !== 'undefined') {
      // Client-side: only use NEXT_PUBLIC_ variables
      apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    } else {
      // Server-side: prefer OPENAI_API_KEY, fallback to NEXT_PUBLIC_
      apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    }
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.')
    }
    
    openai = new OpenAI({
      apiKey: apiKey,
    })
  }
  return openai
}

export interface AIContentSuggestion {
  type: 'title' | 'meta-description' | 'heading' | 'content' | 'keyword'
  original: string
  suggestion: string
  reasoning: string
  impact: 'high' | 'medium' | 'low'
  effort: 'easy' | 'medium' | 'hard'
}

export interface AIKeywordSuggestion {
  keyword: string
  searchVolume: 'high' | 'medium' | 'low'
  competition: 'high' | 'medium' | 'low'
  relevance: number
  suggestions: string[]
  reasoning: string
}

export interface AICompetitorInsight {
  competitor: string
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  recommendations: string[]
}

export interface AISEOInsight {
  overallScore: number
  keyStrengths: string[]
  criticalIssues: string[]
  quickWins: string[]
  longTermStrategy: string[]
  predictedImpact: {
    traffic: number
    rankings: number
    conversions: number
  }
}

export interface AIContentAnalysis {
  readability: {
    score: number
    grade: string
    suggestions: string[]
  }
  seoOptimization: {
    score: number
    suggestions: string[]
  }
  engagement: {
    score: number
    suggestions: string[]
  }
  overallRecommendations: string[]
}

export class AIService {
  /**
   * Clean and parse JSON response from AI
   */
  private static cleanAndParseJSON(content: string): any {
    let cleanedContent = content.trim()
    
    // Check if the response contains error messages or apologies
    if (cleanedContent.toLowerCase().includes('apologies') || 
        cleanedContent.toLowerCase().includes('sorry') ||
        cleanedContent.toLowerCase().includes('error') ||
        cleanedContent.toLowerCase().includes('cannot')) {
      throw new Error('AI returned an error message instead of JSON')
    }
    
    // Remove any markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    // Additional cleanup for common JSON issues
    cleanedContent = cleanedContent
      .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
      .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space

    // Check if it's already a valid JSON array
    if (cleanedContent.startsWith('[') && cleanedContent.endsWith(']')) {
      // Already a JSON array, don't modify
    } else if (cleanedContent.includes('}, {')) {
      // Multiple JSON objects without array brackets - wrap them
      cleanedContent = '[' + cleanedContent + ']'
    } else {
      // Try to extract JSON from the response if it's embedded in text
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanedContent = jsonMatch[0]
      }
    }

    try {
      return JSON.parse(cleanedContent)
    } catch (parseError) {
      console.error('JSON parsing failed for content:', cleanedContent)
      throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    }
  }

  /**
   * Check if OpenAI API key is available
   */
  static isApiKeyAvailable(): boolean {
    // Check both server-side and client-side environment variables
    if (typeof window !== 'undefined') {
      // Client-side: only check NEXT_PUBLIC_ variables
      return !!process.env.NEXT_PUBLIC_OPENAI_API_KEY
    } else {
      // Server-side: check both
      return !!(process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY)
    }
  }

  /**
   * Get API key error message
   */
  static getApiKeyError(): string {
    return 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.'
  }

  /**
   * Generate AI-powered content suggestions for SEO optimization
   */
  static async generateContentSuggestions(
    currentContent: string,
    url: string,
    targetKeywords: string[] = []
  ): Promise<AIContentSuggestion[]> {
    if (!this.isApiKeyAvailable()) {
      throw new Error(this.getApiKeyError())
    }

    try {
      const client = getOpenAIClient()
      const prompt = `
You are an expert SEO content strategist. Analyze the following website content and provide specific, actionable suggestions to improve SEO performance.

Website URL: ${url}
Current Content: ${currentContent.substring(0, 2000)}...
Target Keywords: ${targetKeywords.join(', ')}

Please provide suggestions for:
1. Title tag optimization (50-60 characters)
2. Meta description optimization (150-160 characters)
3. Heading structure improvements
4. Content optimization for better SEO

For each suggestion, provide:
- The original text
- Your improved version
- Clear reasoning for the change
- Impact level (high/medium/low)
- Implementation effort (easy/medium/hard)

Format your response as a JSON array with the following structure:
[
  {
    "type": "title|meta-description|heading|content|keyword",
    "original": "current text",
    "suggestion": "improved text",
    "reasoning": "why this change helps SEO",
    "impact": "high|medium|low",
    "effort": "easy|medium|hard"
  }
]

Focus on practical, implementable suggestions that will genuinely improve search rankings and user experience.
`

      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO strategist with 10+ years of experience. Provide practical, actionable suggestions that improve search rankings and user experience.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) throw new Error('No response from AI')

      // Parse JSON response
      const suggestions = this.cleanAndParseJSON(responseContent)
      return suggestions as AIContentSuggestion[]

    } catch (error) {
      console.error('Error generating AI content suggestions:', error)
      throw new Error('Failed to generate AI content suggestions')
    }
  }

  /**
   * Generate AI-powered keyword suggestions
   */
  static async generateKeywordSuggestions(
    url: string,
    currentKeywords: string[],
    industry: string = 'general'
  ): Promise<AIKeywordSuggestion[]> {
    try {
      const prompt = `
You are an expert SEO keyword researcher. Analyze the following website and provide strategic keyword suggestions.

Website URL: ${url}
Current Keywords: ${currentKeywords.join(', ')}
Industry: ${industry}

Please provide 10 strategic keyword suggestions that would be valuable for this website. For each keyword, provide:

1. The keyword phrase
2. Estimated search volume (high/medium/low)
3. Competition level (high/medium/low)
4. Relevance score (1-10)
5. Related keyword variations
6. Strategic reasoning

    IMPORTANT: Return ONLY a valid JSON array. Do not include any text before or after the JSON array. Start with [ and end with ].

    Format your response as a JSON array:
    [
      {
        "keyword": "target keyword phrase",
        "searchVolume": "high|medium|low",
        "competition": "high|medium|low",
        "relevance": 8,
        "suggestions": ["related keyword 1", "related keyword 2"],
        "reasoning": "why this keyword is valuable for this website"
      }
    ]

    Focus on keywords that:
    - Are relevant to the website's content and purpose
    - Have reasonable competition levels
    - Can drive qualified traffic
    - Align with user search intent

    Return ONLY the JSON array, nothing else.
`

      const client = getOpenAIClient()
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO keyword researcher with deep knowledge of search trends and competition analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) throw new Error('No response from AI')

      const suggestions = this.cleanAndParseJSON(responseContent)
      return suggestions as AIKeywordSuggestion[]

    } catch (error) {
      console.error('Error generating AI keyword suggestions:', error)
      throw new Error('Failed to generate AI keyword suggestions')
    }
  }

  /**
   * Generate AI-powered competitor analysis
   */
  static async generateCompetitorAnalysis(
    targetUrl: string,
    competitorUrls: string[]
  ): Promise<AICompetitorInsight[]> {
    try {
      const prompt = `
You are an expert SEO competitive analyst. Analyze the following websites and provide strategic insights.

Target Website: ${targetUrl}
Competitor Websites: ${competitorUrls.join(', ')}

For each competitor, provide:
1. Key strengths they have
2. Areas where they're weak
3. Opportunities for the target website
4. Specific recommendations

Format your response as a JSON array:
[
  {
    "competitor": "competitor domain",
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "opportunities": ["opportunity 1", "opportunity 2"],
    "recommendations": ["recommendation 1", "recommendation 2"]
  }
]

Focus on actionable insights that can help the target website gain competitive advantage.
`

      const client = getOpenAIClient()
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO competitive analyst with deep knowledge of digital marketing strategies and market positioning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) throw new Error('No response from AI')

      const insights = this.cleanAndParseJSON(responseContent)
      return insights as AICompetitorInsight[]

    } catch (error) {
      console.error('Error generating AI competitor analysis:', error)
      throw new Error('Failed to generate AI competitor analysis')
    }
  }

  /**
   * Generate comprehensive SEO insights and strategy
   */
  static async generateSEOInsights(
    auditResults: any,
    url: string
  ): Promise<AISEOInsight> {
    try {
      const prompt = `
You are an expert SEO strategist. Analyze the following audit results and provide comprehensive SEO insights and strategy.

Website URL: ${url}
Audit Results: ${JSON.stringify(auditResults, null, 2)}

Please provide:
1. Overall SEO score (0-100)
2. Key strengths of the website
3. Critical issues that need immediate attention
4. Quick wins that can be implemented easily
5. Long-term strategy recommendations
6. Predicted impact on traffic, rankings, and conversions

Format your response as JSON:
{
  "overallScore": 75,
  "keyStrengths": ["strength 1", "strength 2"],
  "criticalIssues": ["issue 1", "issue 2"],
  "quickWins": ["quick win 1", "quick win 2"],
  "longTermStrategy": ["strategy 1", "strategy 2"],
  "predictedImpact": {
    "traffic": 25,
    "rankings": 15,
    "conversions": 10
  }
}

Provide realistic, data-driven insights that will genuinely help improve SEO performance.
`

      const client = getOpenAIClient()
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO strategist with 15+ years of experience helping businesses improve their search rankings and organic traffic.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) throw new Error('No response from AI')

      const insights = this.cleanAndParseJSON(responseContent)
      return insights as AISEOInsight

    } catch (error) {
      console.error('Error generating AI SEO insights:', error)
      throw new Error('Failed to generate AI SEO insights')
    }
  }

  /**
   * Analyze content quality and provide AI-powered recommendations
   */
  static async analyzeContentQuality(
    content: string,
    url: string,
    targetAudience: string = 'general'
  ): Promise<AIContentAnalysis> {
    try {
      const contentPreview = content.substring(0, 3000)
      const prompt = `
You are an expert content strategist and SEO specialist. Analyze the following content and provide comprehensive quality assessment.

Website URL: ${url}
Target Audience: ${targetAudience}
Content: ${contentPreview}...

Please analyze and provide:
1. Readability assessment (score 0-100, grade A-F, specific suggestions)
2. SEO optimization assessment (score 0-100, specific suggestions)
3. Engagement potential assessment (score 0-100, specific suggestions)
4. Overall recommendations for improvement

Format your response as JSON:
{
  "readability": {
    "score": 75,
    "grade": "B",
    "suggestions": ["suggestion 1", "suggestion 2"]
  },
  "seoOptimization": {
    "score": 80,
    "suggestions": ["suggestion 1", "suggestion 2"]
  },
  "engagement": {
    "score": 70,
    "suggestions": ["suggestion 1", "suggestion 2"]
  },
  "overallRecommendations": ["recommendation 1", "recommendation 2"]
}

Focus on actionable insights that will improve content performance and user engagement.
`

      const client = getOpenAIClient()
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content strategist with deep knowledge of user engagement, SEO best practices, and content marketing.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) throw new Error('No response from AI')

      const analysis = this.cleanAndParseJSON(responseContent)
      return analysis as AIContentAnalysis

    } catch (error) {
      console.error('Error analyzing content quality:', error)
      throw new Error('Failed to analyze content quality')
    }
  }

  /**
   * Generate AI-powered meta descriptions
   */
  static async generateMetaDescriptions(
    title: string,
    content: string,
    targetKeywords: string[],
    count: number = 3
  ): Promise<string[]> {
    try {
      const contentPreview = content.substring(0, 1000)
      const prompt = `
You are an expert SEO copywriter. Generate ${count} compelling meta descriptions for the following content.

Title: ${title}
Content: ${contentPreview}...
Target Keywords: ${targetKeywords.join(', ')}

    Requirements:
    - 150-160 characters each
    - Include target keywords naturally
    - Compelling and click-worthy
    - Include a call-to-action
    - Unique and engaging

    IMPORTANT: Return ONLY a valid JSON array. Do not include any text before or after the JSON array.

    Format as a JSON array of strings:
    ["meta description 1", "meta description 2", "meta description 3"]

    Return ONLY the JSON array, nothing else.
`

      const client = getOpenAIClient()
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO copywriter specializing in compelling meta descriptions that drive clicks and improve search rankings.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })

      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) throw new Error('No response from AI')

      const descriptions = this.cleanAndParseJSON(responseContent)
      return descriptions as string[]

    } catch (error) {
      console.error('Error generating meta descriptions:', error)
      throw new Error('Failed to generate meta descriptions')
    }
  }

  /**
   * Generate AI-powered title suggestions
   */
  static async generateTitleSuggestions(
    currentTitle: string,
    content: string,
    targetKeywords: string[],
    count: number = 5
  ): Promise<string[]> {
    try {
      const contentPreview = content.substring(0, 1000)
      const prompt = `
You are an expert SEO copywriter. Generate ${count} optimized title suggestions for the following content.

Current Title: ${currentTitle}
Content: ${contentPreview}...
Target Keywords: ${targetKeywords.join(', ')}

    Requirements:
    - 50-60 characters each
    - Include target keywords naturally
    - Compelling and click-worthy
    - SEO-optimized
    - Unique variations

    IMPORTANT: Return ONLY a valid JSON array. Do not include any text before or after the JSON array.

    Format as a JSON array of strings:
    ["title 1", "title 2", "title 3", "title 4", "title 5"]

    Return ONLY the JSON array, nothing else.
`

      const client = getOpenAIClient()
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO copywriter specializing in compelling, click-worthy titles that improve search rankings and click-through rates.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })

      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) throw new Error('No response from AI')

      const titles = this.cleanAndParseJSON(responseContent)
      return titles as string[]

    } catch (error) {
      console.error('Error generating title suggestions:', error)
      throw new Error('Failed to generate title suggestions')
    }
  }

  /**
   * Generate competitor analysis comparing current site with competitor
   */
  static async generateCompetitorAnalysis(
    currentUrl: string,
    competitorUrl: string,
    currentAuditData?: any
  ): Promise<{
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    comparison: {
      seoScore: number
      performanceScore: number
      contentQuality: number
      technicalSEO: number
    }
  }> {
    try {
      const currentDomain = new URL(currentUrl).hostname
      const competitorDomain = new URL(competitorUrl).hostname
      
      // Extract only essential data to reduce token usage
      const essentialData = currentAuditData ? {
        title: currentAuditData.title || 'N/A',
        metaDescription: currentAuditData.metaDescription || 'N/A',
        h1Count: currentAuditData.h1Count || 0,
        h2Count: currentAuditData.h2Count || 0,
        h3Count: currentAuditData.h3Count || 0,
        performanceScore: currentAuditData.performanceScore || 0,
        seoScore: currentAuditData.seoScore || 0,
        accessibilityScore: currentAuditData.accessibilityScore || 0,
        bestPracticesScore: currentAuditData.bestPracticesScore || 0,
        mobileScore: currentAuditData.mobileScore || 0,
        brokenLinks: currentAuditData.brokenLinks || 0,
        totalLinks: currentAuditData.totalLinks || 0,
        wordCount: currentAuditData.wordCount || 0,
        readabilityScore: currentAuditData.readabilityScore || 0
      } : null

      const prompt = `
You are an expert SEO analyst. Based on the current page's metrics, provide a strategic competitor analysis comparing your site with ${competitorUrl}.

YOUR SITE: ${currentUrl} (${currentDomain})
YOUR SITE METRICS:
${essentialData ? JSON.stringify(essentialData, null, 2) : 'No audit data available'}

COMPETITOR TO ANALYZE: ${competitorUrl} (${competitorDomain})

Provide a comprehensive competitor analysis that compares your site's performance against this competitor. Focus on:

1. STRENGTHS: What the COMPETITOR likely does well (their advantages)
2. WEAKNESSES: Areas where the COMPETITOR is likely weaker (their disadvantages)
3. OPPORTUNITIES: Strategic gaps that your site can exploit to gain competitive advantage
4. COMPARISON: Estimated scores (0-100) for key metrics comparing competitor vs your site

Base your analysis on:
- Your site's actual performance metrics (SEO: ${essentialData?.seoScore || 'N/A'}, Performance: ${essentialData?.performanceScore || 'N/A'}, etc.)
- Industry best practices and competitive intelligence
- Strategic positioning opportunities

CRITICAL: You MUST return ONLY valid JSON. Do not include any explanatory text, questions, or additional content.

Required JSON format:
{
  "strengths": ["competitor strength 1", "competitor strength 2", "competitor strength 3", "competitor strength 4"],
  "weaknesses": ["competitor weakness 1", "competitor weakness 2", "competitor weakness 3", "competitor weakness 4"],
  "opportunities": ["opportunity for your site 1", "opportunity for your site 2", "opportunity for your site 3", "opportunity for your site 4"],
  "comparison": {
    "seoScore": 85,
    "performanceScore": 72,
    "contentQuality": 78,
    "technicalSEO": 90
  }
}

Return ONLY the JSON object above, nothing else.
`

      const client = getOpenAIClient()
      const response = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO analyst specializing in competitive analysis and strategic SEO recommendations. Provide actionable, data-driven insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) throw new Error('No response from AI')

      const parsed = this.cleanAndParseJSON(responseContent)
      
      // Debug logging
      console.log('AI Response Content:', responseContent)
      console.log('Parsed Response:', parsed)
      console.log('Response Keys:', Object.keys(parsed || {}))
      
      // Handle case where AI returns old format with recommendations
      if (parsed.recommendations) {
        console.log('AI returned old format with recommendations, removing recommendations field')
        delete parsed.recommendations
      }
      
      // Validate the response structure
      if (!parsed.strengths || !parsed.weaknesses || !parsed.opportunities || !parsed.comparison) {
        console.error('Invalid AI response structure:', parsed)
        console.error('Missing fields:', {
          strengths: !!parsed.strengths,
          weaknesses: !!parsed.weaknesses,
          opportunities: !!parsed.opportunities,
          comparison: !!parsed.comparison
        })
        throw new Error('Invalid response structure from AI')
      }

      return parsed

    } catch (error) {
      console.error('Error generating competitor analysis:', error)
      throw new Error('Failed to generate competitor analysis')
    }
  }
}
