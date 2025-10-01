import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    console.log('=== CHECKING AUDITS TABLE ===')
    console.log('Looking for user ID:', userId)
    
    const supabase = createSupabaseServiceClient()
    
    // Check if audits table exists and get recent records for this user
    const { data, error } = await supabase
      .from('audits')
      .select('id, user_id, url, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('Error querying audits table:', error)
      return NextResponse.json({ 
        error: 'Failed to query audits table',
        details: error.message 
      }, { status: 500 })
    }
    
    console.log('Found audit records:', data?.length || 0)
    console.log('Audit records:', data)
    
    return NextResponse.json({
      userId,
      auditCount: data?.length || 0,
      audits: data || []
    })
  } catch (error) {
    console.error('Check audits error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



