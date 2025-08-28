import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

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

// Define query parameters interface for type safety
interface SearchParams {
  q?: string // Search query for university name
  country?: string // Filter by country
  ranking_min?: number // Minimum ranking filter
  ranking_max?: number // Maximum ranking filter
  acceptance_rate_min?: number // Minimum acceptance rate filter
  acceptance_rate_max?: number // Maximum acceptance rate filter
  tuition_min?: number // Minimum tuition fees filter
  tuition_max?: number // Maximum tuition fees filter
  program?: string // Filter by specific program
  limit?: number // Number of results to return
  offset?: number // Pagination offset
  sort_by?: 'name' | 'ranking' | 'acceptance_rate' | 'tuition_fees' // Sort field
  sort_order?: 'asc' | 'desc' // Sort order
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
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const params: SearchParams = {
      q: searchParams.get('q') || undefined,
      country: searchParams.get('country') || undefined,
      ranking_min: searchParams.get('ranking_min') ? parseInt(searchParams.get('ranking_min')!) : undefined,
      ranking_max: searchParams.get('ranking_max') ? parseInt(searchParams.get('ranking_max')!) : undefined,
      acceptance_rate_min: searchParams.get('acceptance_rate_min') ? parseFloat(searchParams.get('acceptance_rate_min')!) : undefined,
      acceptance_rate_max: searchParams.get('acceptance_rate_max') ? parseFloat(searchParams.get('acceptance_rate_max')!) : undefined,
      tuition_min: searchParams.get('tuition_min') ? parseFloat(searchParams.get('tuition_min')!) : undefined,
      tuition_max: searchParams.get('tuition_max') ? parseFloat(searchParams.get('tuition_max')!) : undefined,
      program: searchParams.get('program') || undefined,
      limit: searchParams.get('limit') ? Math.min(parseInt(searchParams.get('limit')!), 100) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      sort_by: (searchParams.get('sort_by') as SearchParams['sort_by']) || 'name',
      sort_order: (searchParams.get('sort_order') as SearchParams['sort_order']) || 'asc'
    }

    // Validate numeric parameters
    if (params.ranking_min && params.ranking_max && params.ranking_min > params.ranking_max) {
      return NextResponse.json(
        { error: 'ranking_min cannot be greater than ranking_max' },
        { status: 400 }
      )
    }

    if (params.acceptance_rate_min && params.acceptance_rate_max && params.acceptance_rate_min > params.acceptance_rate_max) {
      return NextResponse.json(
        { error: 'acceptance_rate_min cannot be greater than acceptance_rate_max' },
        { status: 400 }
      )
    }

    if (params.tuition_min && params.tuition_max && params.tuition_min > params.tuition_max) {
      return NextResponse.json(
        { error: 'tuition_min cannot be greater than tuition_max' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = supabaseServer()

    // Build the query with filters
    let query = supabase
      .from('universities')
      .select('*', { count: 'exact' })

    // Apply search filter for university name
    if (params.q) {
      query = query.ilike('name', `%${params.q}%`)
    }

    // Apply country filter
    if (params.country) {
      query = query.eq('country', params.country)
    }

    // Apply ranking range filter (using us_news_ranking field)
    if (params.ranking_min !== undefined) {
      query = query.gte('us_news_ranking', params.ranking_min)
    }
    if (params.ranking_max !== undefined) {
      query = query.lte('us_news_ranking', params.ranking_max)
    }

    // Apply acceptance rate range filter
    if (params.acceptance_rate_min !== undefined) {
      query = query.gte('acceptance_rate', params.acceptance_rate_min)
    }
    if (params.acceptance_rate_max !== undefined) {
      query = query.lte('acceptance_rate', params.acceptance_rate_max)
    }

    // Apply tuition fees range filter (using tuition_out_state as default)
    if (params.tuition_min !== undefined) {
      query = query.gte('tuition_out_state', params.tuition_min)
    }
    if (params.tuition_max !== undefined) {
      query = query.lte('tuition_out_state', params.tuition_max)
    }

    // Note: programs field doesn't exist in current schema, so we'll skip program filter for now

    // Apply sorting (map sort_by to actual database field names)
    const sortFieldMap: { [key: string]: string } = {
      'name': 'name',
      'ranking': 'us_news_ranking',
      'acceptance_rate': 'acceptance_rate',
      'tuition_fees': 'tuition_out_state'
    }
    const sortField = sortFieldMap[params.sort_by!] || 'name'
    query = query.order(sortField, { ascending: params.sort_order === 'asc' })

    // Apply pagination
    query = query.range(params.offset!, params.offset! + params.limit! - 1)

    // Execute the query
    const { data: universities, error, count } = await query

    // Handle database errors
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch universities' },
        { status: 500 }
      )
    }

    // Return successful response with metadata
    return NextResponse.json({
      data: universities || [],
      pagination: {
        total: count || 0,
        limit: params.limit!,
        offset: params.offset!,
        has_more: (count || 0) > params.offset! + params.limit!
      },
      filters: {
        applied: Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
        )
      }
    })

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in universities API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

