"use client"

import { useState, useMemo } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { UniversityCardList } from '@/components/universities'
import UniversityFilterBar, { FilterValues } from '@/components/universities/UniversityFilterBar'

export default function UniversitiesPage() {
  // Mock data for universities
  const universities = [
    {
      id: "1",
      name: "Stanford University",
      ranking: 3,
      location: "Stanford, CA",
      acceptanceRate: 4.3,
      applicationRequirements: [
        "SAT/ACT scores",
        "High school transcript",
        "Letters of recommendation",
        "Personal statement",
        "Extracurricular activities"
      ],
      logo: "/logos/stanford.png"
    },
    {
      id: "2",
      name: "MIT",
      ranking: 1,
      location: "Cambridge, MA",
      acceptanceRate: 6.7,
      applicationRequirements: [
        "SAT/ACT scores",
        "High school transcript",
        "Letters of recommendation",
        "Personal statement",
        "Research experience"
      ],
      logo: "/logos/mit.png"
    },
    {
      id: "3",
      name: "Harvard University",
      ranking: 2,
      location: "Cambridge, MA",
      acceptanceRate: 4.6,
      applicationRequirements: [
        "SAT/ACT scores",
        "High school transcript",
        "Letters of recommendation",
        "Personal statement",
        "Leadership experience"
      ],
      logo: "/logos/harvard.png"
    },
    {
      id: "4",
      name: "University of California, Berkeley",
      ranking: 13,
      location: "Berkeley, CA",
      acceptanceRate: 14.5,
      applicationRequirements: [
        "SAT/ACT scores",
        "High school transcript",
        "Letters of recommendation",
        "Personal statement",
        "Community service"
      ],
      logo: "/logos/berkeley.png"
    },
    {
      id: "5",
      name: "Yale University",
      ranking: 4,
      location: "New Haven, CT",
      acceptanceRate: 6.2,
      applicationRequirements: [
        "SAT/ACT scores",
        "High school transcript",
        "Letters of recommendation",
        "Personal statement",
        "Academic achievements"
      ],
      logo: "/logos/yale.png"
    },
    {
      id: "6",
      name: "Princeton University",
      ranking: 5,
      location: "Princeton, NJ",
      acceptanceRate: 5.8,
      applicationRequirements: [
        "SAT/ACT scores",
        "High school transcript",
        "Letters of recommendation",
        "Personal statement",
        "Research projects"
      ],
      logo: "/logos/princeton.png"
    }
  ]

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
    return universities.filter(university => {
      // Search filter
      if (appliedFilters.search && !university.name.toLowerCase().includes(appliedFilters.search.toLowerCase())) {
        return false
      }

      // Location filter
      if (appliedFilters.location !== "All Locations") {
        if (appliedFilters.location === "California" && !university.location.includes("CA")) return false
        if (appliedFilters.location === "Massachusetts" && !university.location.includes("MA")) return false
        if (appliedFilters.location === "Connecticut" && !university.location.includes("CT")) return false
        if (appliedFilters.location === "New Jersey" && !university.location.includes("NJ")) return false
      }

      // Ranking filter
      if (appliedFilters.ranking !== "All Rankings") {
        const ranking = university.ranking
        if (appliedFilters.ranking === "Top 5" && ranking > 5) return false
        if (appliedFilters.ranking === "Top 10" && ranking > 10) return false
        if (appliedFilters.ranking === "Top 20" && ranking > 20) return false
        if (appliedFilters.ranking === "Top 50" && ranking > 50) return false
        if (appliedFilters.ranking === "Top 100" && ranking > 100) return false
      }

      // Acceptance rate filter
      if (appliedFilters.acceptanceRate !== "All Acceptance Rates") {
        const rate = university.acceptanceRate
        if (appliedFilters.acceptanceRate === "Under 5%" && rate >= 5) return false
        if (appliedFilters.acceptanceRate === "5% - 10%" && (rate < 5 || rate > 10)) return false
        if (appliedFilters.acceptanceRate === "10% - 20%" && (rate < 10 || rate > 20)) return false
        if (appliedFilters.acceptanceRate === "20% - 50%" && (rate < 20 || rate > 50)) return false
        if (appliedFilters.acceptanceRate === "Over 50%" && rate <= 50) return false
      }

      return true
    })
  }, [appliedFilters])

  const handleViewDetails = (id: string) => {
    console.log('View details for university:', id)
  }

  const handleApply = (id: string) => {
    console.log('Apply to university:', id)
  }

  const handleFiltersChange = (newFilters: FilterValues) => {
    // 只更新当前筛选条件，不触发搜索
    setCurrentFilters(newFilters)
  }

  const handleSearch = (filters: FilterValues) => {
    // 点击搜索按钮时才应用筛选条件
    setAppliedFilters(filters)
    console.log('Search triggered with filters:', filters)
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
        <div className="mb-6">
          <UniversityFilterBar 
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
          />
        </div>

        {/* Results Summary */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Universities
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredUniversities.length} of {universities.length} universities
              </p>
            </div>
          </div>
        </div>

        {/* University Cards */}
        <UniversityCardList
          universities={filteredUniversities}
          onViewDetails={handleViewDetails}
          onApply={handleApply}
        />
      </div>
    </DashboardLayout>
  )
}
