import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server-side Supabase client for API routes
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Server-side audit result saving (without authentication requirement)
export const saveAuditResultServer = async (auditResult: any, siteId?: string) => {
  const supabase = await createSupabaseServerClient()
  
  // Try to get the current user, but don't fail if not authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('audits')
    .insert({
      user_id: user?.id || null, // Allow null for anonymous audits
      site_id: siteId || null,
      url: auditResult.url,
      title: auditResult.title,
      meta_description: auditResult.metaDescription,
      h1_tags: auditResult.h1Tags,
      broken_links: auditResult.brokenLinks,
      mobile_score: auditResult.mobileScore,
      performance_score: auditResult.performanceScore,
      accessibility_score: auditResult.accessibilityScore,
      seo_score: auditResult.seoScore,
      best_practices_score: auditResult.bestPracticesScore,
      status: auditResult.status,
      error_message: auditResult.error || null,
      audit_type: 'full'
    })
    .select()
    .single()
  
  return { data, error }
}
