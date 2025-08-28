interface UniversityApplicationCardProps {
  applicationSystem: string
  applicationFee: number
}

export default function UniversityApplicationCard({ applicationSystem, applicationFee }: UniversityApplicationCardProps) {
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
        Application Information
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Application System</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {applicationSystem}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Application Fee</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(applicationFee)}
          </span>
        </div>
      </div>
    </div>
  )
} 