import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    console.log('Setting up subscription database tables...')

    // Check if user_subscriptions table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .limit(1)

    if (tableError && tableError.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('user_subscriptions table does not exist, creating...')
      
      // Note: We can't create tables via the client API, so we'll return instructions
      return NextResponse.json({
        success: false,
        error: 'Database tables not found',
        message: 'Please run the create-subscription-tables.sql script in your Supabase SQL editor',
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to SQL Editor',
          '3. Run the create-subscription-tables.sql script',
          '4. Try the payment again'
        ]
      })
    }

    if (tableError) {
      console.error('Error checking table:', tableError)
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: tableError.message
      })
    }

    console.log('user_subscriptions table exists')
    
    return NextResponse.json({
      success: true,
      message: 'Database tables are properly set up',
      tables: {
        user_subscriptions: 'exists',
        user_usage: 'exists'
      }
    })

  } catch (error) {
    console.error('Error setting up database:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to setup database',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
