"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import UniversityDetailHeader from '@/components/universities/UniversityDetailHeader'
import UniversityStatsCard from '@/components/universities/UniversityStatsCard'
import UniversityRequirementsCard from '@/components/universities/UniversityRequirementsCard'
import UniversityDeadlinesCard from '@/components/universities/UniversityDeadlinesCard'
import UniversityTuitionCard from '@/components/universities/UniversityTuitionCard'

interface UniversityDetails {
  id: string
  name: string
  country: string
  state: string
  city: string
  us_news_ranking: number
  acceptance_rate: number
  application_system: string
  tuition_in_state: number
  tuition_out_state: number
  application_fee: number
  deadlines: {
    regular: string
    early_decision: string
  }
}

export default function UniversityDetailPage() {
  const params = useParams()
  const [university, setUniversity] = useState<UniversityDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/v1/universities/${params.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setUniversity(result.data)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load university details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchUniversity()
    }
  }, [params.id])

  const handleApply = () => {
    // TODO: Implement apply functionality
    console.log('Apply to university:', university?.id)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !university) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error ? 'Error Loading University' : 'University Not Found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'The university you are looking for does not exist.'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <UniversityDetailHeader 
          university={university} 
          onApply={handleApply} 
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Key Information */}
          <div className="lg:col-span-2 space-y-6">
            <UniversityStatsCard 
              ranking={university.us_news_ranking}
              acceptanceRate={university.acceptance_rate}
            />
            <UniversityRequirementsCard 
              applicationSystem={university.application_system}
              applicationFee={university.application_fee}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <UniversityDeadlinesCard deadlines={university.deadlines} />
            <UniversityTuitionCard 
              tuitionInState={university.tuition_in_state}
              tuitionOutState={university.tuition_out_state}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
