import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { 
  successResponse,
  APIError,
  handleAPIError
} from '@/lib/api/middleware'
import { 
  validateBody 
} from '@/lib/api/validation'

// 验证模式
const createNoteSchema = {
  application_id: { required: true, type: 'uuid' as const },
  note: { required: true, type: 'string' as const, maxLength: 2000 }
}

/**
 * POST /api/v1/parent/notes
 * Create a new note for an application (Parent only)
 * 
 * Request Body:
 * {
 *   application_id: string,
 *   note: string
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
    if (profile.role !== 'parent') {
      throw new APIError(403, 'Access denied. Parent role required.')
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = validateBody(body, createNoteSchema)

    // Verify parent has access to this application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('student_id')
      .eq('id', validatedData.application_id)
      .single()

    if (appError || !application) {
      throw new APIError(404, 'Application not found')
    }

    // Check if parent is linked to the student
    const { data: link, error: linkError } = await supabase
      .from('parent_links')
      .select('student_user_id')
      .eq('parent_user_id', user.id)
      .eq('student_user_id', application.student_id)
      .maybeSingle()

    if (linkError || !link) {
      throw new APIError(403, 'Access denied to this application')
    }

    // Create the note
    const { data, error } = await supabase
      .from('parent_notes')
      .insert({ 
        application_id: validatedData.application_id, 
        parent_user_id: user.id, 
        note: validatedData.note 
      })
      .select()
      .single()
      
    if (error) {
      throw new APIError(500, 'Failed to create note')
    }
    
    return successResponse(data, 'Note created successfully', 201)
  } catch (error) {
    return handleAPIError(error)
  }
}

