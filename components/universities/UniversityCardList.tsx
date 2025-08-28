import React from 'react'
import UniversityCard from './UniversityCard'
import { Skeleton } from '@/components/ui/skeleton'

interface University {
  id: string
  name: string
  ranking: number
  location: string
  acceptanceRate: number
  applicationRequirements: string[]
  logo?: string
  website?: string
}

interface UniversityCardListProps {
  universities: University[]
  className?: string
  loading?: boolean
  onViewDetails?: (id: string) => void
  onApply?: (id: string) => void
}

// Skeleton component for university cards
const UniversityCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
    <div className="flex items-start space-x-4">
      <Skeleton className="w-16 h-16 rounded-lg" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  </div>
)

export default function UniversityCardList({ 
  universities, 
  className,
  loading = false,
  onViewDetails,
  onApply 
}: UniversityCardListProps) {
  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <UniversityCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {universities.map((university) => (
          <UniversityCard
            key={university.id}
            university={university}
            onViewDetails={onViewDetails}
            onApply={onApply}
          />
        ))}
      </div>
    </div>
  )
} 