import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { action, daysToKeep } = await request.json()
    
    const supabase = createSupabaseServiceClient()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - (daysToKeep || 30))
    
    let result: any = {}
    
    switch (action) {
      case 'cleanup':
      case 'cleanup_manual':
        // Clean up audits table
        const { data: auditsData, error: auditsError } = await supabase
          .from('audits')
          .delete()
          .lt('created_at', cutoffDate.toISOString())
          .select('id')
        
        if (auditsError) {
          console.error('Audits cleanup error:', auditsError)
        } else {
          result.deleted_audits = auditsData?.length || 0
        }
        
        // Clean up page_audit_usage table
        const { data: pageUsageData, error: pageUsageError } = await supabase
          .from('page_audit_usage')
          .delete()
          .lt('created_at', cutoffDate.toISOString())
          .select('id')
        
        if (pageUsageError) {
          console.error('Page audit usage cleanup error:', pageUsageError)
        } else {
          result.deleted_page_audit_usage = pageUsageData?.length || 0
        }
        
        // Clean up user_usage table (keep last 3 months)
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        const threeMonthsAgoStr = threeMonthsAgo.toISOString().slice(0, 7) // YYYY-MM format
        
        const { data: userUsageData, error: userUsageError } = await supabase
          .from('user_usage')
          .delete()
          .lt('month', threeMonthsAgoStr)
          .select('id')
        
        if (userUsageError) {
          console.error('User usage cleanup error:', userUsageError)
        } else {
          result.deleted_user_usage = userUsageData?.length || 0
        }
        
        // Clean up audit_history table if it exists
        try {
          const { data: auditHistoryData, error: auditHistoryError } = await supabase
            .from('audit_history')
            .delete()
            .lt('created_at', cutoffDate.toISOString())
            .select('id')
          
          if (auditHistoryError) {
            console.error('Audit history cleanup error:', auditHistoryError)
          } else {
            result.deleted_audit_history = auditHistoryData?.length || 0
          }
        } catch (error) {
          // Table might not exist
          result.deleted_audit_history = 0
        }
        
        result.cutoff_date = cutoffDate.toISOString()
        break
        
      case 'stats':
        // Get statistics
        const { count: totalAudits } = await supabase
          .from('audits')
          .select('*', { count: 'exact', head: true })
        
        const { count: auditsLast30Days } = await supabase
          .from('audits')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', cutoffDate.toISOString())
        
        const { count: totalPageUsage } = await supabase
          .from('page_audit_usage')
          .select('*', { count: 'exact', head: true })
        
        const { count: pageUsageLast30Days } = await supabase
          .from('page_audit_usage')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', cutoffDate.toISOString())
        
        const { count: totalUserUsage } = await supabase
          .from('user_usage')
          .select('*', { count: 'exact', head: true })
        
        // Get date range
        const { data: dateRange } = await supabase
          .from('audits')
          .select('created_at')
          .order('created_at', { ascending: true })
          .limit(1)
        
        const { data: newestDate } = await supabase
          .from('audits')
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(1)
        
        result = {
          total_audits: totalAudits || 0,
          audits_last_30_days: auditsLast30Days || 0,
          total_audit_history: 0, // Will be 0 if table doesn't exist
          audit_history_last_30_days: 0,
          total_page_audit_usage: totalPageUsage || 0,
          page_audit_usage_last_30_days: pageUsageLast30Days || 0,
          total_user_usage: totalUserUsage || 0,
          oldest_audit_date: dateRange?.[0]?.created_at || null,
          newest_audit_date: newestDate?.[0]?.created_at || null
        }
        break
        
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: cleanup, cleanup_manual, or stats' 
        }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      action,
      result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Cleanup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30)
    
    // Get statistics
    const { count: totalAudits } = await supabase
      .from('audits')
      .select('*', { count: 'exact', head: true })
    
    const { count: auditsLast30Days } = await supabase
      .from('audits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', cutoffDate.toISOString())
    
    const { count: totalPageUsage } = await supabase
      .from('page_audit_usage')
      .select('*', { count: 'exact', head: true })
    
    const { count: pageUsageLast30Days } = await supabase
      .from('page_audit_usage')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', cutoffDate.toISOString())
    
    const { count: totalUserUsage } = await supabase
      .from('user_usage')
      .select('*', { count: 'exact', head: true })
    
    // Get date range
    const { data: dateRange } = await supabase
      .from('audits')
      .select('created_at')
      .order('created_at', { ascending: true })
      .limit(1)
    
    const { data: newestDate } = await supabase
      .from('audits')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
    
    const result = {
      total_audits: totalAudits || 0,
      audits_last_30_days: auditsLast30Days || 0,
      total_audit_history: 0,
      audit_history_last_30_days: 0,
      total_page_audit_usage: totalPageUsage || 0,
      page_audit_usage_last_30_days: pageUsageLast30Days || 0,
      total_user_usage: totalUserUsage || 0,
      oldest_audit_date: dateRange?.[0]?.created_at || null,
      newest_audit_date: newestDate?.[0]?.created_at || null
    }
    
    return NextResponse.json({ 
      success: true, 
      action: 'stats',
      result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Cleanup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}



