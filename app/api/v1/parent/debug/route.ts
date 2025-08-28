import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const debugInfo: any = {
      user_id: user.id,
      user_email: user.email,
      timestamp: new Date().toISOString()
    }

    // Test 1: Get user profile
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      debugInfo.profile = {
        success: !error,
        data: profile,
        error: error?.message
      }
    } catch (e) {
      debugInfo.profile = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      }
    }

    // Test 2: Check if user is parent
    if (debugInfo.profile?.success && debugInfo.profile.data) {
      debugInfo.is_parent = debugInfo.profile.data.role === 'parent'
    }

    // Test 3: Get parent links (only if parent)
    if (debugInfo.is_parent) {
      try {
        const { data: links, error } = await supabase
          .from('parent_links')
          .select('student_user_id')
          .eq('parent_user_id', user.id)
        
        debugInfo.parent_links = {
          success: !error,
          data: links,
          error: error?.message,
          count: links?.length || 0
        }
      } catch (e) {
        debugInfo.parent_links = {
          success: false,
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    }

    // Test 4: Get all profiles (for debugging)
    try {
      const { data: allProfiles, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, role')
        .limit(10)
      
      debugInfo.all_profiles = {
        success: !error,
        data: allProfiles,
        error: error?.message,
        count: allProfiles?.length || 0
      }
    } catch (e) {
      debugInfo.all_profiles = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      }
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 