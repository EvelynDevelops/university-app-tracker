"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { supabaseBrowser } from '@/lib/supabase/helpers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface StudentProfile {
  user_id: string
  first_name: string
  last_name: string
  email: string
  role: string
}

export default function ParentOnboardingPage() {
  const router = useRouter()
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState<StudentProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    checkExistingLinks()
  }, [])

  const checkExistingLinks = async () => {
    try {
      setLoading(true)
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if parent already has linked students
      const { data: existingLinks } = await supabase
        .from('parent_links')
        .select('student_user_id')
        .eq('parent_user_id', user.id)

      if (existingLinks && existingLinks.length > 0) {
        // Parent already has linked students, redirect to dashboard
        router.push('/parent/dashboard')
      }
    } catch (e) {
      console.error('Error checking existing links:', e)
    } finally {
      setLoading(false)
    }
  }

  const searchStudent = async () => {
    if (!searchEmail.trim()) return

    try {
      setSearching(true)
      setError(null)
      setSearchResults([])

      const response = await fetch('/api/v1/parent/search-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: searchEmail.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to search for student')
        return
      }

      setSearchResults(data.students)
    } catch (e) {
      setError('Failed to search for student')
    } finally {
      setSearching(false)
    }
  }

  const linkStudent = async (studentId: string, studentName: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/v1/parent/link-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to link student account')
        return
      }

      setSuccess(`Successfully linked ${studentName} to your account!`)
      setSearchResults([])
      setSearchEmail('')

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/parent/dashboard')
      }, 2000)
    } catch (e) {
      setError('Failed to link student account')
    } finally {
      setLoading(false)
    }
  }

  const skipOnboarding = () => {
    router.push('/parent/dashboard')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to UniTracker Parent Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            To get started, please link your child's student account to your parent account.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Link Student Account
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Student Email Address
              </label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="flex-1"
                />
                <Button
                  onClick={searchStudent}
                  disabled={searching || !searchEmail.trim()}
                  className="px-6"
                >
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                {success}
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Found Student Account:
                </h3>
                {searchResults.map((student) => (
                  <div
                    key={student.user_id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.email}
                      </div>
                    </div>
                    <Button
                      onClick={() => linkStudent(student.user_id, `${student.first_name} ${student.last_name}`)}
                      disabled={loading}
                      className="px-4"
                    >
                      {loading ? 'Linking...' : 'Link Account'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Don't have your child's account information right now?
              </p>
              <Button
                onClick={skipOnboarding}
                variant="outline"
                className="px-6"
              >
                Skip for Now
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              How to link your child's account:
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left max-w-md mx-auto">
              <li>1. Ask your child for their UniTracker student account email</li>
              <li>2. Enter the email address above and click "Search"</li>
              <li>3. Click "Link Account" to connect their account to yours</li>
              <li>4. You'll be able to view their application progress</li>
            </ol>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 