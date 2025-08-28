"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getStudentApplication, ParentApplication } from '@/lib/services/parentService'
import { postParentNote } from '@/lib/services/parentService'

export default function ParentApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<ParentApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [noteError, setNoteError] = useState<string | null>(null)

  const studentId = params.studentId as string
  const applicationId = params.id as string

  useEffect(() => {
    loadApplication()
  }, [applicationId])

  const loadApplication = async () => {
    try {
      setLoading(true)
      const result = await getStudentApplication(applicationId)
      
      if (result.error) {
        setError(result.error)
      } else if (result.application) {
        setApplication(result.application)
      }
    } catch (e) {
      setError('Failed to load application')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitNote = async () => {
    if (!note.trim()) return
    setSaving(true)
    setNoteError(null)
    const { error } = await postParentNote(applicationId, note.trim())
    setSaving(false)
    if (error) setNoteError(error)
    else {
      setNote('')
      // Optionally refresh the page or show success message
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED': return 'text-gray-500 bg-gray-100'
      case 'IN_PROGRESS': return 'text-yellow-700 bg-yellow-100'
      case 'SUBMITTED': return 'text-blue-700 bg-blue-100'
      case 'UNDER_REVIEW': return 'text-purple-700 bg-purple-100'
      case 'ACCEPTED': return 'text-green-700 bg-green-100'
      case 'WAITLISTED': return 'text-orange-700 bg-orange-100'
      case 'REJECTED': return 'text-red-700 bg-red-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading application...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !application) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">Error loading application</div>
            <div className="text-sm text-muted-foreground">{error}</div>
            <button
              onClick={() => router.push(`/parent/students/${studentId}/applications`)}
              className="mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Applications
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {application.university?.name || 'University'} Application
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Application details for {application.student?.first_name} {application.student?.last_name}
            </p>
          </div>
          <button
            onClick={() => router.push(`/parent/students/${studentId}/applications`)}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back to Applications
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Application Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                    {formatStatus(application.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Application Type:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {application.application_type ? application.application_type.replace('_', ' ') : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Deadline:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {application.deadline ? new Date(application.deadline).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
                {application.submitted_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Submitted:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(application.submitted_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {application.decision_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Decision Date:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(application.decision_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {application.decision_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Decision:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {application.decision_type}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {application.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Student Notes
                </h2>
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {application.notes}
                </div>
              </div>
            )}

            {/* Send Note to Student */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Send Note to Student
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Send a message to {application.student?.first_name} about this application. 
                The note will appear in their notifications.
              </p>
              <textarea
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Write your note here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              {noteError && (
                <div className="text-red-600 text-sm mt-2">{noteError}</div>
              )}
              <div className="mt-3 flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSubmitNote}
                  disabled={saving || !note.trim()}
                >
                  {saving ? 'Sending...' : 'Send Note'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* University Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                University Information
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {application.university?.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {application.university?.city}, {application.university?.state}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {application.university?.country}
                  </p>
                </div>
                {application.university?.us_news_ranking && (
                  <div>
                    <span className="text-sm text-gray-500">US News Ranking:</span>
                    <span className="ml-2 text-sm font-medium">
                      #{application.university.us_news_ranking} in National Universities
                    </span>
                  </div>
                )}
                {application.university?.acceptance_rate && (
                  <div>
                    <span className="text-sm text-gray-500">Acceptance Rate:</span>
                    <span className="ml-2 text-sm font-medium">
                      {(application.university.acceptance_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Application Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Application Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <span className="text-gray-500">Application created</span>
                  <span className="ml-auto text-gray-900 dark:text-white">
                    {new Date(application.created_at).toLocaleDateString()}
                  </span>
                </div>
                {application.submitted_date && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-500">Application submitted</span>
                    <span className="ml-auto text-gray-900 dark:text-white">
                      {new Date(application.submitted_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {application.decision_date && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-500">Decision received</span>
                    <span className="ml-auto text-gray-900 dark:text-white">
                      {new Date(application.decision_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
