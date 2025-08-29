import { NextRequest, NextResponse } from 'next/server'
import { supabaseBrowser } from '@/lib/supabase/helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseBrowser()
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

        // Test 4: Get student profiles for linked students
        if (links && links.length > 0) {
          const studentIds = links.map(l => l.student_user_id)
          const { data: studentProfiles, error: studentError } = await supabase
            .from('profiles')
            .select('user_id, first_name, last_name, email, role')
            .in('user_id', studentIds)

          debugInfo.student_profiles = {
            success: !studentError,
            data: studentProfiles,
            error: studentError?.message,
            count: studentProfiles?.length || 0
          }

          // Test 5: Get academic profiles for these students
          const { data: academicProfiles, error: academicError } = await supabase
            .from('student_profile')
            .select('*')
            .in('user_id', studentIds)

          debugInfo.academic_profiles = {
            success: !academicError,
            data: academicProfiles,
            error: academicError?.message,
            count: academicProfiles?.length || 0
          }
        }
      } catch (e) {
        debugInfo.parent_links = {
          success: false,
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    }

    // Test 6: Get all student profiles (for debugging)
    try {
      const { data: allStudentProfiles, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, role')
        .eq('role', 'student')
        .limit(10)
      
      debugInfo.all_student_profiles = {
        success: !error,
        data: allStudentProfiles,
        error: error?.message,
        count: allStudentProfiles?.length || 0
      }
    } catch (e) {
      debugInfo.all_student_profiles = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      }
    }

    // Test 7: Get all academic profiles (for debugging)
    try {
      const { data: allAcademicProfiles, error } = await supabase
        .from('student_profile')
        .select('*')
        .limit(10)
      
      debugInfo.all_academic_profiles = {
        success: !error,
        data: allAcademicProfiles,
        error: error?.message,
        count: allAcademicProfiles?.length || 0
      }
    } catch (e) {
      debugInfo.all_academic_profiles = {
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