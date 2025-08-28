import { useEffect, useState } from 'react'
import { fetchRequirements, UniversityRequirement, updateRequirementProgress } from '@/lib/services/requirementsService'
import { CheckIcon } from '@/public/icons'

interface Props {
  universityId: string
  applicationId?: string
}

type UIRequirement = UniversityRequirement & { __completed?: boolean }

export default function RequirementsChecklist({ universityId, applicationId }: Props) {
  const [requirements, setRequirements] = useState<UIRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const { requirements, error } = await fetchRequirements(universityId, applicationId)
        if (error) setError(error)
        // Initialize completed flag from progress if present
        const ui = (requirements || []).map(r => ({
          ...r,
          __completed: (r.application_requirement_progress && r.application_requirement_progress[0]?.status === 'completed') || false
        }))
        // Sort: incomplete first
        ui.sort((a, b) => Number(a.__completed) - Number(b.__completed))
        setRequirements(ui)
      } finally {
        setLoading(false)
      }
    })()
  }, [universityId, applicationId])

  if (loading) return <div className="text-sm text-gray-500">Loading requirements...</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>

  if (requirements.length === 0) {
    return <div className="text-sm text-gray-500">No requirements found</div>
  }

  const toggleComplete = async (id: string) => {
    // optimistic UI
    let target: UIRequirement | undefined
    setRequirements(prev => {
      const next = prev.map(r => {
        if (r.id === id) { target = r; return { ...r, __completed: !r.__completed } }
        return r
      })
      next.sort((a, b) => Number(a.__completed) - Number(b.__completed))
      return next
    })
    const newStatus = target && !target.__completed ? 'completed' : 'not_started'
    if (applicationId) {
      const { error } = await updateRequirementProgress(applicationId, id, newStatus as any)
      if (error) {
        // revert on error
        setRequirements(prev => prev.map(r => r.id === id ? { ...r, __completed: target?.__completed } : r))
      }
    }
  }

  return (
    <div className="space-y-3">
      {requirements.map((requirement) => (
        <div key={requirement.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-start gap-3">
            <button
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${requirement.__completed ? 'border-green-600 bg-green-600' : 'border-gray-300 dark:border-gray-600 bg-transparent'}`}
              aria-pressed={requirement.__completed}
              onClick={() => toggleComplete(requirement.id)}
            >
              {requirement.__completed && <CheckIcon className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1">
              <div className={`font-medium ${requirement.__completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
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
          </div>
        </div>
      ))}
    </div>
  )
}