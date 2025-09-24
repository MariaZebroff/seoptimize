import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Simple in-memory storage for fallback service
declare global {
  var __auditUsage: { [userId: string]: number } | undefined
  var __anonymousAuditCount: number | undefined
}

const getAuditUsage = () => {
  if (!global.__auditUsage) {
    global.__auditUsage = {}
  }
  return global.__auditUsage
}

export async function POST(request: NextRequest) {
  try {
    const auditUsage = getAuditUsage()
    
    // Reset in-memory audit usage
    global.__auditUsage = {}
    global.__anonymousAuditCount = 0
    
    // Reset database audit usage for anonymous users
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    
    // Delete from user_usage table
    const { error: usageError } = await supabase
      .from('user_usage')
      .delete()
      .eq('user_id', 'anonymous-user')
      .eq('month', currentMonth)
    
    // Delete from audits table (this is the main tracking)
    const { error: historyError } = await supabase
      .from('audits')
      .delete()
      .eq('user_id', 'anonymous-user')
      .gte('created_at', `${currentMonth}-01T00:00:00.000Z`)
      .lt('created_at', `${currentMonth}-32T00:00:00.000Z`)
    
    if (usageError || historyError) {
      console.error('Error resetting database audit limits:', { usageError, historyError })
    } else {
      console.log('Admin: Reset database audit limits for anonymous users')
    }
    
    console.log('Admin: Reset audit limits - cleared all usage data')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Audit limits reset successfully',
      previousUsage: auditUsage,
      currentUsage: {},
      databaseReset: !usageError && !historyError
    })
  } catch (error) {
    console.error('Error resetting audit limits:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset audit limits' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const auditUsage = getAuditUsage()
    
    // Get database usage for anonymous users
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    const { data: dbUsage, error: dbError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', 'anonymous-user')
      .eq('month', currentMonth)
    
    // Get audit history for anonymous users
    const { data: auditHistory, error: historyError } = await supabase
      .from('audits')
      .select('id, url, created_at')
      .eq('user_id', 'anonymous-user')
      .gte('created_at', `${currentMonth}-01T00:00:00.000Z`)
      .lt('created_at', `${currentMonth}-32T00:00:00.000Z`)
      .order('created_at', { ascending: false })
    
    return NextResponse.json({ 
      success: true, 
      inMemoryUsage: auditUsage,
      databaseUsage: dbUsage || [],
      auditHistory: auditHistory || [],
      currentMonth,
      auditCount: auditHistory ? auditHistory.length : 0,
      anonymousAuditCount: global.__anonymousAuditCount || 0
    })
  } catch (error) {
    console.error('Error getting audit usage:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get audit usage' },
      { status: 500 }
    )
  }
}
