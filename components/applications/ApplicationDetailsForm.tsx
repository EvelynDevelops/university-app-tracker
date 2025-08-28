import { useState } from 'react'
import { updateApplication } from '@/lib/services/applicationService'

interface Props {
  applicationId: string
  deadlines?: Record<string, any>
  value: {
    application_type: string
    deadline: string
    notes: string
  }
  onUpdated?: (next: Partial<Props['value']>) => void
}

function getDeadlineFromType(deadlines: any, type: string) {
  const d = deadlines || {}
  switch (type) {
    case 'Early_Decision':
      return d.early_decision || ''
    case 'Early_Action':
      return d.early_action || d.early_decision || d.regular || ''
    case 'Regular_Decision':
      return d.regular || ''
    case 'Rolling_Admission':
      return d.rolling || d.regular || ''
    default:
      return ''
  }
}

export default function ApplicationDetailsForm({ applicationId, deadlines, value, onUpdated }: Props) {
  const [saving, setSaving] = useState(false)

  const persist = async (next: Partial<Props['value']>) => {
    setSaving(true)
    const { error } = await updateApplication(applicationId, {
      application_type: (next.application_type ?? value.application_type) ?? null,
      deadline: (next.deadline ?? value.deadline) ?? null,
      notes: (next.notes ?? value.notes) ?? null,
    })
    setSaving(false)
    if (!error) onUpdated?.(next)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Application Type</label>
        <select
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          value={value.application_type}
          onChange={async (e) => {
            const type = e.target.value
            const autoDeadline = getDeadlineFromType(deadlines, type)
            await persist({ application_type: type, deadline: autoDeadline })
          }}
        >
          <option value="">Select type</option>
          <option value="Early_Decision">Early Decision</option>
          <option value="Early_Action">Early Action</option>
          <option value="Regular_Decision">Regular Decision</option>
          <option value="Rolling_Admission">Rolling Admission</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Deadline</label>
        <input
          type="date"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          value={value.deadline}
          onChange={async (e) => { await persist({ deadline: e.target.value }) }}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</label>
        <textarea
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          rows={4}
          placeholder="Add any notes here..."
          value={value.notes}
          onChange={async (e) => { await persist({ notes: e.target.value }) }}
        />
      </div>
      {saving && <div className="text-xs text-gray-500">Saving...</div>}
    </div>
  )
}