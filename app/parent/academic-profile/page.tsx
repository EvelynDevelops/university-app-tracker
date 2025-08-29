"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import UploadCard, { UploadItem } from '@/components/shared/UploadCard'

type StudentProfile = {
  graduation_year: number | null
  gpa: number | null
  sat_score: number | null
  act_score: number | null
  target_countries: string[] | null
  intended_majors: string[] | null
}

type StudentData = {
  user_id: string
  first_name: string
  last_name: string
  email: string
  academicProfile: StudentProfile | null
  files: {
    essays: UploadItem[]
    transcripts: UploadItem[]
  }
}

export default function ParentAcademicProfilePage() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStudentProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/v1/parent/student-profile')
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Failed to load student profile')
        return
      }
      
      setStudentData(data.student)
    } catch (e) {
      console.error('Error loading student profile:', e)
      setError('Failed to load student profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudentProfile()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600 dark:text-gray-400">Loading student profile...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">Error loading student profile</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{error}</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!studentData) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-400 mb-4">No student data available</div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              Link your child's student account to view their academic profile.
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {studentData.first_name} {studentData.last_name}'s Academic Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          View your child's academic information and documents
        </p>

        <div className="space-y-6">
          {/* Student Header */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {studentData.first_name.charAt(0)}{studentData.last_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {studentData.first_name} {studentData.last_name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {studentData.email}
                </p>
              </div>
            </div>

            {/* Academic Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Academic Details</h3>
              {studentData.academicProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Graduation Year</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {studentData.academicProfile.graduation_year ?? 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">GPA</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {studentData.academicProfile.gpa ?? 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">SAT Score</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {studentData.academicProfile.sat_score ?? 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">ACT Score</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {studentData.academicProfile.act_score ?? 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Target Countries</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {studentData.academicProfile.target_countries?.join(', ') || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Intended Majors</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {studentData.academicProfile.intended_majors?.join(', ') || 'Not set'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  No academic profile information available yet.
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            {/* Essays */}
            <UploadCard
              title={`${studentData.first_name}'s Essays`}
              accept=".pdf,.doc,.docx,.md,.txt"
              items={studentData.files.essays}
              loading={false}
              onSelect={() => {}} // Read-only for parents
              onDelete={() => {}} // Read-only for parents
              readOnly={true}
            />

            {/* Transcripts */}
            <UploadCard
              title={`${studentData.first_name}'s Transcripts`}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              items={studentData.files.transcripts}
              loading={false}
              onSelect={() => {}} // Read-only for parents
              onDelete={() => {}} // Read-only for parents
              readOnly={true}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 