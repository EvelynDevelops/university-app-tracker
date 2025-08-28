import { FileTextIcon } from '@/public/icons'

interface UniversityRequirementsCardProps {
  applicationSystem: string
  applicationFee: number
}

export default function UniversityRequirementsCard({ 
  applicationSystem, 
  applicationFee
}: UniversityRequirementsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Common application requirements based on application system
  const getRequirements = (system: string) => {
    const commonRequirements = [
      'High School Transcript',
      'Standardized Test Scores (SAT/ACT)',
      'Personal Statement/Essay',
      'Letters of Recommendation',
      'Application Fee'
    ]

    switch (system.toLowerCase()) {
      case 'common app':
        return [
          ...commonRequirements,
          'Common App Personal Essay',
          'Supplemental Essays (if required)',
          'Activities List',
          'Honors & Awards'
        ]
      case 'coalition':
        return [
          ...commonRequirements,
          'Coalition Personal Statement',
          'Supplemental Essays (if required)',
          'Activities & Achievements'
        ]
      case 'direct':
        return [
          ...commonRequirements,
          'Institution-Specific Essays',
          'Portfolio (if applicable)',
          'Interview (if required)'
        ]
      default:
        return commonRequirements
    }
  }

  const requirements = getRequirements(applicationSystem)

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
          <div className="space-y-2">
            {requirements.map((requirement, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
              </div>
            ))}
          </div>
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