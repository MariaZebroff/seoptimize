import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabaseServer'
import { SubscriptionService } from '@/lib/subscriptionService'

export async function GET(request: NextRequest) {
  try {
    console.log('Subscription plan API: Starting request')
    
    // Get user from request
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    console.log('Subscription plan API: Auth result:', { user: user?.id, error: error?.message })
    
    if (!user) {
      console.log('Subscription plan API: No user found, trying fallback methods')
      
      // Try to get user email from cookie
      try {
        const userEmail = request.cookies.get('user-email')?.value
        
        if (userEmail) {
          console.log('Subscription plan API: Found user email from cookie:', userEmail)
          
          // Use service client to find user by email
          const serviceSupabase = createSupabaseServiceClient()
          const { data: users, error: userError } = await serviceSupabase.auth.admin.listUsers()
          
          if (!userError && users) {
            const foundUser = users.users.find(u => u.email === userEmail)
            if (foundUser) {
              console.log('Subscription plan API: Found user by email:', foundUser.id)
              const plan = await SubscriptionService.getUserPlan(foundUser.id)
              console.log('Subscription plan API: Plan result:', plan)
              return NextResponse.json({ plan })
            }
          }
        }
      } catch (fallbackError) {
        console.log('Subscription plan API: Cookie fallback failed:', fallbackError)
      }
      
      // PERMANENT FIX: Try to find user by email from any available source
      try {
        // Try to get user email from various sources
        let userEmail = null
        
        // 1. Try cookie first
        userEmail = request.cookies.get('user-email')?.value
        
        // 2. If no cookie, try to extract from request headers or other sources
        if (!userEmail) {
          // Check if there's any user info in the request
          const authHeader = request.headers.get('authorization')
          if (authHeader) {
            console.log('Subscription plan API: Found authorization header, but no user session')
          }
        }
        
        // 3. If we have an email, try to find the user
        if (userEmail) {
          console.log('Subscription plan API: Using email fallback for user:', userEmail)
          
          const serviceSupabase = createSupabaseServiceClient()
          const { data: users, error: userError } = await serviceSupabase.auth.admin.listUsers()
          
          if (!userError && users) {
            const foundUser = users.users.find(u => u.email === userEmail)
            if (foundUser) {
              console.log('Subscription plan API: Found user by email:', foundUser.id)
              const plan = await SubscriptionService.getUserPlan(foundUser.id)
              console.log('Subscription plan API: Plan result:', plan)
              return NextResponse.json({ plan })
            }
          }
        }
      } catch (fallbackError) {
        console.log('Subscription plan API: Email fallback failed:', fallbackError)
      }
      
      console.log('Subscription plan API: No user found, returning free plan')
      // Return free plan for unauthenticated users
      const { getDefaultPlan } = await import('@/lib/plans')
      const freePlan = getDefaultPlan()
      return NextResponse.json({ plan: freePlan })
    }

    console.log('Subscription plan API: Getting plan for user:', user.id)
    const plan = await SubscriptionService.getUserPlan(user.id)
    console.log('Subscription plan API: Plan result:', plan)
    
    return NextResponse.json({ plan })

  } catch (error) {
    console.error('Error fetching user plan:', error)
    // Return free plan as fallback instead of error
    try {
      const { getDefaultPlan } = await import('@/lib/plans')
      const freePlan = getDefaultPlan()
      return NextResponse.json({ plan: freePlan })
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Failed to fetch user plan' },
        { status: 500 }
      )
    }
  }
}
