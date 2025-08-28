interface UniversityTuitionCardProps {
  tuitionInState: number
  tuitionOutState: number
}

export default function UniversityTuitionCard({ tuitionInState, tuitionOutState }: UniversityTuitionCardProps) {
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
        Tuition & Fees
      </h2>
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            In-State Tuition
          </div>
          <div className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(tuitionInState)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Out-of-State Tuition
          </div>
          <div className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(tuitionOutState)}
          </div>
        </div>
      </div>
    </div>
  )
} 