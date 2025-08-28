"use client"

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { postParentNote } from '@/lib/services/parentService'

export default function ParentAppNotePage() {
  const params = useParams()
  const router = useRouter()
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applicationId = params.id as string

  const handleSubmit = async () => {
    if (!note.trim()) return
    setSaving(true)
    setError(null)
    const { error } = await postParentNote(applicationId, note.trim())
    setSaving(false)
    if (error) setError(error)
    else {
      setNote('')
      router.push('/student/notifications')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Send a Note to Student</h1>
        <p className="text-sm text-gray-600 mb-4">This note will appear in the student's notifications for the selected application.</p>
        <textarea className="w-full border rounded-md p-3 h-40" placeholder="Write your note here..." value={note} onChange={(e)=>setNote(e.target.value)} />
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        <div className="mt-3 flex justify-end">
          <button className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50" onClick={handleSubmit} disabled={saving}>{saving? 'Sending...':'Send Note'}</button>
        </div>
      </div>
    </DashboardLayout>
  )
}
