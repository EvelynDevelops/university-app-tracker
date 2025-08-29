import { FilterValues as OriginalFilterValues } from '@/components/universities/UniversityFilterBar'

// Re-export FilterValues with optional fields for use in other files
export type FilterValues = Partial<OriginalFilterValues>

// Types
export interface UIUniversity {
  id: string
  name: string
  ranking: number
  location: string
  acceptanceRate: number
  applicationRequirements: string[]
  logo?: string
}

export interface UniversityAPIResponse {
  data: any[]
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
  filters: {
    applied: Record<string, any>
  }
}

export interface PaginationParams {
  page: number
  itemsPerPage: number
}

// Filter mapping constants
const RANKING_RANGES: { [key: string]: { min: number; max: number } } = {
  'Top 10': { min: 1, max: 10 },
  'Top 25': { min: 1, max: 25 },
  'Top 50': { min: 1, max: 50 },
  'Top 100': { min: 1, max: 100 }
}

const ACCEPTANCE_RATE_RANGES: { [key: string]: { min: number; max: number } } = {
  'Under 10%': { min: 0, max: 10 },
  '10-25%': { min: 10, max: 25 },
  '25-50%': { min: 25, max: 50 },
  'Over 50%': { min: 50, max: 100 }
}

/**
 * Build query parameters from filter values
 */
function buildQueryParams(filters?: FilterValues, pagination?: PaginationParams): URLSearchParams {
  const params = new URLSearchParams()
  
  if (filters?.search) {
    params.append('q', filters.search)
  }
  
  if (filters?.location && filters.location !== 'All Locations') {
    params.append('country', filters.location)
  }
  
  if (filters?.ranking && filters.ranking !== 'All Rankings') {
    const range = RANKING_RANGES[filters.ranking]
    if (range) {
      params.append('ranking_min', range.min.toString())
      params.append('ranking_max', range.max.toString())
    }
  }
  
  if (filters?.acceptanceRate && filters.acceptanceRate !== 'All Acceptance Rates') {
    const range = ACCEPTANCE_RATE_RANGES[filters.acceptanceRate]
    if (range) {
      params.append('acceptance_rate_min', range.min.toString())
      params.append('acceptance_rate_max', range.max.toString())
    }
  }
  
  if (filters?.major && filters.major !== 'All Majors') {
    params.append('program', filters.major)
  }
  
  // Pagination parameters
  const itemsPerPage = pagination?.itemsPerPage || 30
  const page = pagination?.page || 1
  const offset = (page - 1) * itemsPerPage
  
  params.append('limit', itemsPerPage.toString())
  params.append('offset', offset.toString())
  params.append('sort_by', 'ranking')
  params.append('sort_order', 'asc')
  
  return params
}

/**
 * Map API response to UI format
 */
function mapUniversityData(apiData: any[]): UIUniversity[] {
  return apiData.map((row: any) => ({
    id: row.id,
    name: row.name,
    ranking: Number(row.us_news_ranking ?? 0),
    location: [row.city, row.state, row.country].filter(Boolean).join(', '),
    acceptanceRate: Number(row.acceptance_rate ?? 0),
    applicationRequirements: [], // Will be populated separately
    logo: row.logo,
  }))
}

/**
 * Fetch requirements for a specific university
 */
async function fetchUniversityRequirements(universityId: string): Promise<string[]> {
  try {
    const response = await fetch(`/api/v1/universities/${universityId}/requirements`)
    
    if (!response.ok) {
      console.warn(`Failed to fetch requirements for university ${universityId}`)
      return []
    }
    
    const result = await response.json()
    return result.data?.map((req: any) => req.requirement_name) || []
  } catch (error) {
    console.warn(`Error fetching requirements for university ${universityId}:`, error)
    return []
  }
}

/**
 * Map university data with requirements
 */
async function mapUniversityDataWithRequirements(apiData: any[]): Promise<UIUniversity[]> {
  const universities = mapUniversityData(apiData)
  
  // Fetch requirements for each university
  const universitiesWithRequirements = await Promise.all(
    universities.map(async (university) => {
      const requirements = await fetchUniversityRequirements(university.id)
      return {
        ...university,
        applicationRequirements: requirements
      }
    })
  )
  
  return universitiesWithRequirements
}

/**
 * Fetch universities from API
 */
export async function fetchUniversities(filters?: FilterValues, pagination?: PaginationParams): Promise<{
  universities: UIUniversity[]
  pagination: UniversityAPIResponse['pagination']
  error?: string
}> {
  try {
    const params = buildQueryParams(filters, pagination)
    const response = await fetch(`/api/v1/universities?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: UniversityAPIResponse = await response.json()
    const universities = await mapUniversityDataWithRequirements(result.data)
    
    return {
      universities,
      pagination: result.pagination
    }
  } catch (error: any) {
    return {
      universities: [],
      pagination: { total: 0, limit: pagination?.itemsPerPage || 30, offset: 0, has_more: false },
      error: error?.message ?? 'Failed to load universities'
    }
  }
}

/**
 * Get university by ID
 */
export async function getUniversityById(id: string): Promise<{
  university?: UIUniversity
  error?: string
}> {
  try {
    const response = await fetch(`/api/v1/universities/${id}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    const universities = await mapUniversityDataWithRequirements([result.data])
    const university = universities[0]
    
    return { university }
  } catch (error: any) {
    return {
      error: error?.message ?? 'Failed to load university'
    }
  }
}

/**
 * Get popular universities (top ranked)
 */
export async function getPopularUniversities(limit: number = 10): Promise<{
  universities: UIUniversity[]
  error?: string
}> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      sort_by: 'ranking',
      sort_order: 'asc'
    })
    
    const response = await fetch(`/api/v1/universities?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: UniversityAPIResponse = await response.json()
    const universities = await mapUniversityDataWithRequirements(result.data)
    
    return { universities }
  } catch (error: any) {
    return {
      universities: [],
      error: error?.message ?? 'Failed to load popular universities'
    }
  }
} 