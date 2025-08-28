import { useState, useEffect } from 'react'
import { FileTextIcon } from '@/public/icons'

interface UniversityRequirementsCardProps {
  universityId: string
  applicationSystem: string
  applicationFee: number
}

interface Requirement {
  id: string
  requirement_type: string
  requirement_name: string
  description: string
  is_required: boolean
  order_index: number
}

export default function UniversityRequirementsCard({ 
  universityId,
  applicationSystem, 
  applicationFee
}: UniversityRequirementsCardProps) {
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/v1/universities/${universityId}/requirements`)
        if (response.ok) {
          const result = await response.json()
          setRequirements(result.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch requirements:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequirements()
  }, [universityId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        <FileTextIcon className="w-5 h-5 inline mr-2" />
        Application Requirements
      </h2>
      
      <div className="space-y-6">
        {/* Application System & Fee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Application System
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {applicationSystem}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Application Fee
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(applicationFee)}
            </div>
          </div>
        </div>



        {/* Requirements List */}
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Required Materials
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {requirements.map((requirement) => (
                <div key={requirement.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Important Notes
          </div>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Submit all materials before the deadline</li>
            <li>• Check for program-specific requirements</li>
            <li>• Ensure all documents are properly formatted</li>
            <li>• Contact admissions office for questions</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 