import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getPlanById } from '@/lib/plans'

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ plan: null }, { status: 401 })
    }

    // For testing: always return Basic Plan
    const basicPlan = getPlanById('basic')!
    
    console.log('Test: Returning Basic Plan for user:', user.id, user.email)
    
    return NextResponse.json({ plan: basicPlan })

  } catch (error) {
    console.error('Error fetching test plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test plan' },
      { status: 500 }
    )
  }
}



