"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getStudentApplications, ParentApplication } from '@/lib/services/parentService'
import { supabaseBrowser } from '@/lib/supabase/helpers'

export default function ParentStudentApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const [studentName, setStudentName] = useState<string>('')
  const [applications, setApplications] = useState<ParentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const studentId = params.studentId as string

  useEffect(() => {
    loadStudentInfo()
    loadApplications()
  }, [studentId])

  const loadStudentInfo = async () => {
    try {
      const supabase = supabaseBrowser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', studentId)
        .single()
      
      if (profile) {
        setStudentName(`${profile.first_name} ${profile.last_name}`)
      }
    } catch (e) {
      // no-op
    }
  }

  const loadApplications = async () => {
    try {
      setLoading(true)
      const result = await getStudentApplications(studentId)
      
      if (result.error) {
        setError(result.error)
      } else if (result.applications) {
        setApplications(result.applications)
      }
    } catch (e) {
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationClick = (applicationId: string) => {
    router.push(`/parent/students/${studentId}/applications/${applicationId}`)
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

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {studentName || 'Student'}'s Applications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor application progress and provide support
            </p>
          </div>
          <button
            onClick={() => router.push('/parent/dashboard')}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading applications...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">Error loading applications</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">No applications found</div>
            <div className="text-sm text-muted-foreground">
              {studentName || 'Student'} hasn't added any universities to their application list yet
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-2xl font-bold">{applications.length}</div>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                <div className="text-xs text-gray-500">In Progress</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {applications.filter(a => a.status === 'IN_PROGRESS').length}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                <div className="text-xs text-gray-500">Submitted</div>
                <div className="text-2xl font-bold text-blue-600">
                  {applications.filter(a => a.status === 'SUBMITTED').length}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                <div className="text-xs text-gray-500">Under Review</div>
                <div className="text-2xl font-bold text-purple-600">
                  {applications.filter(a => a.status === 'UNDER_REVIEW').length}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                <div className="text-xs text-gray-500">Accepted</div>
                <div className="text-2xl font-bold text-green-600">
                  {applications.filter(a => a.status === 'ACCEPTED').length}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                <div className="text-xs text-gray-500">Due in 7 days</div>
                <div className="text-2xl font-bold text-amber-600">
                  {applications.filter(a => 
                    a.deadline && 
                    (new Date(a.deadline).getTime() - new Date().setHours(0,0,0,0)) / (1000*60*60*24) <= 7 && 
                    (new Date(a.deadline).getTime() - new Date().setHours(0,0,0,0)) / (1000*60*60*24) >= 0
                  ).length}
                </div>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Application Details
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        University
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        onClick={() => handleApplicationClick(app.id)}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {app.university?.name || 'Unknown University'}
                          </div>
                          {app.university?.us_news_ranking && (
                            <div className="text-sm text-gray-500">
                              #{app.university.us_news_ranking} in National Universities
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {app.university?.city}, {app.university?.state}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.university?.country}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {app.deadline ? new Date(app.deadline).toLocaleDateString() : 'Not set'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                            {formatStatus(app.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {app.application_type ? app.application_type.replace('_', ' ') : 'Not set'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
