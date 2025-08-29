"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface StudentProfile {
  user_id: string
  first_name: string
  last_name: string
  email: string
}

interface LinkStudentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function LinkStudentModal({ open, onClose, onSuccess }: LinkStudentModalProps) {
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState<StudentProfile[]>([])
  const [searching, setSearching] = useState(false)
  const [linking, setLinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
      setLinking(true)
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

      // Close modal after a short delay
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    } catch (e) {
      setError('Failed to link student account')
    } finally {
      setLinking(false)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome to UniTracker Parent Portal
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Link your child's student account to start monitoring their application progress.
          </p>
        </div>

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
                className="px-4"
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
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
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
                    disabled={linking}
                    className="px-3"
                  >
                    {linking ? 'Linking...' : 'Link'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Don't have your child's account information right now?
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="px-4"
              >
                Skip for Now
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              How to link your child's account:
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left">
              <li>1. Ask your child for their UniTracker student account email</li>
              <li>2. Enter the email address above and click "Search"</li>
              <li>3. Click "Link" to connect their account to yours</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 