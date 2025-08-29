import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { 
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
export async function POST(request: NextRequest) {
  try {
    // 认证
    const supabase = supabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new APIError(401, 'Unauthorized')
    }

    // 获取用户资料
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      throw new APIError(403, 'Profile not found')
    }

    // 角色验证
    if (profile.role !== 'student') {
      throw new APIError(403, 'Access denied. Student role required.')
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = validateBody(body, validationSchemas.createProfile)
    
    // Ensure the user can only create/update their own profile
    if (validatedData.user_id !== user.id) {
      throw new APIError(403, 'You can only create/update your own profile')
    }

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
} 