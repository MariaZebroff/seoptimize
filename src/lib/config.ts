// Client-side configuration for environment variables
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rarheulwybeiltuvubid.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcmhldWx3eWJlaWx0dXZ1YmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDE3NTksImV4cCI6MjA3MzAxNzc1OX0.AaV6QqGONUbAy3RPcxu7riB6NsGunfriFaUZVbNyYXs'
  },
  lighthouse: {
    enabled: process.env.ENABLE_LIGHTHOUSE === 'true'
  }
}

// Validate configuration
export const validateConfig = () => {
  const errors: string[] = []
  
  if (!config.supabase.url || config.supabase.url === 'https://placeholder.supabase.co') {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  
  if (!config.supabase.anonKey || config.supabase.anonKey === 'placeholder-key') {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors:', errors)
    return false
  }
  
  return true
}
