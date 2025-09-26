import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Checking if user_subscriptions table exists for user:', user.id)

    // Try multiple approaches to check the table
    let results = {
      user: { id: user.id, email: user.email },
      tableChecks: []
    }

    // Method 1: Try to select from the table
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('id')
        .limit(1)

      results.tableChecks.push({
        method: 'select_query',
        success: !error,
        error: error?.message,
        code: error?.code,
        data: data
      })
    } catch (err) {
      results.tableChecks.push({
        method: 'select_query',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    // Method 2: Try to insert a test record (will fail if table doesn't exist)
    try {
      const testData = {
        user_id: user.id,
        plan_id: 'test',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert(testData)
        .select()

      results.tableChecks.push({
        method: 'insert_test',
        success: !error,
        error: error?.message,
        code: error?.code,
        data: data
      })

      // If insert succeeded, delete the test record
      if (!error && data && data.length > 0) {
        await supabase
          .from('user_subscriptions')
          .delete()
          .eq('id', data[0].id)
      }
    } catch (err) {
      results.tableChecks.push({
        method: 'insert_test',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    // Method 3: Check table schema
    try {
      const { data, error } = await supabase
        .rpc('get_table_info', { table_name: 'user_subscriptions' })

      results.tableChecks.push({
        method: 'schema_check',
        success: !error,
        error: error?.message,
        data: data
      })
    } catch (err) {
      results.tableChecks.push({
        method: 'schema_check',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    // Determine if table exists based on results
    const tableExists = results.tableChecks.some(check => check.success)

    return NextResponse.json({
      tableExists,
      results,
      summary: tableExists ? 'Table exists and is accessible' : 'Table does not exist or is not accessible'
    })

  } catch (error) {
    console.error('Error checking table:', error)
    return NextResponse.json(
      { 
        tableExists: false,
        error: 'Failed to check table',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
