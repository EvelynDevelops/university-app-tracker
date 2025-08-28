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

    // deadline notifications: 30 / 15 / 7 days before; and daily within last 7 days
    const today = new Date(); today.setHours(0,0,0,0)
    const deadlineNotifs: any[] = []
    for (const a of (apps || [])) {
      if (!a.deadline) continue
      const d = new Date(a.deadline as any)
      const msDiff = d.getTime() - today.getTime()
      const days = Math.ceil(msDiff / (1000*60*60*24))
      if (days < 0) continue // skip overdue for this rule
      const uniField: any = (a as any).universities
      const uniName = Array.isArray(uniField) ? uniField[0]?.name : uniField?.name

      // Daily reminders within 7 days (including today)
      if (days <= 7) {
        deadlineNotifs.push({
          id: `dl-daily-${a.id}-${days}`,
          type: 'deadline',
          title: uniName || 'University',
          message: days === 0 ? 'Deadline today' : `Deadline in ${days} day${days>1?'s':''}`,
          date: a.deadline,
          application_id: a.id
        })
        continue
      }

      // Milestones at 30/15/7 (7 handled above by daily)
      if (days === 30 || days === 15) {
        deadlineNotifs.push({
          id: `dl-milestone-${a.id}-${days}`,
          type: 'deadline',
          title: uniName || 'University',
          message: `Deadline in ${days} days`,
          date: a.deadline,
          application_id: a.id
        })
      }
    }

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

