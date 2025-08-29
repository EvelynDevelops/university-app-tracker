import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { 
  withAuthWithParams, 
  AuthenticatedRequest, 
  successResponse,
  validateUUID,
  APIError,
  handleAPIError
} from '@/lib/api/middleware'

/**
 * GET /api/v1/universities/[id]
 * Get detailed information for a specific university
 * 
 * Path Parameters:
 * - id: University ID (UUID)
 * 
 * Example: /api/v1/universities/508d46ce-c832-4aa2-879d-d9ed1cfd58b1
 */
export const GET = withAuthWithParams<{ id: string }>(async (
  req: AuthenticatedRequest,
  params: { id: string }
) => {
  try {
    const { id } = params

    // Validate UUID format
    if (!validateUUID(id)) {
      throw new APIError(400, 'Invalid university ID format')
    }

    // Initialize Supabase client
    const supabase = supabaseServer()

    // Fetch university details
    const { data: university, error } = await supabase
      .from('universities')
      .select('*')
      .eq('id', id)
      .single()

    // Handle database errors
    if (error) {
      if (error.code === 'PGRST116') {
        throw new APIError(404, 'University not found')
      }
      throw new APIError(500, 'Failed to fetch university')
    }

    // Return successful response
    return successResponse(university)

  } catch (error) {
    return handleAPIError(error)
  }
})
