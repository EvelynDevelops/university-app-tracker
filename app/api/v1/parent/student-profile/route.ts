import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a parent
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'parent') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get linked students
    const { data: links, error: linksError } = await supabase
      .from('parent_links')
      .select('student_user_id')
      .eq('parent_user_id', user.id)

    if (linksError) {
      console.error('Parent links error:', linksError)
      return NextResponse.json({ error: 'Failed to fetch linked students' }, { status: 500 })
    }

    if (!links || links.length === 0) {
      return NextResponse.json({ error: 'No students linked to your account' }, { status: 404 })
    }

    // Get the first linked student's data
    const studentId = links[0].student_user_id

    // Get student profile
    const { data: studentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, email')
      .eq('user_id', studentId)
      .single()

    if (profileError || !studentProfile) {
      console.error('Student profile error:', profileError)
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // Get student academic profile
    const { data: academicProfile, error: academicError } = await supabase
      .from('student_profile')
      .select('graduation_year, gpa, sat_score, act_score, target_countries, intended_majors')
      .eq('user_id', studentId)
      .maybeSingle()

    if (academicError) {
      console.error('Academic profile error:', academicError)
      // Continue without academic profile
    }



    // Get student files
    const prefix = `${studentId}/`
    const { data: files } = await supabase.storage.from('student_files').list(prefix)
    
    const toItem = (objName: string, kind: 'essay' | 'transcript') => {
      const display = objName.replace(new RegExp(`^${kind}-`), '')
      const { data } = supabase.storage.from('student_files').getPublicUrl(prefix + objName)
      return { name: display, url: data.publicUrl, objectName: objName }
    }
    
    const essayItems = (files || []).filter(f => f.name.startsWith('essay-')).map(f => toItem(f.name, 'essay'))
    const transcriptItems = (files || []).filter(f => f.name.startsWith('transcript-')).map(f => toItem(f.name, 'transcript'))

    return NextResponse.json({
      student: {
        ...studentProfile,
        academicProfile: academicProfile || null,
        files: {
          essays: essayItems,
          transcripts: transcriptItems
        }
      }
    })

  } catch (error) {
    console.error('Error in student profile API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 