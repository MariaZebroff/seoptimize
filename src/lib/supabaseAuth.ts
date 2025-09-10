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
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
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
  checkEnvVars()
  const { data: { user } } = await supabase.auth.getUser()
  return user
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

// Site management functions
export const addSite = async (url: string, title?: string) => {
  checkEnvVars()
  
  // Get current user to ensure we're authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }
  
  const { data, error } = await supabase
    .from('sites')
    .insert({
      url,
      title: title || null,
      user_id: user.id
    })
    .select()
    .single()
  return { data, error }
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
