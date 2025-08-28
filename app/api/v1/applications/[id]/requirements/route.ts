import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

// Upsert requirement progress for an application
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id
    const body = await request.json()
    const { requirement_id, status } = body as { requirement_id: string; status: 'not_started' | 'in_progress' | 'completed' }

    if (!requirement_id || !status) {
      return NextResponse.json({ error: 'requirement_id and status are required' }, { status: 400 })
    }

    const supabase = supabaseServer()

    // Try update first
    const { data: existing, error: findErr } = await supabase
      .from('application_requirement_progress')
      .select('id')
      .eq('application_id', applicationId)
      .eq('requirement_id', requirement_id)
      .maybeSingle()

    if (findErr) {
      console.error(findErr)
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
    }

    if (existing) {
      const { data, error } = await supabase
        .from('application_requirement_progress')
        .update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
      return NextResponse.json({ data })
    }

    const { data, error } = await supabase
      .from('application_requirement_progress')
      .insert({ application_id: applicationId, requirement_id, status, completed_at: status === 'completed' ? new Date().toISOString() : null })
      .select()
      .single()
    if (error) return NextResponse.json({ error: 'Failed to create progress' }, { status: 500 })
    return NextResponse.json({ data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

