import { CalendarIcon } from '@/public/icons'

interface UniversityDeadlinesCardProps {
  deadlines: {
    regular: string
    early_decision: string
  }
}

export default function UniversityDeadlinesCard({ deadlines }: UniversityDeadlinesCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        <CalendarIcon className="w-5 h-5 inline mr-2" />
        Deadlines
      </h2>
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Early Decision
          </div>
          <div className="font-medium text-gray-900 dark:text-white">
            {formatDate(deadlines.early_decision)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Regular Decision
          </div>
          <div className="font-medium text-gray-900 dark:text-white">
            {formatDate(deadlines.regular)}
          </div>
        </div>
      </div>
    </div>
  )
} 