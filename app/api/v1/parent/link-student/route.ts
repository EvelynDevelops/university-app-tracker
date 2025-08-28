import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

    const { studentId } = await request.json()

    if (!studentId || typeof studentId !== 'string') {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    // Verify student exists and is actually a student
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('user_id, role')
      .eq('user_id', studentId)
      .eq('role', 'student')
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if already linked
    const { data: existingLink } = await supabase
      .from('parent_links')
      .select('student_user_id')
      .eq('parent_user_id', user.id)
      .eq('student_user_id', studentId)
      .single()

    if (existingLink) {
      return NextResponse.json({ error: 'Student is already linked to your account' }, { status: 409 })
    }

    // Create the link
    const { error: linkError } = await supabase
      .from('parent_links')
      .insert({
        parent_user_id: user.id,
        student_user_id: studentId
      })

    if (linkError) {
      return NextResponse.json({ error: 'Failed to link student account' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Student account linked successfully'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 