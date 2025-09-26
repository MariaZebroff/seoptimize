import { NextRequest, NextResponse } from 'next/server'
import { saveAuditResultServer } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    console.log('=== TESTING SAVE WITH REAL AUDIT RESULT ===')
    console.log('User ID:', userId)
    
    // Create a realistic audit result that matches what the audit API would generate
    const realAuditResult = {
      url: 'https://test-real-audit.com',
      title: 'Test Real Audit',
      metaDescription: 'Test Real Description',
      h1Tags: ['Test H1'],
      h2Tags: ['Test H2'],
      h3Tags: [],
      h4Tags: [],
      h5Tags: [],
      h6Tags: [],
      titleWordCount: 3,
      metaDescriptionWordCount: 3,
      h1WordCount: 2,
      h2WordCount: 2,
      h3WordCount: 0,
      h4WordCount: 0,
      h5WordCount: 0,
      h6WordCount: 0,
      imagesWithoutAlt: [],
      imagesWithAlt: [],
      totalImages: 0,
      internalLinks: [],
      externalLinks: [],
      totalLinks: 0,
      imagesMissingAlt: null,
      internalLinkCount: 0,
      externalLinkCount: 0,
      headingStructure: null,
      brokenLinks: null,
      brokenLinkDetails: null,
      brokenLinkSummary: null,
      mobileScore: 95,
      performanceScore: 90,
      accessibilityScore: 85,
      seoScore: 80,
      bestPracticesScore: 75,
      status: 'success',
      timestamp: new Date().toISOString(),
      enhancedSEOAnalysis: null,
      contentQualityAnalysis: null,
      psiResults: null,
      accessibilityIssues: null,
      accessibilityRecommendations: null,
      accessibilityAudit: null,
      bestPracticesIssues: null,
      bestPracticesRecommendations: null,
      bestPracticesAudit: null,
      fcpScore: null,
      lcpScore: null,
      clsScore: null,
      fidScore: null,
      loadTime: null,
      performanceMetrics: null
    }
    
    console.log('Attempting to save realistic audit result...')
    const { data: savedAudit, error: saveError } = await saveAuditResultServer(realAuditResult, undefined, userId)
    
    if (saveError) {
      console.error('Save error:', saveError)
      return NextResponse.json({ 
        error: 'Failed to save audit',
        details: saveError.message,
        code: saveError.code 
      }, { status: 500 })
    }
    
    console.log('Audit saved successfully:', savedAudit?.id)
    
    return NextResponse.json({
      success: true,
      savedAuditId: savedAudit?.id,
      message: 'Realistic audit saved successfully'
    })
  } catch (error) {
    console.error('Test save realistic audit error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
