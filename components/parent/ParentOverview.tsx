"use client"

import { useEffect, useState } from 'react'
import { getLinkedStudents, Student } from '@/lib/services/parentService'
import { supabaseBrowser } from '@/lib/supabase/helpers'

interface StudentStats {
  studentId: string
  studentName: string
  totalApplications: number
  inProgress: number
  submitted: number
  underReview: number
  accepted: number
  dueIn7Days: number
}

export default function ParentOverview() {
  const [students, setStudents] = useState<Student[]>([])
  const [studentStats, setStudentStats] = useState<StudentStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudentsAndStats()
  }, [])

  const loadStudentsAndStats = async () => {
    try {
      setLoading(true)
      const result = await getLinkedStudents()
      
      if (result.students) {
        setStudents(result.students)
        
        // Load stats for each student
        const statsPromises = result.students.map(async (student) => {
          const supabase = supabaseBrowser()
          const { data: applications } = await supabase
            .from('applications')
            .select('status, deadline')
            .eq('student_id', student.user_id)

          const apps = applications || []
          const total = apps.length
          const inProgress = apps.filter(a => a.status === 'IN_PROGRESS').length
          const submitted = apps.filter(a => a.status === 'SUBMITTED').length
          const underReview = apps.filter(a => a.status === 'UNDER_REVIEW').length
          const accepted = apps.filter(a => a.status === 'ACCEPTED').length
          const dueIn7Days = apps.filter(a => 
            a.deadline && 
            (new Date(a.deadline).getTime() - new Date().setHours(0,0,0,0)) / (1000*60*60*24) <= 7 && 
            (new Date(a.deadline).getTime() - new Date().setHours(0,0,0,0)) / (1000*60*60*24) >= 0
          ).length

          return {
            studentId: student.user_id,
            studentName: `${student.first_name} ${student.last_name}`,
            totalApplications: total,
            inProgress,
            submitted,
            underReview,
            accepted,
            dueIn7Days
          }
        })

        const stats = await Promise.all(statsPromises)
        setStudentStats(stats)
      }
    } catch (e) {
      console.error('Error loading student stats:', e)
    } finally {
      setLoading(false)
    }
  }

  const getTotalStats = () => {
    return studentStats.reduce((acc, stat) => ({
      total: acc.total + stat.totalApplications,
      inProgress: acc.inProgress + stat.inProgress,
      submitted: acc.submitted + stat.submitted,
      underReview: acc.underReview + stat.underReview,
      accepted: acc.accepted + stat.accepted,
      dueIn7Days: acc.dueIn7Days + stat.dueIn7Days
    }), {
      total: 0,
      inProgress: 0,
      submitted: 0,
      underReview: 0,
      accepted: 0,
      dueIn7Days: 0
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const totalStats = getTotalStats()

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500">Total Applications</div>
          <div className="text-2xl font-bold">{totalStats.total}</div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500">In Progress</div>
          <div className="text-2xl font-bold text-yellow-600">{totalStats.inProgress}</div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500">Submitted</div>
          <div className="text-2xl font-bold text-blue-600">{totalStats.submitted}</div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500">Under Review</div>
          <div className="text-2xl font-bold text-purple-600">{totalStats.underReview}</div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500">Accepted</div>
          <div className="text-2xl font-bold text-green-600">{totalStats.accepted}</div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="text-xs text-gray-500">Due in 7 days</div>
          <div className="text-2xl font-bold text-amber-600">{totalStats.dueIn7Days}</div>
        </div>
      </div>

      {/* Individual Student Stats */}
      {studentStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Student Progress Overview
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    In Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Under Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Accepted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Due Soon
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {studentStats.map((stat) => (
                  <tr key={stat.studentId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {stat.studentName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {stat.totalApplications}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                      {stat.inProgress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {stat.submitted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                      {stat.underReview}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {stat.accepted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600">
                      {stat.dueIn7Days}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
} 