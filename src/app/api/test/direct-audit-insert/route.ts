import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    console.log('=== TESTING DIRECT AUDIT INSERT ===')
    console.log('User ID:', userId)
    
    const supabase = createSupabaseServiceClient()
    
    // Try to insert a simple audit record
    const { data, error } = await supabase
      .from('audits')
      .insert({
        user_id: userId,
        url: 'https://test-direct-insert.com',
        title: 'Test Direct Insert',
        meta_description: 'Test Description',
        h1_tags: ['Test H1'],
        h2_tags: [],
        h3_tags: [],
        h4_tags: [],
        h5_tags: [],
        h6_tags: [],
        title_word_count: 2,
        meta_description_word_count: 2,
        h1_word_count: 2,
        h2_word_count: 0,
        h3_word_count: 0,
        h4_word_count: 0,
        h5_word_count: 0,
        h6_word_count: 0,
        images_without_alt: [],
        images_with_alt: [],
        total_images: 0,
        internal_links: [],
        external_links: [],
        total_links: 0,
        status: 'success'
      })
      .select()
    
    if (error) {
      console.error('Direct insert error:', error)
      return NextResponse.json({ 
        error: 'Failed to insert audit record',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }
    
    console.log('Direct insert successful:', data)
    
    return NextResponse.json({
      success: true,
      insertedRecord: data[0],
      message: 'Direct audit insert successful'
    })
  } catch (error) {
    console.error('Direct insert test error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
