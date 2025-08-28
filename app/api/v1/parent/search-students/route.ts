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

    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Search for student by email
    const { data: students, error: searchError } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, email, role')
      .eq('email', email.trim())
      .eq('role', 'student')

    if (searchError) {
      return NextResponse.json({ error: 'Failed to search for student' }, { status: 500 })
    }

    if (!students || students.length === 0) {
      return NextResponse.json({ error: 'No student found with this email address' }, { status: 404 })
    }

    // Check if already linked
    const studentIds = students.map(s => s.user_id)
    const { data: existingLinks } = await supabase
      .from('parent_links')
      .select('student_user_id')
      .eq('parent_user_id', user.id)
      .in('student_user_id', studentIds)

    const linkedIds = new Set(existingLinks?.map(l => l.student_user_id) || [])
    const unlinkedStudents = students.filter(s => !linkedIds.has(s.user_id))

    if (unlinkedStudents.length === 0) {
      return NextResponse.json({ error: 'This student is already linked to your account' }, { status: 409 })
    }

    return NextResponse.json({ 
      students: unlinkedStudents.map(s => ({
        user_id: s.user_id,
        first_name: s.first_name,
        last_name: s.last_name,
        email: s.email
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 