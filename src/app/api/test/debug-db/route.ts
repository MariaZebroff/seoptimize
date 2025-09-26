import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Debug: Checking database for user:', user.id)

    // Try to list all tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables')

    // If that doesn't work, try a direct query
    let tableCheck = null
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('count')
        .limit(1)
      
      tableCheck = { exists: !error, error: error?.message }
    } catch (err) {
      tableCheck = { exists: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      tableCheck,
      tables: tables || 'Could not fetch tables',
      tablesError: tablesError?.message || null
    })

  } catch (error) {
    console.error('Error in debug:', error)
    return NextResponse.json(
      { 
        error: 'Failed to debug database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


