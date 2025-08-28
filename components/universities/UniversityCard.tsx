import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { MapPinIcon, UsersIcon, FileTextIcon } from '@/public/icons'

interface UniversityCardProps {
  university: {
    id: string
    name: string
    ranking: number
    location: string
    acceptanceRate: number
    applicationRequirements: string[]
    website?: string
  }
  className?: string
  onViewDetails?: (id: string) => void
  onApply?: (id: string) => void
}

export default function UniversityCard({ 
  university, 
  className,
  onViewDetails,
  onApply 
}: UniversityCardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700 flex flex-col h-full",
      className
    )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-2">
                {university.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{university.location}</span>
              </div>
            </div>
          </div>
          {/* Ranking Badge */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 border border-gray-300 dark:border-gray-700">
            <span>Rank</span>
            <span>#{university.ranking}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Acceptance Rate */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <UsersIcon className="w-4 h-4" />
              <span>Acceptance Rate</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {university.acceptanceRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${university.acceptanceRate}%` }}
            />
          </div>
        </div>

        {/* Application Requirements */}
        <div className="mb-6 flex-1">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FileTextIcon className="w-4 h-4" />
            <span>Application Requirements</span>
          </div>
          <div className="space-y-2">
            {university.applicationRequirements.map((requirement, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                <span className="line-clamp-1">{requirement}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-auto">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails?.(university.id)}
          >
            View Details
          </Button>
          <Button 
            className="flex-1"
            onClick={() => onApply?.(university.id)}
          >
            Add to List
          </Button>
        </div>
      </div>
    </div>
  )
} 