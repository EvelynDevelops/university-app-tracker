"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getNotifications, NotificationItem } from '@/lib/services/notificationService'

export default function NotificationsBell() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    (async () => {
      const { items, unread } = await getNotifications()
      setItems(items.slice(0, 5))
      setUnread(unread)
    })()
  }, [])

  return (
    <div className="relative">
      <button
        className="relative w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span className="sr-only">Notifications</span>
        <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-2 z-50"
             onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
          <div className="text-sm font-semibold px-2 py-1">Notifications</div>
          {items.length === 0 ? (
            <div className="text-xs text-gray-500 px-2 py-3">No notifications</div>
          ) : (
            <ul className="max-h-64 overflow-auto">
              {items.map(n => (
                <li key={n.id} className="px-2 py-2 text-sm border-b last:border-0 border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate mr-2">{n.title}</div>
                    <div className="text-[10px] text-gray-500">{new Date(n.date).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{n.message}</div>
                </li>
              ))}
            </ul>
          )}
          <div className="px-2 pt-2 text-right">
            <Link href="/student/notifications" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
        </div>
      )}
    </div>
  )
}