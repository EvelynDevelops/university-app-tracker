import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseServer()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only parents can post notes (optional role check)
    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
    if (profile?.role !== 'parent') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { application_id, note } = body || {}
    if (!application_id || !note) return NextResponse.json({ error: 'application_id and note are required' }, { status: 400 })

    // Verify parent has access to this application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('student_id')
      .eq('id', application_id)
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if parent is linked to the student
    const { data: link, error: linkError } = await supabase
      .from('parent_links')
      .select('student_user_id')
      .eq('parent_user_id', user.id)
      .eq('student_user_id', application.student_id)
      .maybeSingle()

    if (linkError || !link) {
      return NextResponse.json({ error: 'Access denied to this application' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('parent_notes')
      .insert({ application_id, parent_user_id: user.id, note })
      .select()
      .single()
    if (error) return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

