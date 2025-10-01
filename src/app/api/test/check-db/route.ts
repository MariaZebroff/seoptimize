import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Check if user_subscriptions table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_subscriptions')

    if (tablesError) {
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: tablesError.message 
      }, { status: 500 })
    }

    const tableExists = tables && tables.length > 0

    if (!tableExists) {
      return NextResponse.json({ 
        error: 'user_subscriptions table does not exist',
        suggestion: 'Run the database schema migration first'
      }, { status: 404 })
    }

    // Try to select from the table to verify it's accessible
    const { data: subscriptions, error: selectError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(1)

    if (selectError) {
      return NextResponse.json({ 
        error: 'Cannot access user_subscriptions table', 
        details: selectError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      tableExists: true,
      sampleData: subscriptions
    })

  } catch (error) {
    console.error('Database check error:', error)
    return NextResponse.json(
      { error: 'Database check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}




