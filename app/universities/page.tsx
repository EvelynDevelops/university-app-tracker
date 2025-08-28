"use client"

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { UniversityCardList } from '@/components/universities'
import { FilterValues } from '@/components/universities/UniversityFilterBar'
import UniversitiesFilterSection from '@/components/universities/UniversitiesFilterSection'
import Pagination from '@/components/ui/pagination'
import { fetchUniversities, UIUniversity, PaginationParams } from '@/lib/services/universityService'
import { addToApplicationList, isUniversityInApplicationList } from '@/lib/services/applicationService'

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<UIUniversity[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
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
  const [applicationStatus, setApplicationStatus] = useState<{ [key: string]: boolean }>({})
  const [addingToApplication, setAddingToApplication] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Function to load universities using service
  const loadUniversities = async (filters?: FilterValues, paginationParams?: PaginationParams) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await fetchUniversities(filters, paginationParams)
      
      if (result.error) {
        setError(result.error)
      } else {
        setUniversities(result.universities)
        setPagination(prev => ({
          ...prev,
          totalItems: result.pagination.total,
          totalPages: Math.ceil(result.pagination.total / (paginationParams?.itemsPerPage || prev.itemsPerPage)),
          currentPage: paginationParams?.page || 1,
          itemsPerPage: paginationParams?.itemsPerPage || prev.itemsPerPage
        }))
        // Check application status for each university
        checkApplicationStatus(result.universities)
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load universities')
    } finally {
      setLoading(false)
    }
  }

  // Check which universities are already in the application list
  const checkApplicationStatus = async (universities: UIUniversity[]) => {
    const statusMap: { [key: string]: boolean } = {}
    
    for (const university of universities) {
      const { isInList } = await isUniversityInApplicationList(university.id)
      statusMap[university.id] = isInList
    }
    
    setApplicationStatus(statusMap)
  }

  // Initial load
  useEffect(() => {
    loadUniversities(undefined, { page: 1, itemsPerPage: 30 })
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

  const handleApply = async (id: string) => {
    try {
      setAddingToApplication(id)
      setSuccessMessage(null)
      
      const result = await addToApplicationList({ university_id: id })
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccessMessage(result.message || 'Successfully added to application list')
        // Update the application status for this university
        setApplicationStatus(prev => ({
          ...prev,
          [id]: true
        }))
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to add to application list')
    } finally {
      setAddingToApplication(null)
    }
  }

  const handleFiltersChange = (newFilters: FilterValues) => {
    setCurrentFilters(newFilters)
  }

  const handleSearch = (filters: FilterValues) => {
    setAppliedFilters(filters)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    loadUniversities(filters, { page: 1, itemsPerPage: pagination.itemsPerPage })
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
    loadUniversities(appliedFilters, { page, itemsPerPage: pagination.itemsPerPage })
  }

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: 1, itemsPerPage }))
    loadUniversities(appliedFilters, { page: 1, itemsPerPage })
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

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Universities
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loading ? 'Loading...' : `Found ${pagination.totalItems} universities`}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading universities
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* University Cards */}
        {!loading && !error && filteredUniversities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No universities found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or filters to find more universities.
              </p>
            </div>
          </div>
        ) : (
          <UniversityCardList
            universities={filteredUniversities as UIUniversity[]}
            loading={loading}
            onViewDetails={handleViewDetails}
            onApply={handleApply}
            applicationStatus={applicationStatus}
            addingToApplication={addingToApplication}
          />
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalItems > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}