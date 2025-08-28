import { useEffect, useState } from 'react'
import { fetchRequirements, UniversityRequirement } from '@/lib/services/requirementsService'
import { Button } from '@/components/ui/Button'
import { CheckIcon } from '@/public/icons'

interface Props {
  universityId: string
  applicationId?: string
}

export default function RequirementsChecklist({ universityId, applicationId }: Props) {
  const [requirements, setRequirements] = useState<UniversityRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const { requirements, error } = await fetchRequirements(universityId, applicationId)
        if (error) setError(error)
        setRequirements(requirements)
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

  return (
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
              <Button size="sm" variant="outline">Upload</Button>
              <Button size="sm" variant="outline">Mark Complete</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}