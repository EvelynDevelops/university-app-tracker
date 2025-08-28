"use client"

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { UniversityCardList } from '@/components/universities'
import { FilterValues } from '@/components/universities/UniversityFilterBar'
import UniversitiesFilterSection from '@/components/universities/UniversitiesFilterSection'
import { fetchUniversities, UIUniversity } from '@/lib/services/universityService'

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<UIUniversity[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Function to load universities using service
  const loadUniversities = async (filters?: FilterValues) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await fetchUniversities(filters)
      
      if (result.error) {
        setError(result.error)
      } else {
        setUniversities(result.universities)
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load universities')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadUniversities()
  }, [])

  const [currentFilters, setCurrentFilters] = useState<FilterValues>({
    search: "",
    major: "All Majors",
    location: "All Locations",
    ranking: "All Rankings",
    acceptanceRate: "All Acceptance Rates"
  })

  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({
    search: "",
    major: "All Majors",
    location: "All Locations",
    ranking: "All Rankings",
    acceptanceRate: "All Acceptance Rates"
  })

  // Universities are now filtered by the API, so we use the universities state directly
  const filteredUniversities = universities

  const handleViewDetails = (id: string) => {
    console.log('View details for university:', id)
  }

  const handleApply = (id: string) => {
    console.log('Apply to university:', id)
  }

  const handleFiltersChange = (newFilters: FilterValues) => {
    setCurrentFilters(newFilters)
  }

  const handleSearch = (filters: FilterValues) => {
    setAppliedFilters(filters)
    loadUniversities(filters)
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Universities
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Explore top universities and their application requirements
          </p>
        </div>

        {/* Filters */}
        <UniversitiesFilterSection
          className="mb-6"
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
        />

        {/* Results Summary */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Universities
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loading ? 'Loading...' : `Showing ${filteredUniversities.length} of ${universities.length} universities`}
                {error ? ` · Error: ${error}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* University Cards */}
        <UniversityCardList
          universities={filteredUniversities as UIUniversity[]}
          onViewDetails={handleViewDetails}
          onApply={handleApply}
        />
      </div>
    </DashboardLayout>
  )
}