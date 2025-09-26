import { createClient } from "@supabase/supabase-js"

// Get the correct redirect URL based on environment
const getRedirectUrl = () => {
  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    // Always use the current origin for client-side redirects
    return `${window.location.origin}/dashboard`
  }
  
  // Server side - use environment variable or default to localhost for development
  // Check for Vercel environment variables first
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/dashboard`
  }
  
  // Fallback to NODE_ENV check
  return process.env.NODE_ENV === 'production' 
    ? 'https://seoptimize.vercel.app/dashboard'
    : 'http://localhost:3000/dashboard'
}

// Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
)

// Check if environment variables are set
const checkEnvVars = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    throw new Error('Please set up your Supabase environment variables. See QUICK-START.md for instructions.')
  }
}

// Auth functions
export const signUp = async (email: string, password: string, name: string) => {
  checkEnvVars()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      }
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  checkEnvVars()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  checkEnvVars()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  try {
    checkEnvVars()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.warn('Supabase environment variables not configured:', error.message)
    return null
  }
}


export const signInWithGoogle = async () => {
  checkEnvVars()
  const redirectUrl = getRedirectUrl()
  console.log('🔗 Redirect URL:', redirectUrl)
  console.log('🌍 Current origin:', typeof window !== 'undefined' ? window.location.origin : 'server-side')
  console.log('🏗️ NODE_ENV:', process.env.NODE_ENV)
  console.log('🚀 VERCEL_URL:', process.env.VERCEL_URL)
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  })
  return { data, error }
}

export const resetPassword = async (email: string) => {
  checkEnvVars()
  const redirectUrl = getRedirectUrl()
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  return { data, error }
}

export const checkEmailExists = async (email: string) => {
  checkEnvVars()
  
  try {
    // Use API endpoint to check email existence
    const response = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to check email')
    }
    
    const data = await response.json()
    return { exists: data.exists, error: null }
  } catch (error) {
    return { exists: false, error: { message: 'Failed to check email existence' } }
  }
}

// Site management functions
export const addSite = async (url: string, title?: string) => {
  checkEnvVars()
  
  // Get current user to ensure we're authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }
  
  // Create the site
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .insert({
      url,
      title: title || null,
      user_id: user.id
    })
    .select()
    .single()
  
  if (siteError) {
    return { data: null, error: siteError }
  }
  
  // Automatically create a main page entry for the site URL
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname || '/'
    
    const { error: pageError } = await supabase
      .from('pages')
      .insert({
        user_id: user.id,
        site_id: site.id,
        url: url,
        title: title || null,
        path: path,
        is_main_page: true // This is the main page for the site
      })
    
    if (pageError) {
      console.error('Error creating main page for site:', pageError)
      // Don't fail the entire operation, just log the error
    } else {
      console.log(`Created main page for site: ${url}`)
    }
  } catch (error) {
    console.error('Error processing URL for main page:', error)
    // Don't fail the entire operation, just log the error
  }
  
  return { data: site, error: null }
}

export const getUserSites = async () => {
  checkEnvVars()
  
  // Get current user to ensure we're authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }
  
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const deleteSite = async (siteId: string) => {
  checkEnvVars()
  
  // Get current user to ensure we're authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: { message: 'User not authenticated' } }
  }
  
  // First, get all pages for this site to collect their URLs
  const { data: pages, error: pagesError } = await supabase
    .from('pages')
    .select('url')
    .eq('site_id', siteId)
    .eq('user_id', user.id)
  
  if (pagesError) {
    console.error('Error fetching pages for site deletion:', pagesError)
    return { error: pagesError }
  }
  
  // Get the site URL as well (main page)
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('url')
    .eq('id', siteId)
    .eq('user_id', user.id)
    .single()
  
  if (siteError) {
    console.error('Error fetching site for deletion:', siteError)
    return { error: siteError }
  }
  
  // Collect all URLs that need audit usage cleanup
  const urlsToCleanup = [site.url] // Main site URL
  if (pages) {
    pages.forEach(page => urlsToCleanup.push(page.url))
  }
  
  // Clean up page audit usage records for all URLs
  if (urlsToCleanup.length > 0) {
    const { error: auditCleanupError } = await supabase
      .from('page_audit_usage')
      .delete()
      .eq('user_id', user.id)
      .in('page_url', urlsToCleanup)
    
    if (auditCleanupError) {
      console.error('Error cleaning up page audit usage:', auditCleanupError)
      // Don't fail the entire operation, just log the error
    } else {
      console.log(`Cleaned up page audit usage for ${urlsToCleanup.length} URLs`)
    }
  }
  
  // Delete the site (this will cascade delete pages due to foreign key constraints)
  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', siteId)
    .eq('user_id', user.id) // Double-check ownership
  
  return { error }
}

export const updateSite = async (siteId: string, updates: { url?: string; title?: string }) => {
  checkEnvVars()
  
  // Get current user to ensure we're authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }
  
  const { data, error } = await supabase
    .from('sites')
    .update(updates)
    .eq('id', siteId)
    .eq('user_id', user.id) // Double-check ownership
    .select()
    .single()
  return { data, error }
}

// Page management functions
export interface Page {
  id: string
  site_id: string
  user_id: string
  url: string
  title: string | null
  path: string
  is_main_page: boolean
  created_at: string
  updated_at: string
}

export const addPage = async (siteId: string, url: string, title?: string) => {
  checkEnvVars()
  
  // Get current user to ensure we're authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  // Extract path from URL
  const urlObj = new URL(url)
  const path = urlObj.pathname || '/'
  
  // First, check if page already exists
  const { data: existingPage, error: checkError } = await supabase
    .from('pages')
    .select('id, url')
    .eq('user_id', user.id)
    .eq('site_id', siteId)
    .eq('url', url)
    .single()
  
  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
    return { data: null, error: checkError }
  }
  
  // If page already exists, return the existing page
  if (existingPage) {
    return { data: existingPage, error: null }
  }
  
  // Add new page
  const { data, error } = await supabase
    .from('pages')
    .insert({
      user_id: user.id,
      site_id: siteId,
      url: url,
      title: title || null,
      path: path,
      is_main_page: path === '/'
    })
    .select()
    .single()
  return { data, error }
}

export const getPagesForSite = async (siteId: string) => {
  checkEnvVars()
  
  // Get current user to ensure we're authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }
  
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('site_id', siteId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  return { data, error }
}

export const deletePage = async (pageId: string) => {
  checkEnvVars()
  
  // Get current user to ensure we're authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }
  
  // First, get the page URL before deleting
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('url')
    .eq('id', pageId)
    .eq('user_id', user.id)
    .single()
  
  if (pageError) {
    console.error('Error fetching page for deletion:', pageError)
    return { data: null, error: pageError }
  }
  
  // Clean up page audit usage record for this URL
  const { error: auditCleanupError } = await supabase
    .from('page_audit_usage')
    .delete()
    .eq('user_id', user.id)
    .eq('page_url', page.url)
  
  if (auditCleanupError) {
    console.error('Error cleaning up page audit usage:', auditCleanupError)
    // Don't fail the entire operation, just log the error
  } else {
    console.log(`Cleaned up page audit usage for ${page.url}`)
  }
  
  // Delete the page
  const { data, error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId)
    .eq('user_id', user.id) // Double-check ownership
    .select()
    .single()
  return { data, error }
}

export const addMultiplePages = async (siteId: string, pages: Array<{url: string, title?: string}>) => {
  checkEnvVars()
  
  // Get current user to ensure we're authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const results = {
    added: 0,
    skipped: 0,
    errors: 0,
    pages: [] as any[]
  }

  // Get existing pages for this site to avoid duplicates
  const { data: existingPages } = await supabase
    .from('pages')
    .select('url')
    .eq('user_id', user.id)
    .eq('site_id', siteId)

  const existingUrls = new Set(existingPages?.map(p => p.url) || [])

  // Process each page
  for (const page of pages) {
    try {
      // Skip if page already exists
      if (existingUrls.has(page.url)) {
        results.skipped++
        continue
      }

      // Add the page
      const { data, error } = await addPage(siteId, page.url, page.title)
      if (error) {
        console.warn('Failed to add page:', page.url, error.message)
        results.errors++
      } else {
        results.added++
        results.pages.push(data)
        // Add to existing URLs to avoid duplicates in the same batch
        existingUrls.add(page.url)
      }
    } catch (err) {
      console.warn('Error adding page:', page.url, err)
      results.errors++
    }
  }

  return { data: results, error: null }
}

export const detectPagesFromSite = async (siteUrl: string) => {
  try {
    // This is a simplified page detection - in a real implementation,
    // you might want to use a web scraping service or API
    const response = await fetch('/api/detect-pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ siteUrl }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to detect pages')
    }
    
    const data = await response.json()
    return { data: data.pages, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to detect pages' } }
  }
}

// Audit history functions
export interface AuditResult {
  title: string
  metaDescription: string
  h1Tags: string[]
  brokenLinks: string[]
  mobileScore: number
  performanceScore: number
  accessibilityScore: number
  seoScore: number
  bestPracticesScore: number
  url: string
  timestamp: string
  status: 'success' | 'error'
  error?: string
}

export const saveAuditResult = async (auditResult: AuditResult, siteId?: string) => {
  checkEnvVars()
  
  // Get current user to ensure we're authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }
  
  const { data, error } = await supabase
    .from('audits')
    .insert({
      user_id: user.id,
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

export const getAuditHistory = async (siteId?: string, limit: number = 50) => {
  checkEnvVars()
  
  // Get current user, but don't require authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  let query = supabase
    .from('audits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  // Show all audits for now (both user-specific and anonymous)
  // This ensures that audit history is visible even when server-side auth isn't working
  if (user) {
    // Don't filter by user_id for now - show all audits
  } else {
    // For unauthenticated users, show audits with null user_id
    query = query.is('user_id', null)
  }
  
  if (siteId) {
    query = query.eq('site_id', siteId)
  }
  
  const { data, error } = await query
  return { data, error }
}

export const getLatestAuditForSite = async (siteId: string) => {
  checkEnvVars()
  
  // Get current user, but don't require authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  let query = supabase
    .from('audits')
    .select('*')
    .eq('site_id', siteId)
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(1)
  
  // If user is authenticated, filter by user_id, otherwise show all audits
  if (user) {
    query = query.eq('user_id', user.id)
  } else {
    query = query.is('user_id', null)
  }
  
  const { data, error } = await query.single()
  return { data, error }
}

export const deleteAudit = async (auditId: string) => {
  checkEnvVars()
  
  // Get current user, but don't require authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  let query = supabase
    .from('audits')
    .delete()
    .eq('id', auditId)
  
  // If user is authenticated, filter by user_id, otherwise allow deletion of null user_id audits
  if (user) {
    query = query.eq('user_id', user.id)
  } else {
    query = query.is('user_id', null)
  }
  
  const { error } = await query
  return { error }
}
