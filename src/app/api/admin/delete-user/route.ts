import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function DELETE(request: NextRequest) {
  try {
    // Get user from request to verify admin access
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user ID to delete from request body
    const { userIdToDelete } = await request.json()
    
    if (!userIdToDelete) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Create admin client with service role key
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {
            // No-op
          },
        },
      }
    )

    // Delete user from auth.users table
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userIdToDelete)
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    return NextResponse.json({ message: 'User deleted successfully' })

  } catch (error) {
    console.error('Error in delete user API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



