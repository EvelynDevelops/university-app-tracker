import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

/**
 * PUT /api/v1/applications/[id]/requirements/[requirementId]
 * Update requirement progress for a specific application
 * 
 * Path Parameters:
 * - id: Application ID (UUID)
 * - requirementId: Requirement ID (UUID)
 * 
 * Request Body:
 * {
 *   status: requirement_status,
 *   notes?: string
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; requirementId: string } }
) {
  try {
    const { id, requirementId } = params
    const body = await request.json()

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id) || !uuidRegex.test(requirementId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = supabaseServer()

    // Check if progress record exists
    const { data: existingProgress } = await supabase
      .from('application_requirement_progress')
      .select('id')
      .eq('application_id', id)
      .eq('requirement_id', requirementId)
      .single()

    let result

    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('application_requirement_progress')
        .update({
          status: body.status,
          notes: body.notes,
          completed_at: body.status === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('application_id', id)
        .eq('requirement_id', requirementId)
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to update requirement progress' },
          { status: 500 }
        )
      }

      result = data
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from('application_requirement_progress')
        .insert([{
          application_id: id,
          requirement_id: requirementId,
          status: body.status,
          notes: body.notes,
          completed_at: body.status === 'completed' ? new Date().toISOString() : null
        }])
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to create requirement progress' },
          { status: 500 }
        )
      }

      result = data
    }

    return NextResponse.json({
      message: 'Requirement progress updated successfully',
      data: result
    })

  } catch (error) {
    console.error('Unexpected error in requirement progress API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/applications/[id]/requirements/[requirementId]
 * Get requirement progress for a specific application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; requirementId: string } }
) {
  try {
    const { id, requirementId } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id) || !uuidRegex.test(requirementId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = supabaseServer()

    // Get progress record
    const { data: progress, error } = await supabase
      .from('application_requirement_progress')
      .select('*')
      .eq('application_id', id)
      .eq('requirement_id', requirementId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch requirement progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: progress || null
    })

  } catch (error) {
    console.error('Unexpected error in requirement progress GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 