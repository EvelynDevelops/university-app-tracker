import { useState } from 'react'
import { updateApplication } from '@/lib/services/applicationService'

interface StatusEditorProps {
  applicationId: string
  value: {
    status: string
    submitted_date?: string | null
    decision_date?: string | null
  }
  onUpdated?: (next: Partial<StatusEditorProps['value']>) => void
}

export default function StatusEditor({ applicationId, value, onUpdated }: StatusEditorProps) {
  const [saving, setSaving] = useState(false)

  const persist = async (next: Partial<StatusEditorProps['value']>) => {
    setSaving(true)
    const payload: any = { status: next.status ?? value.status }
    if (payload.status === 'SUBMITTED') {
      payload.submitted_date = (next.submitted_date ?? value.submitted_date) ?? new Date().toISOString().split('T')[0]
      payload.decision_date = null
      payload.decision_type = null
    } else if (payload.status === 'UNDER_REVIEW') {
      payload.submitted_date = (next.submitted_date ?? value.submitted_date) ?? null
      payload.decision_date = null
      payload.decision_type = null
    } else if (['ACCEPTED','REJECTED','WAITLISTED'].includes(payload.status)) {
      payload.decision_type = payload.status
      payload.decision_date = (next.decision_date ?? value.decision_date) ?? new Date().toISOString().split('T')[0]
      if (value.submitted_date) payload.submitted_date = value.submitted_date
    } else {
      payload.submitted_date = null
      payload.decision_date = null
      payload.decision_type = null
    }
    await updateApplication(applicationId, payload)
    setSaving(false)
    onUpdated?.(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          value={value.status}
          onChange={async (e) => { await persist({ status: e.target.value }) }}
        >
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="ACCEPTED">Decision - Accepted</option>
          <option value="REJECTED">Decision - Rejected</option>
          <option value="WAITLISTED">Decision - Waitlisted</option>
        </select>
      </div>
      {(value.status === 'SUBMITTED' || value.submitted_date) && (
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-400 w-36">Submitted Date</label>
          <input
            type="date"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={value.submitted_date || ''}
            onChange={async (e) => { await persist({ submitted_date: e.target.value }) }}
          />
        </div>
      )}
      {['ACCEPTED','REJECTED','WAITLISTED'].includes(value.status) && (
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-400 w-36">Decision Date</label>
          <input
            type="date"
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={value.decision_date || ''}
            onChange={async (e) => { await persist({ decision_date: e.target.value }) }}
          />
        </div>
      )}
      {saving && <div className="text-xs text-gray-500">Saving...</div>}
    </div>
  )
}