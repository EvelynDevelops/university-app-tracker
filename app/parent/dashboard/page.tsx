"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getLinkedStudents, Student, checkParentOnboarding } from '@/lib/services/parentService'
import { supabaseBrowser } from '@/lib/supabase/helpers'
import ParentOverview from '@/components/parent/ParentOverview'
import ParentApplicationTable from '@/components/parent/ParentApplicationTable'
import ParentAcademicProfile from '@/components/parent/ParentAcademicProfile'
import LinkStudentModal from '@/components/modals/LinkStudentModal'

export default function ParentDashboard() {
  const [firstName, setFirstName] = useState<string>('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
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
        setShowLinkModal(true)
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



  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Your Child's Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Monitor your child's college application progress and academic profile
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
              onClick={() => setShowLinkModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Link Student Account
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Stats */}
            <ParentOverview />
            
            {/* Main Content Area - Left/Right Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side - Applications Table */}
              <div className="lg:col-span-2">
                <ParentApplicationTable students={students} />
              </div>
              
              {/* Right Side - Academic Profile */}
              <div className="lg:col-span-1">
                <ParentAcademicProfile students={students} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <LinkStudentModal
        open={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSuccess={() => {
          loadStudents()
          setShowLinkModal(false)
        }}
      />
    </DashboardLayout>
  )
}
