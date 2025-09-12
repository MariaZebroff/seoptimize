import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
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

// Service role client that bypasses RLS policies
export const createSupabaseServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Server-side audit result saving (without authentication requirement)
export const saveAuditResultServer = async (auditResult: any, siteId?: string, userId?: string) => {
  // Use service role client to bypass RLS policies
  const supabase = createSupabaseServiceClient()
  
  const { data, error } = await supabase
    .from('audits')
    .insert({
      user_id: userId || null, // Use provided user ID or null for anonymous audits
      site_id: siteId || null,
      url: auditResult.url,
      title: auditResult.title,
      meta_description: auditResult.metaDescription,
      h1_tags: auditResult.h1Tags,
      h2_tags: auditResult.h2Tags,
      h3_tags: auditResult.h3Tags,
      h4_tags: auditResult.h4Tags,
      h5_tags: auditResult.h5Tags,
      h6_tags: auditResult.h6Tags,
      title_word_count: auditResult.titleWordCount,
      meta_description_word_count: auditResult.metaDescriptionWordCount,
      h1_word_count: auditResult.h1WordCount,
      h2_word_count: auditResult.h2WordCount,
      h3_word_count: auditResult.h3WordCount,
      h4_word_count: auditResult.h4WordCount,
      h5_word_count: auditResult.h5WordCount,
      h6_word_count: auditResult.h6WordCount,
      images_without_alt: auditResult.imagesWithoutAlt,
      images_with_alt: auditResult.imagesWithAlt,
      internal_links: auditResult.internalLinks,
      external_links: auditResult.externalLinks,
      total_links: auditResult.totalLinks,
      total_images: auditResult.totalImages,
      images_missing_alt: auditResult.imagesMissingAlt,
      internal_link_count: auditResult.internalLinkCount,
      external_link_count: auditResult.externalLinkCount,
      heading_structure: auditResult.headingStructure,
      broken_links: auditResult.brokenLinks,
      broken_link_details: auditResult.brokenLinkDetails,
      broken_link_summary: auditResult.brokenLinkSummary,
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
