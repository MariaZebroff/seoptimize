import { NextRequest, NextResponse } from 'next/server'
import { saveAuditResultServer } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { userId, siteId } = await request.json()
    
    console.log('=== TESTING SAVE AUDIT ===')
    console.log('User ID:', userId)
    console.log('Site ID:', siteId)
    
    // Create a test audit result
    const testAuditResult = {
      url: 'https://test.com',
      title: 'Test Title',
      metaDescription: 'Test Description',
      h1Tags: ['Test H1'],
      h2Tags: ['Test H2'],
      h3Tags: [],
      h4Tags: [],
      h5Tags: [],
      h6Tags: [],
      titleWordCount: 2,
      metaDescriptionWordCount: 2,
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
      status: 'success'
    }
    
    console.log('Attempting to save test audit result...')
    const { data: savedAudit, error: saveError } = await saveAuditResultServer(testAuditResult, siteId, userId)
    
    if (saveError) {
      console.error('Save error:', saveError)
      return NextResponse.json({ 
        error: 'Failed to save audit',
        details: saveError.message 
      }, { status: 500 })
    }
    
    console.log('Audit saved successfully:', savedAudit?.id)
    
    return NextResponse.json({
      success: true,
      savedAuditId: savedAudit?.id,
      message: 'Test audit saved successfully'
    })
  } catch (error) {
    console.error('Test save error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



