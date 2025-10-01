import { NextRequest, NextResponse } from 'next/server'
import { saveAuditResultServer } from '@/lib/supabaseServer'
import { HttpAuditService } from '@/lib/httpAuditService'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    console.log('=== TESTING SAVE WITH ACTUAL AUDIT RESULT ===')
    console.log('User ID:', userId)
    
    // Get a real audit result from the HTTP service
    const httpService = new HttpAuditService()
    const auditResult = await httpService.auditWebsite('https://www.cisco.com/')
    
    console.log('Audit result status:', auditResult.status)
    console.log('Audit result keys:', Object.keys(auditResult))
    
    if (auditResult.status !== 'success') {
      return NextResponse.json({ 
        error: 'Audit failed',
        details: auditResult.error || 'Unknown error'
      }, { status: 500 })
    }
    
    console.log('Attempting to save real audit result...')
    const { data: savedAudit, error: saveError } = await saveAuditResultServer(auditResult, undefined, userId)
    
    if (saveError) {
      console.error('Save error:', saveError)
      return NextResponse.json({ 
        error: 'Failed to save audit',
        details: saveError.message,
        code: saveError.code,
        auditResultSample: {
          status: auditResult.status,
          title: auditResult.title,
          imagesMissingAlt: auditResult.imagesMissingAlt,
          imagesWithoutAlt: auditResult.imagesWithoutAlt,
          brokenLinks: auditResult.brokenLinks
        }
      }, { status: 500 })
    }
    
    console.log('Real audit saved successfully:', savedAudit?.id)
    
    return NextResponse.json({
      success: true,
      savedAuditId: savedAudit?.id,
      message: 'Real audit result saved successfully'
    })
  } catch (error) {
    console.error('Test save real audit error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



