"use client"
import { Student } from '@/lib/services/parentService'

interface ParentAcademicProfileProps {
  students: Student[]
}

export default function ParentAcademicProfile({ students }: ParentAcademicProfileProps) {
  console.log('ParentAcademicProfile received students:', students)
  
  if (students.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Academic Profile
      </h2>
      
      <div className="space-y-4">
        {students.map((student) => (
          <div
            key={student.user_id}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {student.first_name.charAt(0)}{student.last_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {student.first_name} {student.last_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {student.email}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Graduation Year:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {student.graduation_year || <span className="text-gray-400 dark:text-gray-500">Not set</span>}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">GPA:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {student.gpa || <span className="text-gray-400 dark:text-gray-500">Not set</span>}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">SAT Score:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {student.sat_score || <span className="text-gray-400 dark:text-gray-500">Not set</span>}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">ACT Score:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {student.act_score || <span className="text-gray-400 dark:text-gray-500">Not set</span>}
                </span>
              </div>

              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Target Countries:</span>
                <div className="mt-1">
                  {student.target_countries && student.target_countries.length > 0 ? (
                    student.target_countries.map((country, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded mr-1 mb-1"
                      >
                        {country}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">Not set</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Intended Majors:</span>
                <div className="mt-1">
                  {student.intended_majors && student.intended_majors.length > 0 ? (
                    student.intended_majors.map((major, index) => (
                      <span
                        key={index}
                        className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded mr-1 mb-1"
                      >
                        {major}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">Not set</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 