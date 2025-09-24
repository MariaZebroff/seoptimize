import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/aiService'

export async function POST(request: NextRequest) {
  try {
    const { title, content, targetKeywords, count, forceKeywords, includeCTA } = await request.json()

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Check if API key is available
    if (!AIService.isApiKeyAvailable()) {
      return NextResponse.json({ 
        error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.',
        isFallback: true 
      }, { status: 400 })
    }

    try {
      // Generate meta descriptions
      const descriptions = await AIService.generateMetaDescriptions(
        title,
        content,
        targetKeywords || [],
        count || 3,
        forceKeywords || false,
        includeCTA || false
      )

      return NextResponse.json({
        descriptions,
        isFallback: false
      })
    } catch (aiError) {
      console.error('AI service failed for meta description generation:', aiError)
      
      // Return fallback meta descriptions when AI service fails
      const fallbackDescriptions = [
        `Discover ${title} solutions and services. Expert guidance and professional support for your business needs.`,
        `Learn about ${title} with our comprehensive guide. Get expert insights and actionable recommendations.`,
        `Find the best ${title} options for your business. Professional services and expert consultation available.`
      ]

      return NextResponse.json({
        descriptions: fallbackDescriptions,
        isFallback: true
      })
    }

  } catch (error) {
    console.error('Error generating meta descriptions:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate meta descriptions' },
      { status: 500 }
    )
  }
}
