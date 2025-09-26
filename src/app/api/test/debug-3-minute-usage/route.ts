import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    console.log('=== DEBUG 3-MINUTE USAGE ===')
    console.log('User ID:', userId)
    
    const supabase = createSupabaseServiceClient()
    
    // Calculate 3 minutes ago
    const threeMinutesAgo = new Date()
    threeMinutesAgo.setMinutes(threeMinutesAgo.getMinutes() - 3)
    
    console.log('Current time:', new Date().toISOString())
    console.log('3 minutes ago:', threeMinutesAgo.toISOString())
    
    // Get all audit records for this user
    const { data: allAudits, error: allError } = await supabase
      .from('audits')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.error('Error fetching all audits:', allError)
      return NextResponse.json({ error: allError.message }, { status: 500 })
    }
    
    console.log('All audits for user:', allAudits?.length || 0)
    console.log('All audit timestamps:', allAudits?.map(a => a.created_at) || [])
    
    // Get audits from last 3 minutes
    const { data: recentAudits, error: recentError } = await supabase
      .from('audits')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', threeMinutesAgo.toISOString())
    
    if (recentError) {
      console.error('Error fetching recent audits:', recentError)
      return NextResponse.json({ error: recentError.message }, { status: 500 })
    }
    
    console.log('Recent audits (last 3 minutes):', recentAudits?.length || 0)
    console.log('Recent audit timestamps:', recentAudits?.map(a => a.created_at) || [])
    
    return NextResponse.json({
      userId,
      currentTime: new Date().toISOString(),
      threeMinutesAgo: threeMinutesAgo.toISOString(),
      totalAudits: allAudits?.length || 0,
      recentAudits: recentAudits?.length || 0,
      allAuditTimestamps: allAudits?.map(a => a.created_at) || [],
      recentAuditTimestamps: recentAudits?.map(a => a.created_at) || []
    })
  } catch (error) {
    console.error('Debug 3-minute usage error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


