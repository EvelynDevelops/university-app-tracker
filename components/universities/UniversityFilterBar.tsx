"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { MapPinIcon, GraduationCapIcon, StarIcon, UsersIcon, SearchIcon, ChevronDownIcon } from '@/public/icons'

interface UniversityFilterBarProps {
  onFiltersChange: (filters: FilterValues) => void
  onSearch: (filters: FilterValues) => void
  className?: string
}

export interface FilterValues {
  search: string
  major: string
  location: string
  ranking: string
  acceptanceRate: string
}

const majors = [
  "All Majors",
  "Computer Science",
  "Engineering",
  "Business Administration",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Economics",
  "Psychology",
  "Political Science",
  "English",
  "History",
  "Art & Design"
]

const locations = [
  "All Locations",
  "California",
  "Massachusetts", 
  "Connecticut",
  "New Jersey",
  "New York",
  "Pennsylvania",
  "Illinois",
  "Michigan",
  "Texas"
]

const rankingRanges = [
  "All Rankings",
  "Top 5",
  "Top 10", 
  "Top 20",
  "Top 50",
  "Top 100"
]

const acceptanceRateRanges = [
  "All Acceptance Rates",
  "Under 5%",
  "5% - 10%",
  "10% - 20%",
  "20% - 50%",
  "Over 50%"
]

export default function UniversityFilterBar({ onFiltersChange, onSearch, className }: UniversityFilterBarProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    major: "All Majors",
    location: "All Locations",
    ranking: "All Rankings",
    acceptanceRate: "All Acceptance Rates"
  })

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    // 只更新筛选条件，不触发搜索
    onFiltersChange(newFilters)
  }

  const handleSearch = () => {
    // 点击搜索按钮时才触发搜索
    onSearch(filters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className={cn("bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg shadow-lg p-6", className)}>
      {/* Top Section - What and Where */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* What Section */}
        <div>
          <label className="block text-white font-bold text-sm mb-2">
            What
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter keywords"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-white rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <select
                value={filters.major}
                onChange={(e) => handleFilterChange('major', e.target.value)}
                className="appearance-none px-4 py-3 bg-white rounded-lg text-gray-900 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                {majors.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Where Section */}
        <div>
          <label className="block text-white font-bold text-sm mb-2">
            Where
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-4 py-3 bg-white rounded-lg text-gray-900 appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            <Button
              onClick={handleSearch}
              className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              SEARCH
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Ranking Filter */}
        <div className="relative">
          <select
            value={filters.ranking}
            onChange={(e) => handleFilterChange('ranking', e.target.value)}
            className="appearance-none px-4 py-2 bg-transparent border border-white rounded-full text-white text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
          >
            {rankingRanges.map((ranking) => (
              <option key={ranking} value={ranking} className="bg-blue-800 text-white">
                {ranking}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white pointer-events-none" />
        </div>

        {/* Acceptance Rate Filter */}
        <div className="relative">
          <select
            value={filters.acceptanceRate}
            onChange={(e) => handleFilterChange('acceptanceRate', e.target.value)}
            className="appearance-none px-4 py-2 bg-transparent border border-white rounded-full text-white text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
          >
            {acceptanceRateRanges.map((rate) => (
              <option key={rate} value={rate} className="bg-blue-800 text-white">
                {rate}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white pointer-events-none" />
        </div>
      </div>
    </div>
  )
} 