export interface NotificationItem {
  id: string
  type: 'parent' | 'deadline'
  title: string
  message: string
  date: string
  application_id?: string
}

export async function getNotifications(): Promise<{ items: NotificationItem[]; unread: number; error?: string }> {
  try {
    const res = await fetch('/api/v1/student/notifications')
    if (!res.ok) return { items: [], unread: 0, error: `HTTP ${res.status}` }
    const data = await res.json()
    return { items: data.data || [], unread: data.unread || 0 }
  } catch (e: any) {
    return { items: [], unread: 0, error: e?.message ?? 'Failed to load notifications' }
  }
}