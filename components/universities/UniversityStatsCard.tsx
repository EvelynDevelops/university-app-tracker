interface UniversityStatsCardProps {
  ranking: number
  acceptanceRate: number
}

export default function UniversityStatsCard({ ranking, acceptanceRate }: UniversityStatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Key Statistics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">US News Ranking</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              #{ranking}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${Math.max(0, 100 - ranking)}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Acceptance Rate</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {acceptanceRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${acceptanceRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 