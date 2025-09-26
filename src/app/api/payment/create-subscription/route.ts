import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { paymentRateLimiter, getClientIdentifier, createRateLimitResponse } from '@/lib/rateLimiter'

// Create Supabase client with service role key for direct database access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for subscription creation
    const clientId = getClientIdentifier(request)
    const rateLimit = paymentRateLimiter.isAllowed(clientId)
    
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for subscription creation: ${clientId}`)
      return createRateLimitResponse(rateLimit.remaining, rateLimit.resetTime)
    }

    console.log('🔧 Creating subscription after payment...')
    
    const { userId, planId, planName, amount } = await request.json()
    
    console.log('Payment API received:', { userId, planId, planName, amount })
    
    if (!userId || !planId) {
      console.log('❌ Missing required fields:', { userId, planId })
      return NextResponse.json(
        { error: 'userId and planId are required' },
        { status: 400 }
      )
    }

    console.log('Creating subscription for user:', userId, 'plan:', planId, 'amount:', amount)

    // Check if user already has a subscription
    const { data: existingSubscription, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing subscription', details: checkError.message },
        { status: 500 }
      )
    }

    const now = new Date()
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    let subscription
    let createError

    if (existingSubscription) {
      // Update existing subscription
      console.log('Updating existing subscription:', existingSubscription.id)
      const { data: updatedSubscription, error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: planId,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString()
        })
        .eq('id', existingSubscription.id)
        .select()
        .single()
      
      subscription = updatedSubscription
      createError = updateError
    } else {
      // Create new subscription
      console.log('Creating new subscription')
      const { data: newSubscription, error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString()
        })
        .select()
        .single()
      
      subscription = newSubscription
      createError = insertError
    }

    if (createError) {
      console.error('Create subscription error:', createError)
      console.error('Error code:', createError.code)
      console.error('Error message:', createError.message)
      console.error('Error details:', createError.details)
      console.error('Error hint:', createError.hint)
      
      // Check if it's a table doesn't exist error
      if (createError.code === '42P01' || createError.message.includes('relation "user_subscriptions" does not exist')) {
        console.log('Table does not exist, attempting to create it automatically...')
        
        try {
          // Try to create the table automatically
          const { data: createData, error: createTableError } = await supabase
            .rpc('exec_sql', {
              sql: `
                CREATE TABLE user_subscriptions (
                  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                  plan_id VARCHAR(50) NOT NULL DEFAULT 'free',
                  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'incomplete')),
                  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
                  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
              `
            })
          
          if (createTableError) {
            console.error('Failed to create table automatically:', createTableError)
            return NextResponse.json(
              { 
                error: 'Database table not found and could not be created', 
                details: 'The user_subscriptions table does not exist and could not be created automatically.',
                solution: 'Please contact support or run the database setup script manually'
              },
              { status: 500 }
            )
          }
          
          console.log('Table created successfully, retrying subscription creation...')
          
          // Retry the subscription creation
          if (existingSubscription) {
            const { data: updatedSubscription, error: updateError } = await supabase
              .from('user_subscriptions')
              .update({
                plan_id: planId,
                status: 'active',
                current_period_end: periodEnd.toISOString()
              })
              .eq('id', existingSubscription.id)
              .select()
              .single()
            
            subscription = updatedSubscription
            createError = updateError
          } else {
            const { data: newSubscription, error: insertError } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id: userId,
                plan_id: planId,
                status: 'active',
                current_period_end: periodEnd.toISOString()
              })
              .select()
              .single()
            
            subscription = newSubscription
            createError = insertError
          }
          
          if (createError) {
            console.error('Retry failed:', createError)
            return NextResponse.json(
              { 
                error: 'Failed to create subscription after table creation', 
                details: createError.message
              },
              { status: 500 }
            )
          }
          
        } catch (autoCreateError) {
          console.error('Auto-create table failed:', autoCreateError)
          return NextResponse.json(
            { 
              error: 'Database table not found and could not be created', 
              details: 'The user_subscriptions table does not exist and could not be created automatically.',
              solution: 'Please contact support or run the database setup script manually'
            },
            { status: 500 }
          )
        }
      }
      
      // Check if it's a permission error
      if (createError.code === '42501' || createError.message.includes('permission denied')) {
        return NextResponse.json(
          { 
            error: 'Permission denied', 
            details: 'The service role key does not have permission to access the user_subscriptions table.',
            solution: 'Check your SUPABASE_SERVICE_ROLE_KEY environment variable'
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create subscription', 
          details: createError.message,
          code: createError.code
        },
        { status: 500 }
      )
    }

    console.log('✅ Subscription created successfully:', subscription)

    return NextResponse.json({
      success: true,
      message: 'Subscription created successfully',
      subscription: subscription
    })

  } catch (error) {
    console.error('Error creating subscription:', error)
    
    // Don't expose internal error details to client
    return NextResponse.json(
      { 
        error: 'Subscription processing temporarily unavailable',
        message: 'Please try again in a few moments'
      },
      { status: 500 }
    )
  }
}
