"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ChevronDownIcon } from '@/public/icons'
import StatusEditor from '@/components/applications/StatusEditor'
import RequirementsChecklist from '@/components/applications/RequirementsChecklist'
import ApplicationDetailsForm from '@/components/applications/ApplicationDetailsForm'

interface ApplicationDetails {
  id: string
  university_id: string
  application_type: string
  deadline: string
  status: string
  submitted_date?: string | null
  decision_date?: string | null
  decision_type?: string | null
  notes?: string
  universities?: {
    id: string
    name: string
    us_news_ranking?: number
    acceptance_rate?: number
    application_system?: string
    deadlines?: any
  }
}

export default function ApplicationDetail({ applicationId }: { applicationId: string }) {
  const router = useRouter()
  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/v1/applications/${applicationId}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setApplication(data.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load application')
      } finally {
        setLoading(false)
      }
    })()
  }, [applicationId])

  const formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'
  const getStatusColor = (s: string) => ({
    ACCEPTED: 'bg-green-100 text-green-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-purple-100 text-purple-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    NOT_STARTED: 'bg-gray-100 text-gray-700',
  } as any)[s] || 'bg-gray-100 text-gray-700'
  const getStatusLabel = (s: string) => s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  if (loading) return <div className="p-6">Loading...</div>
  if (error || !application) return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">{error ? 'Error Loading Application' : 'Application Not Found'}</h1>
      <p className="text-gray-600 mb-6">{error || 'The application you are looking for does not exist.'}</p>
      <Button onClick={() => router.back()}>
        <ChevronDownIcon className="w-4 h-4 mr-2 rotate-90" />
        Go Back
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ChevronDownIcon className="w-4 h-4 mr-2 rotate-90" />
          Back to Applications
        </Button>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{application.universities?.name || 'University'}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600">
              <span>{application.application_type || 'Not set'}</span>
              <span>•</span>
              <span>Deadline: {formatDate(application.deadline)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(application.status)}`}>
              {getStatusLabel(application.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Application Progress</h2>
            <div className="space-y-4">
              {application.submitted_date && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Submitted Date</span>
                  <span className="font-medium">{formatDate(application.submitted_date)}</span>
                </div>
              )}
              {application.decision_date && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Decision Date</span>
                  <span className="font-medium">{formatDate(application.decision_date)}</span>
                </div>
              )}
              {application.decision_type && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Decision</span>
                  <span className="font-medium">{application.decision_type}</span>
                </div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Update Status</h3>
              <StatusEditor
                applicationId={application.id}
                value={{ status: application.status, submitted_date: application.submitted_date, decision_date: application.decision_date }}
                onUpdated={(next) => setApplication((prev) => prev ? ({ ...prev, ...next }) as any : prev)}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Requirements Checklist</h2>
            {application.universities?.id && (
              <RequirementsChecklist universityId={application.universities.id} applicationId={application.id} />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">University Info</h2>
            <div className="space-y-3">
              {application.universities?.us_news_ranking !== undefined && (
                <div>
                  <div className="text-sm text-gray-600">Ranking</div>
                  <div className="font-medium">#{application.universities?.us_news_ranking}</div>
                </div>
              )}
              {application.universities?.acceptance_rate !== undefined && (
                <div>
                  <div className="text-sm text-gray-600">Acceptance Rate</div>
                  <div className="font-medium">{application.universities?.acceptance_rate}%</div>
                </div>
              )}
              {application.universities?.application_system && (
                <div>
                  <div className="text-sm text-gray-600">Application System</div>
                  <div className="font-medium">{application.universities?.application_system}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Application Details</h2>
            <ApplicationDetailsForm
              applicationId={application.id}
              deadlines={application.universities?.deadlines}
              value={{ application_type: application.application_type, deadline: application.deadline, notes: application.notes || '' }}
              onUpdated={(next) => setApplication((prev) => prev ? ({ ...prev, ...next }) as any : prev)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}