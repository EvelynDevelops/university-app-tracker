"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MapPinIcon, GraduationCapIcon, StarIcon, UsersIcon, SearchIcon, ChevronDownIcon } from '@/public/icons'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/filter-bar'

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
  "USA",
  "Canada",
  "UK",
  "Australia",
  "New Zealand",
  "Other"
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
    onFiltersChange(newFilters)
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const popoverItemClass = "w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
  const triggerBase = "flex items-center justify-between gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
  const triggerPill = "appearance-none px-4 py-2 bg-transparent border border-black dark:border-white/80 rounded-full text-black dark:text-white text-sm"

  return (
    <div className={cn("bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6", className)}>
      {/* Top Section - What and Where */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* What Section */}
        <div>
          <label className="block text-gray-900 dark:text-white font-bold text-sm mb-2">
            What
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter University Name"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
              />
            </div>
            {/* Major Popover */}
            <Popover>
              <PopoverTrigger className={cn(triggerBase, "pr-10 relative whitespace-nowrap w-48 h-[48px] truncate")}> 
                <span className="truncate">{filters.major}</span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute right-3" />
              </PopoverTrigger>
              <PopoverContent className="w-60 p-2">
                <div className="flex flex-col gap-1">
                  {majors.map((m) => (
                    <button key={m} onClick={() => handleFilterChange('major', m)} className={popoverItemClass}>
                      {m}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Where Section */}
        <div>
          <label className="block text-gray-900 dark:text-white font-bold text-sm mb-2">
            Where
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Popover>
                <PopoverTrigger className={cn(triggerBase, "pr-10 w-full relative text-left h-[48px] truncate")}> 
                  <span className="truncate">{filters.location}</span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute right-3" />
                </PopoverTrigger>
                <PopoverContent className="w-60 p-2">
                  <div className="flex flex-col gap-1">
                    {locations.map((loc) => (
                      <button key={loc} onClick={() => handleFilterChange('location', loc)} className={popoverItemClass}>
                        {loc}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={handleSearch}
              className="w-40 h-[48px] bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              SEARCH
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Ranking Filter */}
        <Popover>
          <PopoverTrigger className={cn(triggerPill, "pr-8 relative w-40 h-9 truncate")}> 
            <span className="truncate">{filters.ranking}</span>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-black dark:text-white" />
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2">
            <div className="flex flex-col gap-1">
              {rankingRanges.map((r) => (
                <button key={r} onClick={() => handleFilterChange('ranking', r)} className={popoverItemClass}>
                  {r}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Acceptance Rate Filter */}
        <Popover>
          <PopoverTrigger className={cn(triggerPill, "pr-8 relative w-40 h-9 truncate")}> 
            <span className="truncate">{filters.acceptanceRate}</span>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-black dark:text-white" />
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2">
            <div className="flex flex-col gap-1">
              {acceptanceRateRanges.map((rate) => (
                <button key={rate} onClick={() => handleFilterChange('acceptanceRate', rate)} className={popoverItemClass}>
                  {rate}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
} 