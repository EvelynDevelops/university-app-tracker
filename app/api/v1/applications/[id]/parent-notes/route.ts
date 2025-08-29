import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseServer()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const applicationId = params.id

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role === 'parent') {
      // For parents: get notes they've written for this application
      const { data: notes, error } = await supabase
        .from('parent_notes')
        .select(`
          *,
          applications (
            student_id
          )
        `)
        .eq('application_id', applicationId)
        .eq('parent_user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
      }

      return NextResponse.json({ notes: notes || [] })
    } else if (profile?.role === 'student') {
      // For students: get all parent notes for this application
      const { data: notes, error } = await supabase
        .from('parent_notes')
        .select(`
          *,
          profiles!parent_notes_parent_user_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
      }

      return NextResponse.json({ notes: notes || [] })
    } else {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

  } catch (error) {
    console.error('Error in parent notes API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 