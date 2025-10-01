import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    // Get user from request
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // No-op for API routes
          },
        },
      }
    )
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // For testing purposes, we'll store the Basic Plan status in a simple way
    // This is a temporary solution for testing
    console.log('Setting Basic Plan for user:', user.id, user.email)
    
    // Return success - in a real implementation, this would update the database
    // For now, we'll just return success and handle the plan logic in the frontend
    return NextResponse.json({ 
      success: true, 
      message: 'Basic Plan activated for testing',
      userId: user.id,
      email: user.email,
      note: 'This is a test implementation. In production, this would update the database.'
    })

  } catch (error) {
    console.error('Error setting Basic Plan:', error)
    return NextResponse.json(
      { error: 'Failed to set Basic Plan' },
      { status: 500 }
    )
  }
}




