"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { ChevronDownIcon, CalendarIcon, CheckIcon } from '@/public/icons'

interface ApplicationDetails {
  id: string
  student_id: string
  university_id: string
  application_type: string
  deadline: string
  status: string
  submitted_date?: string
  decision_date?: string
  decision_type?: string
  notes?: string
  created_at: string
  universities: {
    id: string
    name: string
    city: string
    state: string
    country: string
    us_news_ranking: number
    acceptance_rate: number
    application_system: string
    tuition_in_state: number
    tuition_out_state: number
    application_fee: number
    deadlines: {
      regular: string
      early_decision: string
    }
  }
}

// Mock requirements data - in real app, this would come from database
const getRequirements = (applicationSystem: string) => {
  const commonRequirements = [
    { id: 1, name: 'High School Transcript', type: 'transcript', required: true },
    { id: 2, name: 'SAT/ACT Scores', type: 'test_scores', required: true },
    { id: 3, name: 'Personal Statement', type: 'essay', required: true },
    { id: 4, name: 'Letters of Recommendation', type: 'recommendation', required: true },
    { id: 5, name: 'Application Fee', type: 'fee', required: true }
  ]

  switch (applicationSystem.toLowerCase()) {
    case 'common app':
      return [
        ...commonRequirements,
        { id: 6, name: 'Common App Personal Essay', type: 'essay', required: true },
        { id: 7, name: 'Supplemental Essays', type: 'essay', required: false },
        { id: 8, name: 'Activities List', type: 'activities', required: true }
      ]
    case 'coalition':
      return [
        ...commonRequirements,
        { id: 6, name: 'Coalition Personal Statement', type: 'essay', required: true },
        { id: 7, name: 'Activities & Achievements', type: 'activities', required: true }
      ]
    default:
      return commonRequirements
  }
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requirements, setRequirements] = useState<any[]>([])

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/v1/applications/${params.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setApplication(result.data)
        
        // Fetch requirements with progress for this application
        if (result.data?.universities?.id) {
          const reqResponse = await fetch(`/api/v1/universities/${result.data.universities.id}/requirements?application_id=${params.id}`)
          if (reqResponse.ok) {
            const reqResult = await reqResponse.json()
            setRequirements(reqResult.data || [])
          }
        }
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load application details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchApplication()
    }
  }, [params.id])

  const handleBack = () => {
    router.back()
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!application) return

    try {
      const response = await fetch(`/api/v1/applications/${application.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          submitted_date: newStatus === 'SUBMITTED' ? new Date().toISOString().split('T')[0] : null
        })
      })

      if (response.ok) {
        const result = await response.json()
        setApplication(result.data)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-700'
      case 'SUBMITTED': return 'bg-blue-100 text-blue-700'
      case 'UNDER_REVIEW': return 'bg-purple-100 text-purple-700'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700'
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'Accepted'
      case 'SUBMITTED': return 'Submitted'
      case 'UNDER_REVIEW': return 'Under Review'
      case 'IN_PROGRESS': return 'In Progress'
      case 'NOT_STARTED': return 'Not Started'
      default: return status
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !application) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error ? 'Error Loading Application' : 'Application Not Found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'The application you are looking for does not exist.'}
            </p>
            <Button onClick={handleBack}>
              <ChevronDownIcon className="w-4 h-4 mr-2 rotate-90" />
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="mb-4"
          >
            <ChevronDownIcon className="w-4 h-4 mr-2 rotate-90" />
            Back to Applications
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {application.universities.name}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-gray-600 dark:text-gray-400">
                <span>{application.application_type}</span>
                <span>•</span>
                <span>Deadline: {formatDate(application.deadline)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(application.status)}`}
              >
                {getStatusLabel(application.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Application Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Application Progress
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Status</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getStatusLabel(application.status)}
                  </span>
                </div>
                
                {application.submitted_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Submitted Date</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(application.submitted_date)}
                    </span>
                  </div>
                )}
                
                {application.decision_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Decision Date</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(application.decision_date)}
                    </span>
                  </div>
                )}
                
                {application.decision_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Decision</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {application.decision_type}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Update Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Update Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {application.status !== 'SUBMITTED' && (
                    <Button 
                      size="sm"
                      onClick={() => handleStatusUpdate('SUBMITTED')}
                    >
                      Mark as Submitted
                    </Button>
                  )}
                  {application.status !== 'UNDER_REVIEW' && application.status === 'SUBMITTED' && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate('UNDER_REVIEW')}
                    >
                      Mark Under Review
                    </Button>
                  )}
                  {application.status !== 'ACCEPTED' && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate('ACCEPTED')}
                    >
                      Mark as Accepted
                    </Button>
                  )}
                </div>
              </div>
            </div>

                         {/* Requirements Checklist */}
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
               <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                 Requirements Checklist
               </h2>
               
               <div className="space-y-3">
                 {requirements.map((requirement) => (
                   <div key={requirement.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                     <div className="flex items-start gap-3">
                       <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mt-0.5">
                         <CheckIcon className="w-3 h-3 text-white hidden" />
                       </div>
                       <div className="flex-1">
                         <div className="font-medium text-gray-900 dark:text-white">
                           {requirement.requirement_name}
                         </div>
                         {requirement.description && (
                           <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                             {requirement.description}
                           </div>
                         )}
                         <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                           {requirement.is_required ? 'Required' : 'Optional'}
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <Button size="sm" variant="outline">
                           Upload
                         </Button>
                         <Button size="sm" variant="outline">
                           Mark Complete
                         </Button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* University Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                University Info
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Ranking</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    #{application.universities.us_news_ranking}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Acceptance Rate</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {application.universities.acceptance_rate}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Application System</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {application.universities.application_system}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {application.notes && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Notes
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {application.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
