import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { action, daysToKeep } = await request.json()
    
    const supabase = createSupabaseServiceClient()
    
    let result
    
    switch (action) {
      case 'cleanup':
        // Run the 30-day cleanup
        const { data: cleanupResult, error: cleanupError } = await supabase
          .rpc('cleanup_old_audit_data')
        
        if (cleanupError) {
          console.error('Cleanup error:', cleanupError)
          return NextResponse.json({ 
            error: 'Cleanup failed', 
            details: cleanupError.message 
          }, { status: 500 })
        }
        
        result = cleanupResult?.[0] || {}
        break
        
      case 'cleanup_manual':
        // Run manual cleanup with custom days
        const days = daysToKeep || 30
        const { data: manualResult, error: manualError } = await supabase
          .rpc('cleanup_old_audit_data_manual', { days_to_keep: days })
        
        if (manualError) {
          console.error('Manual cleanup error:', manualError)
          return NextResponse.json({ 
            error: 'Manual cleanup failed', 
            details: manualError.message 
          }, { status: 500 })
        }
        
        result = manualResult?.[0] || {}
        break
        
      case 'stats':
        // Get statistics
        const { data: statsResult, error: statsError } = await supabase
          .rpc('get_audit_data_stats')
        
        if (statsError) {
          console.error('Stats error:', statsError)
          return NextResponse.json({ 
            error: 'Failed to get stats', 
            details: statsError.message 
          }, { status: 500 })
        }
        
        result = statsResult?.[0] || {}
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
    
    // Get statistics
    const { data: statsResult, error: statsError } = await supabase
      .rpc('get_audit_data_stats')
    
    if (statsError) {
      console.error('Stats error:', statsError)
      return NextResponse.json({ 
        error: 'Failed to get stats', 
        details: statsError.message 
      }, { status: 500 })
    }
    
    const result = statsResult?.[0] || {}
    
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



