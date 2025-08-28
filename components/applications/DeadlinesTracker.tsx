"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getApplications, Application } from '@/lib/services/applicationService'

function daysUntil(dateStr?: string) {
  if (!dateStr) return Infinity
  const today = new Date()
  const d = new Date(dateStr)
  const diff = Math.ceil((d.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

function dateParts(dateStr?: string) {
  if (!dateStr) return { month: '', day: '', weekday: '' }
  const d = new Date(dateStr)
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const day = String(d.getDate()).padStart(2, '0')
  const weekday = d.toLocaleString('en-US', { weekday: 'short' })
  return { month, day, weekday }
}

function urgencyClasses(days: number) {
  if (days < 0) return {
    ring: 'ring-2 ring-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-600 text-white'
  }
  if (days <= 3) return {
    ring: 'ring-2 ring-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-500 text-white'
  }
  if (days <= 7) return {
    ring: 'ring-2 ring-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-500 text-white'
  }
  if (days <= 30) return {
    ring: 'ring-2 ring-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    badge: 'bg-yellow-500 text-white'
  }
  return {
    ring: 'ring-1 ring-gray-200 dark:ring-gray-700',
    bg: 'bg-gray-50 dark:bg-gray-900',
    text: 'text-gray-700 dark:text-gray-300',
    badge: 'bg-gray-600 text-white'
  }
}

export default function DeadlinesTracker() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const { applications, error } = await getApplications()
        if (error) setError(error)
        setApplications(applications)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const upcoming = useMemo(() => {
    const withDays = applications
      .filter(a => !!a.deadline)
      .map(a => ({ ...a, days: daysUntil(a.deadline as any) }))
      .filter(a => a.days !== Infinity)
      .sort((a, b) => a.days - b.days)
    return {
      next3: withDays.slice(0, 3),
      overdue: withDays.filter(a => a.days < 0),
      within7: withDays.filter(a => a.days >= 0 && a.days <= 7),
      within30: withDays.filter(a => a.days > 7 && a.days <= 30),
    }
  }, [applications])

  if (loading) return <div className="rounded-lg border border-border p-4">Loading deadlines...</div>
  if (error) return <div className="rounded-lg border border-border p-4 text-red-600">{error}</div>

  return (
    <div className="rounded-lg border border-border p-4 bg-white dark:bg-gray-800">
      <div className="mb-2">
        <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
        <p className="text-sm text-gray-500">Stay on top of your next deadlines</p>
      </div>

      {upcoming.next3.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Next up</div>
          <div className="grid md:grid-cols-3 gap-3">
            {upcoming.next3.map(app => {
              const parts = dateParts(app.deadline as any)
              const styles = urgencyClasses(app.days)
              return (
                <div
                  key={app.id}
                  className={`rounded-md border border-gray-200 dark:border-gray-700 p-3 flex gap-3 items-center cursor-pointer hover:shadow-sm transition-shadow ${styles.ring}`}
                  onClick={() => router.push(`/student/applications/${app.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/student/applications/${app.id}`) }}
                >
                  {/* Calendar badge */}
                  <div className={`flex flex-col items-center justify-center w-16 rounded-md overflow-hidden ${styles.bg}`}>
                    <div className={`w-full text-[10px] uppercase tracking-wider py-1 ${styles.badge} text-center`}>{parts.month}</div>
                    <div className="text-2xl font-extrabold leading-tight py-1">{parts.day}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 pb-1">{parts.weekday}</div>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{app.university?.name || 'Unknown University'}</div>
                    <div className={`text-xs ${styles.text}`}>{app.days < 0 ? `${Math.abs(app.days)} days overdue` : `${app.days} days left`}</div>
                    <div className="text-xs mt-1 text-gray-600 dark:text-gray-400 truncate">{app.application_type || 'Type N/A'}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}