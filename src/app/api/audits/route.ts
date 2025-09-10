import { NextRequest, NextResponse } from 'next/server'
import { getAuditHistory } from '@/lib/supabaseAuth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const { data, error } = await getAuditHistory(siteId || undefined, limit)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Audits API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit history' },
      { status: 500 }
    )
  }
}
