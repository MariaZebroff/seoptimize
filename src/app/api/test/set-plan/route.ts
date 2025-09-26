import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getPlanById } from '@/lib/plans'

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

    const { planId } = await request.json()
    
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    const plan = getPlanById(planId)
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    // For testing purposes, we'll just return the plan
    // In a real implementation, this would update the database
    console.log(`Test: Setting user ${user.id} to plan ${planId}`)
    
    return NextResponse.json({ 
      success: true, 
      plan,
      message: `Plan set to ${plan.name} for testing` 
    })

  } catch (error) {
    console.error('Error setting test plan:', error)
    return NextResponse.json(
      { error: 'Failed to set test plan' },
      { status: 500 }
    )
  }
}



