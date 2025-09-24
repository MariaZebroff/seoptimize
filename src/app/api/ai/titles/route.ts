import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/aiService'

export async function POST(request: NextRequest) {
  try {
    const { currentTitle, content, targetKeywords, count, forceKeywords } = await request.json()

    // Validate required fields
    if (!currentTitle || !content) {
      return NextResponse.json({ error: 'Current title and content are required' }, { status: 400 })
    }

    // Check if API key is available
    if (!AIService.isApiKeyAvailable()) {
      return NextResponse.json({ 
        error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.',
        isFallback: true 
      }, { status: 400 })
    }

    try {
      // Generate title suggestions
      const titles = await AIService.generateTitleSuggestions(
        currentTitle,
        content,
        targetKeywords || [],
        count || 5,
        forceKeywords || false
      )

      return NextResponse.json({
        titles,
        isFallback: false
      })
    } catch (aiError) {
      console.error('AI service failed for title generation:', aiError)
      
      // Return fallback titles when AI service fails
      const fallbackTitles = [
        `${currentTitle} - Optimized for SEO`,
        `Best ${currentTitle} Solutions`,
        `${currentTitle} - Expert Guide`,
        `Professional ${currentTitle} Services`,
        `${currentTitle} - Complete Overview`
      ]

      return NextResponse.json({
        titles: fallbackTitles,
        isFallback: true
      })
    }

  } catch (error) {
    console.error('Error generating title suggestions:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate title suggestions' },
      { status: 500 }
    )
  }
}
