"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getLinkedStudents, Student } from '@/lib/services/parentService'
import { Button } from '@/components/ui/Button'
import { supabaseBrowser } from '@/lib/supabase/helpers'
import LinkStudentModal from '@/components/modals/LinkStudentModal'

interface LinkedStudent extends Student {
  linkId: string
}

export default function ManageStudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<LinkedStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unlinking, setUnlinking] = useState<string | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)

  useEffect(() => {
    loadLinkedStudents()
  }, [])

  const loadLinkedStudents = async () => {
    try {
      setLoading(true)
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get linked students
      const { data: links, error: linksError } = await supabase
        .from('parent_links')
        .select('student_user_id')
        .eq('parent_user_id', user.id)

      if (linksError) {
        console.error('Parent links error:', linksError)
        setError('Failed to load linked students')
        return
      }

      if (!links || links.length === 0) {
        setStudents([])
        return
      }

      // Get student profiles
      const studentIds = links.map(l => l.student_user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', studentIds)

      if (profilesError) {
        console.error('Student profiles error:', profilesError)
        setError('Failed to load student profiles')
        return
      }

      // Get student academic profiles
      const { data: academicProfiles, error: academicError } = await supabase
        .from('student_profile')
        .select('user_id, graduation_year, gpa, sat_score, act_score')
        .in('user_id', studentIds)

      if (academicError) {
        console.error('Academic profiles error:', academicError)
        // Continue without academic profiles
      }

      // Create maps for easy lookup
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]))
      const academicMap = new Map((academicProfiles || []).map(p => [p.user_id, p]))

      const linkedStudents: LinkedStudent[] = studentIds
        .map(studentId => {
          const profile = profileMap.get(studentId)
          const academic = academicMap.get(studentId)
          
          if (!profile) return null
          
          return {
            user_id: studentId,
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            email: profile.email || '',
            graduation_year: academic?.graduation_year || undefined,
            gpa: academic?.gpa || undefined,
            sat_score: academic?.sat_score || undefined,
            act_score: academic?.act_score || undefined,
            linkId: studentId
          } as LinkedStudent
        })
        .filter((student): student is LinkedStudent => student !== null)

      setStudents(linkedStudents)
    } catch (e) {
      setError('Failed to load linked students')
    } finally {
      setLoading(false)
    }
  }

  const unlinkStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from your account? You will no longer be able to view their application progress.`)) {
      return
    }

    try {
      setUnlinking(studentId)
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { error } = await supabase
        .from('parent_links')
        .delete()
        .eq('parent_user_id', user.id)
        .eq('student_user_id', studentId)

      if (error) {
        setError('Failed to remove student')
        return
      }

      // Remove from local state
      setStudents(prev => prev.filter(s => s.user_id !== studentId))
    } catch (e) {
      setError('Failed to remove student')
    } finally {
      setUnlinking(null)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading linked students...</div>
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
              My Students
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage your linked student accounts
            </p>
          </div>
          <Button
            onClick={() => setShowLinkModal(true)}
            className="px-4"
          >
            Add Student
          </Button>
        </div>

        {error && (
          <div className="mb-6 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {error}
          </div>
        )}

        {students.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No students linked to your account</div>
            <div className="text-sm text-muted-foreground mb-6">
              Add your child's student account to start monitoring their application progress.
            </div>
            <Button
              onClick={() => setShowLinkModal(true)}
              className="px-6"
            >
              Add Student
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <div
                  key={student.user_id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center space-x-4 mb-4">
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
                    <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={() => router.push(`/parent/students/${student.user_id}/applications`)}
                      className="flex-1"
                      variant="outline"
                    >
                      View Applications
                    </Button>
                                         <Button
                       onClick={() => unlinkStudent(student.user_id, `${student.first_name} ${student.last_name}`)}
                       disabled={unlinking === student.user_id}
                       className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                       variant="outline"
                     >
                       {unlinking === student.user_id ? 'Removing...' : 'Remove'}
                     </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <LinkStudentModal
        open={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSuccess={() => {
          loadLinkedStudents()
          setShowLinkModal(false)
        }}
      />
    </DashboardLayout>
  )
} 