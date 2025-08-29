import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { 
  withRole, 
  AuthenticatedRequest, 
  successResponse,
  APIError,
  handleAPIError
} from '@/lib/api/middleware'
import { 
  validateBody, 
  validationSchemas 
} from '@/lib/api/validation'

/**
 * POST /api/v1/student/profiles
 * Create or update a student profile
 * 
 * Request Body:
 * {
 *   user_id: string,
 *   role: "student" | "parent",
 *   first_name?: string,
 *   last_name?: string,
 *   email?: string
 * }
 */
export const POST = withRole('student')(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    
    // Validate request body
    const validatedData = validateBody(body, validationSchemas.createProfile)
    
    // Ensure the user can only create/update their own profile
    if (validatedData.user_id !== req.user.id) {
      throw new APIError(403, 'You can only create/update your own profile')
    }

    const supabase = supabaseServer()

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: validatedData.user_id,
          role: validatedData.role,
          first_name: validatedData.first_name ?? null,
          last_name: validatedData.last_name ?? null,
          email: validatedData.email ?? null,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single()

    if (error) {
      throw new APIError(400, error.message)
    }
    
    return successResponse(data, 'Profile created/updated successfully', 201)
  } catch (error) {
    return handleAPIError(error)
  }
}) 