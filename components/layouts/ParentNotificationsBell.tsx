"use client"

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/helpers'

interface ParentNotification {
  id: string
  type: 'student_message' | 'application_update'
  title: string
  message: string
  date: string
  student_name: string
}

export default function ParentNotificationsBell() {
  const [notifications, setNotifications] = useState<ParentNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Get parent notes for this parent
      const { data: parentNotes, error } = await supabase
        .from('parent_notes')
        .select(`
          id,
          note,
          created_at,
          applications (
            id,
            profiles!applications_student_id_fkey (
              first_name,
              last_name
            )
          )
        `)
        .eq('parent_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error loading notifications:', error)
        return
      }

      const formattedNotifications: ParentNotification[] = (parentNotes || []).map(note => ({
        id: note.id,
        type: 'student_message',
        title: 'Student Response',
        message: note.note,
        date: note.created_at,
        student_name: `${note.applications?.profiles?.first_name || ''} ${note.applications?.profiles?.last_name || ''}`.trim()
      }))

      setNotifications(formattedNotifications)
      setUnreadCount(formattedNotifications.length) // For demo, consider all as unread
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Parent Notifications
            </h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </span>
                          {notification.student_name && (
                            <span className="text-xs text-gray-500">
                              from {notification.student_name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setUnreadCount(0)
                  setIsOpen(false)
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
} 