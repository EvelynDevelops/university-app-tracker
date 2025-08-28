import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(_req: NextRequest) {
  try {
    const supabase = supabaseServer()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // fetch student applications
    const { data: apps, error: appsErr } = await supabase
      .from('applications')
      .select('id, university_id, deadline, status, universities(name)')
      .eq('student_id', user.id)

    if (appsErr) return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })

    const appIds = (apps || []).map(a => a.id)
    let parentNotes: any[] = []
    if (appIds.length) {
      const { data, error } = await supabase
        .from('parent_notes')
        .select('id, application_id, note, created_at')
        .in('application_id', appIds)
        .order('created_at', { ascending: false })
      if (!error && data) parentNotes = data
    }

    // deadline notifications: within 14 days
    const today = new Date(); today.setHours(0,0,0,0)
    const twoWeeks = new Date(today); twoWeeks.setDate(twoWeeks.getDate() + 14)
    const deadlineNotifs = (apps || [])
      .filter(a => a.deadline)
      .filter(a => {
        const d = new Date(a.deadline as any)
        return d >= today && d <= twoWeeks
      })
      .map(a => ({
        id: `dl-${a.id}`,
        type: 'deadline',
        title: a.universities?.name || 'University',
        message: 'Upcoming deadline',
        date: a.deadline,
        application_id: a.id
      }))

    const parentNotifs = parentNotes.map(n => ({
      id: `pn-${n.id}`,
      type: 'parent',
      title: 'New message from parent',
      message: n.note,
      date: n.created_at,
      application_id: n.application_id
    }))

    const items = [...parentNotifs, ...deadlineNotifs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ data: items, unread: items.length })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

