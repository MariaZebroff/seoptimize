import { createClient } from "@supabase/supabase-js"

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
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
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
