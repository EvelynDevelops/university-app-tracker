"use client"

import { useState, useMemo, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { UniversityCardList } from '@/components/universities'
import { FilterValues } from '@/components/universities/UniversityFilterBar'
import UniversitiesFilterSection from '@/components/universities/UniversitiesFilterSection'
import { filterUniversities } from '@/utils/universityFilters'
import { supabaseBrowser } from '@/lib/supabase/helpers'

type UIUniversity = {
  id: string
  name: string
  ranking: number
  location: string
  acceptanceRate: number
  applicationRequirements: string[]
  logo?: string
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<UIUniversity[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        setError(null)
        const supabase = supabaseBrowser()

        // select columns from universities table
        const { data, error } = await supabase
          .from('universities')
          .select('id,name,us_news_ranking,city,state,country,acceptance_rate')

        if (error) throw error

        const mapped: UIUniversity[] = (data || []).map((row: any) => {
          const ranking = Number(row.us_news_ranking ?? row.ranking ?? 0)
          const acceptanceRate = Number(row.acceptance_rate ?? row.acceptanceRate ?? 0)
          const loc = [row.city, row.state, row.country].filter(Boolean).join(', ')
          const applicationRequirements = Array.isArray(row.application_requirements)
            ? row.application_requirements
            : []

          return {
            id: row.id,
            name: row.name,
            ranking,
            location: loc,
            acceptanceRate,
            applicationRequirements,
            logo: (row.logo ?? undefined) as string | undefined,
          }
        })

        setUniversities(mapped)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load universities')
      } finally {
        setLoading(false)
      }
    })()
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

  // Filter universities based on applied filters (only when search is clicked)
  const filteredUniversities = useMemo(() => {
    return filterUniversities(universities, appliedFilters)
  }, [appliedFilters, universities])

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