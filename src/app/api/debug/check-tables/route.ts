import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Get user from request
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Debug: Checking tables for user:', user.id)

    // Use service role client for direct database access
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const results: any = {
      user: {
        id: user.id,
        email: user.email
      },
      tables: {},
      errors: {}
    }

    // Check if user_subscriptions table exists and is accessible
    try {
      const { data: subscriptions, error: subError } = await serviceSupabase
        .from('user_subscriptions')
        .select('count')
        .limit(1)

      results.tables.user_subscriptions = {
        exists: true,
        accessible: !subError,
        error: subError?.message || null,
        count: subscriptions?.length || 0
      }
    } catch (error) {
      results.tables.user_subscriptions = {
        exists: false,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Check if user_usage table exists and is accessible
    try {
      const { data: usage, error: usageError } = await serviceSupabase
        .from('user_usage')
        .select('count')
        .limit(1)

      results.tables.user_usage = {
        exists: true,
        accessible: !usageError,
        error: usageError?.message || null,
        count: usage?.length || 0
      }
    } catch (error) {
      results.tables.user_usage = {
        exists: false,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Check if audits table exists and is accessible
    try {
      const { data: audits, error: auditError } = await serviceSupabase
        .from('audits')
        .select('count')
        .limit(1)

      results.tables.audits = {
        exists: true,
        accessible: !auditError,
        error: auditError?.message || null,
        count: audits?.length || 0
      }
    } catch (error) {
      results.tables.audits = {
        exists: false,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Check if sites table exists and is accessible
    try {
      const { data: sites, error: siteError } = await serviceSupabase
        .from('sites')
        .select('count')
        .limit(1)

      results.tables.sites = {
        exists: true,
        accessible: !siteError,
        error: siteError?.message || null,
        count: sites?.length || 0
      }
    } catch (error) {
      results.tables.sites = {
        exists: false,
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error('Error checking tables:', error)
    return NextResponse.json(
      { error: 'Failed to check tables' },
      { status: 500 }
    )
  }
}

