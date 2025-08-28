"use client"

import { useEffect, useMemo, useState } from 'react'
import { getApplications, Application } from '@/lib/services/applicationService'

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0) }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

export default function DeadlinesMiniCalendar() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState<Date>(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  useEffect(() => {
    (async () => {
      const { applications } = await getApplications()
      setApps(applications)
      setLoading(false)
    })()
  }, [])

  const monthMatrix = useMemo(() => {
    const first = startOfMonth(cursor)
    const last = endOfMonth(cursor)
    const startWeekIndex = first.getDay() // 0 sun
    const days: Date[] = []
    for (let i = 0; i < startWeekIndex; i++) days.push(addDays(first, i - startWeekIndex))
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(cursor.getFullYear(), cursor.getMonth(), d))
    const remain = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remain; i++) days.push(addDays(last, i))
    return Array.from({ length: Math.ceil(days.length / 7) }, (_, w) => days.slice(w * 7, w * 7 + 7))
  }, [cursor])

  const deadlinesByDay = useMemo(() => {
    const map: Record<string, Application[]> = {}
    for (const a of apps) {
      if (!a.deadline) continue
      const d = new Date(a.deadline as any)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(a)
    }
    return map
  }, [apps])

  const monthLabel = cursor.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  if (loading) {
    return <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">Loading calendar...</div>
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">Deadlines Calendar</div>
        <div className="flex items-center gap-2 text-sm">
          <button className="px-2 py-1 border rounded-md" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>Prev</button>
          <div className="min-w-[140px] text-center">{monthLabel}</div>
          <button className="px-2 py-1 border rounded-md" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>Next</button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {monthMatrix.flat().map((d, idx) => {
          const inMonth = d.getMonth() === cursor.getMonth()
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
          const has = deadlinesByDay[key]?.length || 0
          const isSel = selectedDay && isSameDay(selectedDay, d)
          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(d)}
              className={`h-16 rounded-md border text-xs flex flex-col items-center justify-between p-1 ${inMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'} ${isSel ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="self-end pr-1 pt-1">{d.getDate()}</div>
              <div className="pb-1">
                {has > 0 && (
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] ${has>=3?'bg-red-500':has===2?'bg-amber-500':'bg-blue-500'} text-white`}>{has}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
      {selectedDay && (() => {
        const key = `${selectedDay.getFullYear()}-${selectedDay.getMonth()}-${selectedDay.getDate()}`
        const list = deadlinesByDay[key] || []
        return (
          <div className="mt-3">
            <div className="text-xs font-medium mb-1">{selectedDay.toLocaleDateString()} · {list.length} deadline(s)</div>
            <ul className="space-y-1 text-sm">
              {list.map(app => (
                <li key={app.id} className="flex items-center justify-between border rounded-md px-2 py-1">
                  <div className="truncate">{app.university?.name || 'Unknown University'}</div>
                  <div className="text-xs text-gray-500">{app.application_type?.replace('_',' ') || ''}</div>
                </li>
              ))}
            </ul>
          </div>
        )
      })()}
    </div>
  )
}

