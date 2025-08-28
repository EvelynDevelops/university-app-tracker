"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { fetchUniversities, FilterValues, UIUniversity } from '@/lib/services/universityService'
import UniversityCardList from '@/components/universities/UniversityCardList'
import UniversitiesFilterSection from '@/components/universities/UniversitiesFilterSection'
import Pagination from '@/components/ui/pagination'

export default function ParentUniversitiesPage() {
  const [universities, setUniversities] = useState<UIUniversity[]>([])
  const [filteredUniversities, setFilteredUniversities] = useState<UIUniversity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterValues>({})
  const [pagination, setPagination] = useState<{
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 30
  })

  useEffect(() => {
    loadUniversities()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [universities, filters])

  const loadUniversities = async (filters?: FilterValues, paginationParams?: { page: number; itemsPerPage: number }) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await fetchUniversities(filters, paginationParams)
      
      if (result.error) {
        setError(result.error)
        return
      }

      if (result.universities) {
        setUniversities(result.universities)
        
        if (result.pagination) {
          setPagination({
            currentPage: result.pagination.currentPage,
            totalPages: result.pagination.totalPages,
            totalItems: result.pagination.totalItems,
            itemsPerPage: result.pagination.itemsPerPage
          })
        }
      }
    } catch (e) {
      setError('Failed to load universities')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...universities]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(uni => 
        uni.name.toLowerCase().includes(searchLower) ||
        uni.city?.toLowerCase().includes(searchLower) ||
        uni.state?.toLowerCase().includes(searchLower) ||
        uni.country?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.country) {
      filtered = filtered.filter(uni => uni.country === filters.country)
    }

    if (filters.state) {
      filtered = filtered.filter(uni => uni.state === filters.state)
    }

    if (filters.rankingRange) {
      const [min, max] = filters.rankingRange.split('-').map(Number)
      filtered = filtered.filter(uni => {
        if (!uni.us_news_ranking) return false
        return uni.us_news_ranking >= min && uni.us_news_ranking <= max
      })
    }

    if (filters.acceptanceRateRange) {
      const [min, max] = filters.acceptanceRateRange.split('-').map(Number)
      filtered = filtered.filter(uni => {
        if (!uni.acceptance_rate) return false
        const rate = uni.acceptance_rate * 100
        return rate >= min && rate <= max
      })
    }

    setFilteredUniversities(filtered)
  }

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
    loadUniversities(newFilters, { page: 1, itemsPerPage: pagination.itemsPerPage })
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
    loadUniversities(filters, { page, itemsPerPage: pagination.itemsPerPage })
  }

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: 1, itemsPerPage }))
    loadUniversities(filters, { page: 1, itemsPerPage })
  }

  const handleViewDetails = (universityId: string) => {
    window.open(`/universities/${universityId}`, '_blank')
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Universities
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse universities and research potential options for your children.
          </p>
        </div>

        <UniversitiesFilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">Error loading universities</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Found {pagination.totalItems} universities
              </p>
            </div>

            <UniversityCardList
              universities={filteredUniversities}
              loading={loading}
              onViewDetails={handleViewDetails}
            />

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              className="mt-8"
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
} 