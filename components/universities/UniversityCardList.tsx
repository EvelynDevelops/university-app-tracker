import React from 'react'
import UniversityCard from './UniversityCard'

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
  onViewDetails?: (id: string) => void
  onApply?: (id: string) => void
}

export default function UniversityCardList({ 
  universities, 
  className,
  onViewDetails,
  onApply 
}: UniversityCardListProps) {
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