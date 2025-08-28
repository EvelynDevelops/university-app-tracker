import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/v1/applications/[id]
 * Get detailed information for a specific application
 * 
 * Path Parameters:
 * - id: Application ID (UUID)
 * 
 * Example: /api/v1/applications/123e4567-e89b-12d3-a456-426614174000
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid application ID format' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = supabaseServer()

    // Fetch application details with university information
    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        *,
        universities (
          id,
          name,
          city,
          state,
          country,
          us_news_ranking,
          acceptance_rate,
          application_system,
          tuition_in_state,
          tuition_out_state,
          application_fee,
          deadlines
        )
      `)
      .eq('id', id)
      .single()

    // Handle database errors
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch application' },
        { status: 500 }
      )
    }

    // Return successful response
    return NextResponse.json({
      data: application
    })

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in application API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid application ID format' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = supabaseServer()

    // Build update payload (only include provided fields)
    const updatePayload: Record<string, any> = {}
    if (body.status !== undefined) updatePayload.status = body.status
    if (body.submitted_date !== undefined) updatePayload.submitted_date = body.submitted_date
    if (body.decision_date !== undefined) updatePayload.decision_date = body.decision_date
    if (body.decision_type !== undefined) updatePayload.decision_type = body.decision_type
    if (body.notes !== undefined) updatePayload.notes = body.notes
    if (body.application_type !== undefined) updatePayload.application_type = body.application_type
    if (body.deadline !== undefined) updatePayload.deadline = body.deadline

    // Update application
    const { data: updatedRow, error } = await supabase
      .from('applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      )
    }

    // Re-fetch with joined university details to keep response shape consistent with GET
    const { data: applicationWithUniversity, error: refetchError } = await supabase
      .from('applications')
      .select(`
        *,
        universities (
          id,
          name,
          city,
          state,
          country,
          us_news_ranking,
          acceptance_rate,
          application_system,
          tuition_in_state,
          tuition_out_state,
          application_fee,
          deadlines
        )
      `)
      .eq('id', id)
      .single()

    if (refetchError) {
      console.error('Refetch error after update:', refetchError)
      return NextResponse.json({
        message: 'Application updated, but failed to include university details',
        data: updatedRow
      })
    }

    return NextResponse.json({
      message: 'Application updated successfully',
      data: applicationWithUniversity
    })

  } catch (error) {
    console.error('Unexpected error in application PUT API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
