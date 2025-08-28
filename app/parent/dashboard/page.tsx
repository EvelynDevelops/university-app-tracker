"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getLinkedStudents, Student, checkParentOnboarding } from '@/lib/services/parentService'
import { supabaseBrowser } from '@/lib/supabase/helpers'
import ParentOverview from '@/components/parent/ParentOverview'

export default function ParentDashboard() {
  const [firstName, setFirstName] = useState<string>('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadParentProfile()
    checkOnboarding()
    loadStudents()
  }, [])

  const loadParentProfile = async () => {
    try {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('user_id', user.id)
          .single()
        if (profile?.first_name) setFirstName(profile.first_name)
      }
    } catch (e) {
      // no-op
    }
  }

  const checkOnboarding = async () => {
    try {
      const result = await checkParentOnboarding()
      if (result.needsOnboarding) {
        router.push('/parent/onboarding')
        return
      }
    } catch (e) {
      console.error('Error checking onboarding:', e)
    }
  }

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getLinkedStudents()
      
      if (result.error) {
        setError(result.error)
      } else if (result.students) {
        setStudents(result.students)
      }
    } catch (e) {
      console.error('Error loading students:', e)
      setError('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const handleStudentClick = (studentId: string) => {
    router.push(`/parent/students/${studentId}/applications`)
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {`Hello, ${firstName || 'Parent'}`}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Monitor your children's university application progress and provide support.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading students...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">Error loading students</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No students linked to your account</div>
            <div className="text-sm text-muted-foreground mb-6">
              Link your child's student account to start monitoring their application progress.
            </div>
            <button
              onClick={() => router.push('/parent/onboarding')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Link Student Account
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <ParentOverview />
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Students
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <div
                  key={student.user_id}
                  onClick={() => handleStudentClick(student.user_id)}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {student.first_name} {student.last_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.email}
                      </p>
                      {student.graduation_year && (
                        <p className="text-sm text-gray-500">
                          Class of {student.graduation_year}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {student.gpa && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">GPA:</span>
                          <span className="ml-2 font-medium">{student.gpa}</span>
                        </div>
                        {student.sat_score && (
                          <div>
                            <span className="text-gray-500">SAT:</span>
                            <span className="ml-2 font-medium">{student.sat_score}</span>
                          </div>
                        )}
                        {student.act_score && (
                          <div>
                            <span className="text-gray-500">ACT:</span>
                            <span className="ml-2 font-medium">{student.act_score}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500">
                      Click to view applications
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
