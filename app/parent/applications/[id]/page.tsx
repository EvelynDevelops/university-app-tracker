"use client"
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { supabaseBrowser } from '@/lib/supabase/helpers'

interface Application {
  id: string
  student_id: string
  university_id: string
  application_type: string | null
  deadline: string | null
  status: string
  notes: string | null
  submitted_date: string | null
  decision_date: string | null
  universities: {
    id: string
    name: string
    city: string
    state: string
    country: string
    us_news_ranking: number | null
    acceptance_rate: number | null
  } | null
  student_name: string
}

export default function ParentApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.id as string
  
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [sendingNote, setSendingNote] = useState(false)
  const [parentNotes, setParentNotes] = useState<any[]>([])
  const [loadingNotes, setLoadingNotes] = useState(false)

  useEffect(() => {
    loadApplication()
    loadParentNotes()
  }, [applicationId])

  const loadApplication = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // First check if user is a parent and has access to this application
      const { data: parentLinks } = await supabase
        .from('parent_links')
        .select('student_user_id')
        .eq('parent_user_id', user.id)

      if (!parentLinks || parentLinks.length === 0) {
        setError('Access denied')
        return
      }

      const studentIds = parentLinks.map(link => link.student_user_id)

      // Get the application
      const { data: app, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          universities (
            id, name, city, state, country, us_news_ranking, acceptance_rate
          )
        `)
        .eq('id', applicationId)
        .in('student_id', studentIds)
        .single()

      if (appError || !app) {
        setError('Application not found or access denied')
        return
      }

      // Get student name
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', app.student_id)
        .single()

      setApplication({
        ...app,
        student_name: studentProfile 
          ? `${studentProfile.first_name} ${studentProfile.last_name}`
          : 'Unknown Student'
      })
    } catch (e) {
      console.error('Error loading application:', e)
      setError('Failed to load application')
    } finally {
      setLoading(false)
    }
  }

  const loadParentNotes = async () => {
    try {
      setLoadingNotes(true)
      const response = await fetch(`/api/v1/applications/${applicationId}/parent-notes`)
      const data = await response.json()
      
      if (response.ok) {
        setParentNotes(data.notes || [])
      }
    } catch (e) {
      console.error('Error loading parent notes:', e)
    } finally {
      setLoadingNotes(false)
    }
  }

  const sendNote = async () => {
    if (!note.trim() || !application) return

    try {
      setSendingNote(true)
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('parent_notes')
        .insert({
          parent_user_id: user.id,
          application_id: application.id,
          note: note.trim()
        })

      if (error) {
        console.error('Error sending note:', error)
        return
      }

      setNote('')
      // Reload notes after sending
      await loadParentNotes()
    } catch (e) {
      console.error('Error sending note:', e)
    } finally {
      setSendingNote(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'UNDER_REVIEW':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'WAITLISTED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
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
            <div className="text-red-600 mb-4">{error || 'Application not found'}</div>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← Back to Applications
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Application Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {application.student_name} - {application.universities?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Application Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Application Status
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
                    {formatStatus(application.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Application Type:</span>
                  <span className="text-gray-900 dark:text-white">
                    {application.application_type 
                      ? application.application_type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                      : 'Not set'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Deadline:</span>
                  <span className="text-gray-900 dark:text-white">
                    {application.deadline 
                      ? new Date(application.deadline).toLocaleDateString()
                      : 'Not set'
                    }
                  </span>
                </div>
                {application.submitted_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Submitted:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(application.submitted_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {application.decision_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Decision Date:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(application.decision_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Student Notes */}
            {application.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Student Notes
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {application.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Send Note to Student */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Send Note to Student
              </h2>
              <div className="space-y-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write a message to your child..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={4}
                />
                <button
                  onClick={sendNote}
                  disabled={!note.trim() || sendingNote}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingNote ? 'Sending...' : 'Send Note'}
                </button>
              </div>
            </div>

            {/* Parent Notes History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Notes History
              </h2>
              {loadingNotes ? (
                <div className="text-gray-600 dark:text-gray-400">Loading notes...</div>
              ) : parentNotes.length > 0 ? (
                <div className="space-y-4">
                  {parentNotes.map((note) => (
                    <div key={note.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {note.note}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-400">
                  No notes sent yet.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* University Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                University Information
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {application.universities?.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {application.universities?.city && application.universities?.state 
                      ? `${application.universities.city}, ${application.universities.state}`
                      : application.universities?.country || 'Unknown'
                    }
                  </p>
                </div>
                {application.universities?.us_news_ranking && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">US News Ranking:</span>
                    <span className="text-gray-900 dark:text-white">
                      #{application.universities.us_news_ranking}
                    </span>
                  </div>
                )}
                {application.universities?.acceptance_rate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Acceptance Rate:</span>
                    <span className="text-gray-900 dark:text-white">
                      {(application.universities.acceptance_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Application Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Application Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Application Started</div>
                    <div className="text-xs text-gray-500">When student added this application</div>
                  </div>
                </div>
                {application.submitted_date && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Application Submitted</div>
                      <div className="text-xs text-gray-500">
                        {new Date(application.submitted_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
                {application.decision_date && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Decision Received</div>
                      <div className="text-xs text-gray-500">
                        {new Date(application.decision_date).toLocaleDateString()}
                      </div>
                    </div>
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