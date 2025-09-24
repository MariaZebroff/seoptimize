import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get user from request
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pageUrls = searchParams.get('pageUrls')
    
    if (!pageUrls) {
      return NextResponse.json({ error: 'pageUrls parameter is required' }, { status: 400 })
    }

    const urls = JSON.parse(pageUrls)
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD format
    
    // Fetch page audit usage for the specified URLs
    const { data, error } = await supabase
      .from('page_audit_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('last_audit_date', today)
      .in('page_url', urls)

    if (error) {
      console.error('Error fetching page audit usage:', error)
      return NextResponse.json({ error: 'Failed to fetch page audit usage' }, { status: 500 })
    }

    // Create a map of existing usage
    const usageMap = new Map()
    data?.forEach(usage => {
      usageMap.set(usage.page_url, usage)
    })

    // Create status for each page URL
    const pageStatuses = urls.map((url: string) => {
      const usage = usageMap.get(url)
      const auditCount = usage?.audit_count || 0
      const maxAudits = 2 // Basic Plan limit
      const remainingAudits = Math.max(0, maxAudits - auditCount)
      const canAudit = auditCount < maxAudits
      const status = auditCount === 0 ? 'no_usage' : canAudit ? 'available' : 'limit_reached'

      return {
        pageUrl: url,
        auditCount,
        maxAudits,
        remainingAudits,
        canAudit,
        status
      }
    })

    return NextResponse.json({ pageStatuses })
  } catch (error) {
    console.error('Error in page audit usage API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get user from request
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { pageUrl } = body
    
    if (!pageUrl) {
      return NextResponse.json({ error: 'pageUrl is required' }, { status: 400 })
    }

    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD format
    
    // First, try to get existing record
    const { data: existingRecord, error: fetchError } = await supabase
      .from('page_audit_usage')
      .select('audit_count')
      .eq('user_id', user.id)
      .eq('page_url', pageUrl)
      .eq('last_audit_date', today)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing page audit usage:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch existing usage' }, { status: 500 })
    }

    let error
    if (existingRecord) {
      // Update existing record by incrementing audit count
      const { error: updateError } = await supabase
        .from('page_audit_usage')
        .update({
          audit_count: existingRecord.audit_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('page_url', pageUrl)
        .eq('last_audit_date', today)
      
      error = updateError
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('page_audit_usage')
        .insert({
          user_id: user.id,
          page_url: pageUrl,
          audit_count: 1,
          last_audit_date: today,
          updated_at: new Date().toISOString()
        })
      
      error = insertError
    }

    if (error) {
      console.error('Error recording page audit usage:', error)
      return NextResponse.json({ error: 'Failed to record page audit usage' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in page audit usage API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
