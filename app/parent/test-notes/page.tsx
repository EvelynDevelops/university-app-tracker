"use client"

import { useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'

export default function TestNotesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [applicationId, setApplicationId] = useState('')
  const [note, setNote] = useState('')

  const sendNote = async () => {
    if (!applicationId.trim() || !note.trim()) {
      setResult({ error: 'Please provide both application ID and note' })
      return
    }

    try {
      setLoading(true)
      setResult(null)
      
      const response = await fetch('/api/v1/parent/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          application_id: applicationId.trim(),
          note: note.trim()
        })
      })
      
      const data = await response.json()
      setResult({ status: response.status, data })
      
      if (response.ok) {
        setNote('')
      }
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const getNotes = async () => {
    if (!applicationId.trim()) {
      setResult({ error: 'Please provide application ID' })
      return
    }

    try {
      setLoading(true)
      setResult(null)
      
      const response = await fetch(`/api/v1/applications/${applicationId.trim()}/parent-notes`)
      const data = await response.json()
      
      setResult({ status: response.status, data })
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Test Parent Notes</h1>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Send Note</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Application ID
                </label>
                <input
                  type="text"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  placeholder="Enter application ID"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write your note..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={sendNote} 
                  disabled={loading || !applicationId.trim() || !note.trim()}
                  className="px-6"
                >
                  {loading ? 'Sending...' : 'Send Note'}
                </Button>
                <Button 
                  onClick={getNotes} 
                  disabled={loading || !applicationId.trim()}
                  variant="outline"
                  className="px-6"
                >
                  {loading ? 'Loading...' : 'Get Notes'}
                </Button>
              </div>
            </div>
          </div>

          {result && (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
} 