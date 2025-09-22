import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/aiService'

export async function POST(request: NextRequest) {
  try {
    const { url, currentKeywords, industry } = await request.json()

    // Validate required fields
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Check if API key is available
    if (!AIService.isApiKeyAvailable()) {
      return NextResponse.json({ 
        error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.',
        isFallback: true 
      }, { status: 400 })
    }

    try {
      // Generate keyword suggestions
      const keywords = await AIService.generateKeywordSuggestions(
        url,
        currentKeywords || [],
        industry || 'general'
      )


      return NextResponse.json({
        keywords,
        isFallback: false
      })
    } catch (aiError) {
      console.error('AI service failed for keyword generation:', aiError)
      
      // Return fallback keywords when AI service fails
      const fallbackKeywords = [
        {
          keyword: 'business solutions',
          searchVolume: 'high' as const,
          competition: 'medium' as const,
          relevance: 85,
          suggestions: ['business consulting', 'enterprise solutions', 'corporate services'],
          reasoning: 'High search volume with medium competition makes this a valuable keyword for business-focused content.'
        },
        {
          keyword: 'professional services',
          searchVolume: 'medium' as const,
          competition: 'low' as const,
          relevance: 90,
          suggestions: ['expert services', 'consulting services', 'professional consulting'],
          reasoning: 'Medium search volume with low competition provides excellent opportunity for ranking.'
        },
        {
          keyword: 'expert consultation',
          searchVolume: 'low' as const,
          competition: 'low' as const,
          relevance: 88,
          suggestions: ['expert advice', 'professional guidance', 'consultation services'],
          reasoning: 'Low competition niche keyword with high relevance for specialized services.'
        }
      ]

      return NextResponse.json({
        keywords: fallbackKeywords,
        isFallback: true
      })
    }

  } catch (error) {
    console.error('Error generating keyword suggestions:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate keyword suggestions' },
      { status: 500 }
    )
  }
}
