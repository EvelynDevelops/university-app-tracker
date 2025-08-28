"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Student } from '@/lib/services/parentService'
import { supabaseBrowser } from '@/lib/supabase/helpers'

interface ParentApplication {
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
  } | null
  student_name: string
}

interface ParentApplicationTableProps {
  students: Student[]
}

export default function ParentApplicationTable({ students }: ParentApplicationTableProps) {
  const router = useRouter()
  const [applications, setApplications] = useState<ParentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (students.length > 0) {
      loadAllApplications()
    }
  }, [students])

  const loadAllApplications = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all applications for linked students
      const studentIds = students.map(s => s.user_id)
      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          universities (
            id, name, city, state, country
          )
        `)
        .in('student_id', studentIds)
        .order('deadline', { ascending: true })

      if (appsError) {
        setError('Failed to load applications')
        return
      }

      // Add student names to applications
      const applicationsWithNames = (apps || []).map(app => {
        const student = students.find(s => s.user_id === app.student_id)
        return {
          ...app,
          student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'
        }
      })

      setApplications(applicationsWithNames)
    } catch (e) {
      console.error('Error loading applications:', e)
      setError('Failed to load applications')
    } finally {
      setLoading(false)
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

  const handleApplicationClick = (applicationId: string) => {
    router.push(`/parent/applications/${applicationId}`)
  }

  if (students.length === 0) return null

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Applications Overview
        </h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Applications Overview
        </h2>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Error loading applications</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Applications Overview
      </h2>
      
      {applications.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-2">No applications found</div>
          <div className="text-sm text-muted-foreground">
            Your children haven't added any applications yet.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white w-24">
                  Student
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white w-48">
                  University
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white w-32">
                  Location
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white w-24">
                  Deadline
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white w-28">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white w-32">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => handleApplicationClick(app.id)}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {app.student_name}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {app.universities?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-600 dark:text-gray-400">
                      {app.universities?.city && app.universities?.state 
                        ? `${app.universities.city}, ${app.universities.state}`
                        : app.universities?.country || 'Unknown'
                      }
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-600 dark:text-gray-400">
                      {app.deadline 
                        ? new Date(app.deadline).toLocaleDateString()
                        : 'Not set'
                      }
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                      {formatStatus(app.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-600 dark:text-gray-400">
                      {app.application_type 
                        ? app.application_type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                        : 'Not set'
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 