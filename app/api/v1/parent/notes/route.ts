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
export const POST = withRole('parent')(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    
    // Validate request body
    const validatedData = validateBody(body, createNoteSchema)

    const supabase = supabaseServer()

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
      .eq('parent_user_id', req.user.id)
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
        parent_user_id: req.user.id, 
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
})

