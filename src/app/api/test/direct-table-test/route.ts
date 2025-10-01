import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Create a direct Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('Direct table test: Using service role key')

    // Try to query the table directly
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(1)

    if (error) {
      console.log('Direct table test error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Table is accessible with service role',
      data: data,
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Direct table test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test table',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}



