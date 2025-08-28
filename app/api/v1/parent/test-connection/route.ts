import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test basic queries
    const results: any = {}

    // Test profiles table
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      results.profile = { data: profile, error: error?.message }
    } catch (e) {
      results.profile = { error: e instanceof Error ? e.message : 'Unknown error' }
    }

    // Test parent_links table
    try {
      const { data: links, error } = await supabase
        .from('parent_links')
        .select('*')
        .eq('parent_user_id', user.id)
      
      results.parent_links = { data: links, error: error?.message }
    } catch (e) {
      results.parent_links = { error: e instanceof Error ? e.message : 'Unknown error' }
    }

    // Test student_profile table
    try {
      const { data: studentProfiles, error } = await supabase
        .from('student_profile')
        .select('*')
        .limit(5)
      
      results.student_profile = { data: studentProfiles, error: error?.message }
    } catch (e) {
      results.student_profile = { error: e instanceof Error ? e.message : 'Unknown error' }
    }

    return NextResponse.json({ 
      user_id: user.id,
      results 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 