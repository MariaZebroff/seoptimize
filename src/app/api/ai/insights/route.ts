import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/aiService'
import { 
  generateFallbackInsights, 
  generateFallbackContentSuggestions, 
  generateFallbackKeywordSuggestions 
} from '@/lib/fallbackInsights'

export async function POST(request: NextRequest) {
  try {
    const { auditResults, url, currentContent, targetKeywords, industry } = await request.json()

    // Validate required fields
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Check if API key is available
    if (!AIService.isApiKeyAvailable()) {
      console.log('AI API key not available, using fallback insights')
      // Use fallback insights when AI is not available
      const insights = generateFallbackInsights(auditResults, url)
      const contentSuggestions = currentContent ? generateFallbackContentSuggestions(currentContent, url) : []
      const keywordSuggestions = generateFallbackKeywordSuggestions(url, industry)
      
      return NextResponse.json({
        seoInsights: insights,
        contentSuggestions,
        contentAnalysis: null,
        keywordSuggestions,
        isFallback: true
      })
    }

    try {
      // Generate SEO insights
      const insights = await AIService.generateSEOInsights(auditResults, url)

      // Generate content suggestions if content is available
      let contentSuggestions = []
      let contentAnalysis = null
      if (currentContent) {
        contentSuggestions = await AIService.generateContentSuggestions(currentContent, url, targetKeywords)
        contentAnalysis = await AIService.analyzeContentQuality(currentContent, url)
      }

      // Generate keyword suggestions
      const keywordSuggestions = await AIService.generateKeywordSuggestions(url, targetKeywords, industry)

      return NextResponse.json({
        seoInsights: insights,
        contentSuggestions,
        contentAnalysis,
        keywordSuggestions,
        isFallback: false
      })
    } catch (aiError) {
      console.error('AI service failed, using fallback:', aiError)
      // Use fallback insights when AI service fails
      const insights = generateFallbackInsights(auditResults, url)
      const contentSuggestions = currentContent ? generateFallbackContentSuggestions(currentContent, url) : []
      const keywordSuggestions = generateFallbackKeywordSuggestions(url, industry)
      
      return NextResponse.json({
        seoInsights: insights,
        contentSuggestions,
        contentAnalysis: null,
        keywordSuggestions,
        isFallback: true
      })
    }

  } catch (error) {
    console.error('Error generating AI insights:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate AI insights' },
      { status: 500 }
    )
  }
}
