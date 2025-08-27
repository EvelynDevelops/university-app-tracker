"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { supabaseBrowser } from '@/lib/supabase/helpers'

 type Message = {
  id: string
  created_at: string
  author_role: 'parent' | 'student' | 'counselor'
  content: string
}

export default function ParentMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        setError(null)
        const supabase = supabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setMessages([])
          return
        }
        // 假设 messages 表含有 receiver_id 指向学生
        const { data, error } = await supabase
          .from('messages')
          .select('id, created_at, author_role, content')
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: false })
        if (error) throw error
        setMessages((data || []) as Message[])
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load messages')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Parent Messages</h1>
        {loading && <div className="text-gray-600 dark:text-gray-400">Loading...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {!loading && !error && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            {messages.length === 0 ? (
              <div className="p-6 text-gray-600 dark:text-gray-400">No messages yet.</div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {messages.map((m) => (
                  <li key={m.id} className="p-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {new Date(m.created_at).toLocaleString()} · {m.author_role}
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{m.content}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}