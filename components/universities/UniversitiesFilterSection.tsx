"use client"

import React from "react"
import UniversityFilterBar, { FilterValues } from "@/components/universities/UniversityFilterBar"

type Props = {
  onFiltersChange: (filters: FilterValues) => void
  onSearch: (filters: FilterValues) => void
  className?: string
}

export default function UniversitiesFilterSection({ onFiltersChange, onSearch, className }: Props) {
  return (
    <div className={className}>
      <UniversityFilterBar onFiltersChange={onFiltersChange} onSearch={onSearch} />
    </div>
  )
}

