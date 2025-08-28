"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getNotifications, NotificationItem } from '@/lib/services/notificationService'

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const { items, error } = await getNotifications()
      if (error) setError(error)
      setItems(items)
      setLoading(false)
    })()
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No notifications yet.</div>
        ) : (
          <ul className="space-y-3">
            {items.map(n => (
              <li key={n.id} className="border rounded-md p-3 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-gray-500">{new Date(n.date).toLocaleString()}</div>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{n.message}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  )
}