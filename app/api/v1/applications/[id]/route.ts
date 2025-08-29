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
import { 
  validateBody, 
  validationSchemas 
} from '@/lib/api/validation'
import { dbService } from '@/lib/api/database'

/**
 * GET /api/v1/applications/[id]
 * Get detailed information for a specific application
 * 
 * Path Parameters:
 * - id: Application ID (UUID)
 * 
 * Example: /api/v1/applications/123e4567-e89b-12d3-a456-426614174000
 */
export const GET = withAuthWithParams<{ id: string }>(async (
  req: AuthenticatedRequest,
  params: { id: string }
) => {
  try {
    const { id } = params

    // Validate UUID format
    if (!validateUUID(id)) {
      throw new APIError(400, 'Invalid application ID format')
    }

    // Check access permissions
    const hasAccess = await dbService.checkApplicationAccess(req.user.id, id, req.profile.role)
    if (!hasAccess) {
      throw new APIError(403, 'Access denied to this application')
    }

    // Get application details
    const application = await dbService.getApplicationWithUniversity(id)

    return successResponse(application)

  } catch (error) {
    return handleAPIError(error)
  }
})

/**
 * PUT /api/v1/applications/[id]
 * Update application status and details
 * 
 * Request Body:
 * {
 *   status?: application_status,
 *   submitted_date?: string,
 *   decision_date?: string,
 *   decision_type?: string,
 *   notes?: string,
 *   application_type?: string,
 *   deadline?: string
 * }
 */
export const PUT = withAuthWithParams<{ id: string }>(async (
  req: AuthenticatedRequest,
  params: { id: string }
) => {
  try {
    const { id } = params
    const body = await req.json()

    // Validate UUID format
    if (!validateUUID(id)) {
      throw new APIError(400, 'Invalid application ID format')
    }

    // Validate request body
    const validatedData = validateBody(body, validationSchemas.updateApplication) as {
      status?: string
      submitted_date?: string
      decision_date?: string
      decision_type?: string
      notes?: string
      application_type?: string
      deadline?: string
    }

    // Check access permissions
    const hasAccess = await dbService.checkApplicationAccess(req.user.id, id, req.profile.role)
    if (!hasAccess) {
      throw new APIError(403, 'Access denied to this application')
    }

    const supabase = supabaseServer()

    // Build update payload (only include provided fields)
    const updatePayload: Record<string, any> = {}
    if (validatedData.status !== undefined) updatePayload.status = validatedData.status
    if (validatedData.submitted_date !== undefined) updatePayload.submitted_date = validatedData.submitted_date
    if (validatedData.decision_date !== undefined) updatePayload.decision_date = validatedData.decision_date
    if (validatedData.decision_type !== undefined) updatePayload.decision_type = validatedData.decision_type
    if (validatedData.notes !== undefined) updatePayload.notes = validatedData.notes
    if (validatedData.application_type !== undefined) updatePayload.application_type = validatedData.application_type
    if (validatedData.deadline !== undefined) updatePayload.deadline = validatedData.deadline

    // Update application
    const { data: updatedRow, error } = await supabase
      .from('applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new APIError(500, 'Failed to update application')
    }

    // Re-fetch with joined university details to keep response shape consistent with GET
    const applicationWithUniversity = await dbService.getApplicationWithUniversity(id)

    return successResponse(
      applicationWithUniversity,
      'Application updated successfully'
    )

  } catch (error) {
    return handleAPIError(error)
  }
})
