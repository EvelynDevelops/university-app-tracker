import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'parent') {
      return NextResponse.json({ error: 'Access denied - parent role required' }, { status: 403 })
    }

    // Get all student profiles
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, email')
      .eq('role', 'student')

    if (studentsError) {
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    if (!students || students.length === 0) {
      return NextResponse.json({ error: 'No students found' }, { status: 404 })
    }

    // Create parent link with the first student
    const firstStudent = students[0]
    const { error: linkError } = await supabase
      .from('parent_links')
      .insert({
        parent_user_id: user.id,
        student_user_id: firstStudent.user_id
      })

    if (linkError) {
      return NextResponse.json({ 
        error: 'Failed to create parent link',
        details: linkError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: `Linked to student: ${firstStudent.first_name} ${firstStudent.last_name}`,
      student: firstStudent
    })

  } catch (error) {
    console.error('Error in create test data API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 