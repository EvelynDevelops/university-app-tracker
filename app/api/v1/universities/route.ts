import { NextRequest } from 'next/server'
import { 
  withAuth, 
  AuthenticatedRequest, 
  paginatedResponse,
  APIError,
  handleAPIError
} from '@/lib/api/middleware'
import { 
  validateQueryParams, 
  validationSchemas 
} from '@/lib/api/validation'
import { dbService } from '@/lib/api/database'

// Define the structure for university data
interface University {
  id: string
  name: string
  location: string
  country: string
  ranking?: number
  acceptance_rate?: number
  tuition_fees?: number
  programs: string[]
  created_at: string
  updated_at: string
}

/**
 * GET /api/v1/universities
 * Search and filter universities with pagination and sorting
 * 
 * Query Parameters:
 * - q: Search query for university name (case-insensitive)
 * - country: Filter by country
 * - ranking_min/max: Filter by ranking range
 * - acceptance_rate_min/max: Filter by acceptance rate range
 * - tuition_min/max: Filter by tuition fees range
 * - program: Filter by specific program
 * - limit: Number of results (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 * - sort_by: Sort field (default: 'name')
 * - sort_order: Sort order (default: 'asc')
 * 
 * Example: /api/v1/universities?q=MIT&country=USA&ranking_max=50&limit=10
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    // Parse and validate query parameters
    const validatedParams = validateQueryParams(
      req.nextUrl.searchParams,
      validationSchemas.universitySearch
    ) as {
      q?: string
      country?: string
      ranking_min?: number
      ranking_max?: number
      acceptance_rate_min?: number
      acceptance_rate_max?: number
      tuition_min?: number
      tuition_max?: number
      limit?: number
      offset?: number
      sort_by?: string
      sort_order?: 'asc' | 'desc'
    }

    // Set defaults for missing parameters
    const params = {
      limit: 20,
      offset: 0,
      sort_by: 'name' as const,
      sort_order: 'asc' as const,
      ...validatedParams
    }

    // Validate numeric parameter ranges
    if (params.ranking_min && params.ranking_max && params.ranking_min > params.ranking_max) {
      throw new APIError(400, 'ranking_min cannot be greater than ranking_max')
    }

    if (params.acceptance_rate_min && params.acceptance_rate_max && params.acceptance_rate_min > params.acceptance_rate_max) {
      throw new APIError(400, 'acceptance_rate_min cannot be greater than acceptance_rate_max')
    }

    if (params.tuition_min && params.tuition_max && params.tuition_min > params.tuition_max) {
      throw new APIError(400, 'tuition_min cannot be greater than tuition_max')
    }

    // Build and execute query using database service
    const query = dbService.buildUniversitySearchQuery(params)
    const { data: universities, error, count } = await query

    // Handle database errors
    if (error) {
      throw new APIError(500, 'Failed to fetch universities')
    }

    // Return successful response with metadata
    return paginatedResponse(
      universities || [],
      count || 0,
      params.limit,
      params.offset
    )

  } catch (error) {
    return handleAPIError(error)
  }
})

