import { FilterValues } from "@/components/universities/UniversityFilterBar"

export type UniversityForFilter = {
  name: string
  location: string
  ranking: number
  acceptanceRate: number
}

function matchesLocation(location: string, filter: string): boolean {
  if (!filter || filter === "All Locations") return true
  const loc = location.toLowerCase()
  switch (filter) {
    case "California":
      return loc.includes("ca") || loc.includes("california")
    case "Massachusetts":
      return loc.includes("ma") || loc.includes("massachusetts")
    case "Connecticut":
      return loc.includes("ct") || loc.includes("connecticut")
    case "New Jersey":
      return loc.includes("nj") || loc.includes("new jersey")
    default:
      return true
  }
}

export function filterUniversities(
  universities: UniversityForFilter[],
  appliedFilters: FilterValues
) {
  return universities.filter((u) => {
    // search by name
    if (
      appliedFilters.search &&
      !u.name.toLowerCase().includes(appliedFilters.search.toLowerCase())
    ) {
      return false
    }

    // location
    if (appliedFilters.location !== "All Locations") {
      if (!matchesLocation(u.location, appliedFilters.location)) return false
    }

    // ranking
    if (appliedFilters.ranking !== "All Rankings") {
      const r = u.ranking
      if (appliedFilters.ranking === "Top 5" && r > 5) return false
      if (appliedFilters.ranking === "Top 10" && r > 10) return false
      if (appliedFilters.ranking === "Top 20" && r > 20) return false
      if (appliedFilters.ranking === "Top 50" && r > 50) return false
      if (appliedFilters.ranking === "Top 100" && r > 100) return false
    }

    // acceptance rate
    if (appliedFilters.acceptanceRate !== "All Acceptance Rates") {
      const rate = u.acceptanceRate
      if (appliedFilters.acceptanceRate === "Under 5%" && rate >= 5) return false
      if (
        appliedFilters.acceptanceRate === "5% - 10%" &&
        (rate < 5 || rate > 10)
      )
        return false
      if (
        appliedFilters.acceptanceRate === "10% - 20%" &&
        (rate < 10 || rate > 20)
      )
        return false
      if (
        appliedFilters.acceptanceRate === "20% - 50%" &&
        (rate < 20 || rate > 50)
      )
        return false
      if (appliedFilters.acceptanceRate === "Over 50%" && rate <= 50) return false
    }

    return true
  })
}

