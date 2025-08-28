import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/v1/universities/[id]/requirements
 * Get requirements for a specific university
 * 
 * Path Parameters:
 * - id: University ID (UUID)
 * 
 * Query Parameters:
 * - application_id: Optional application ID to get progress status
 * 
 * Example: /api/v1/universities/eb963fa5-89e6-45b2-aedb-6c119715dbfe/requirements?application_id=123
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const applicationId = searchParams.get('application_id')

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid university ID format' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = supabaseServer()

    // If application_id is provided, also fetch progress (LEFT JOIN behavior)
    if (applicationId && uuidRegex.test(applicationId)) {
      const [requirementsRes, progressRes] = await Promise.all([
        supabase
          .from('university_requirements')
          .select('*')
          .eq('university_id', id)
          .order('order_index', { ascending: true }),
        supabase
          .from('application_requirement_progress')
          .select('id, application_id, requirement_id, status, completed_at, notes')
          .eq('application_id', applicationId)
      ])

      if (requirementsRes.error || progressRes.error) {
        console.error('Database error:', requirementsRes.error || progressRes.error)
        return NextResponse.json(
          { error: 'Failed to fetch university requirements' },
          { status: 500 }
        )
      }

      const progressByRequirement: Record<string, any> = {}
      for (const p of (progressRes.data || [])) {
        progressByRequirement[p.requirement_id] = p
      }

      const merged = (requirementsRes.data || []).map((r: any) => ({
        ...r,
        application_requirement_progress: progressByRequirement[r.id] ? [progressByRequirement[r.id]] : []
      }))

      return NextResponse.json({ data: merged })
    }

    // If no application_id, fetch all requirements without progress
    const { data: requirements, error } = await supabase
      .from('university_requirements')
      .select('*')
      .eq('university_id', id)
      .order('order_index', { ascending: true })

    // Handle database errors
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch university requirements' },
        { status: 500 }
      )
    }

    // Return successful response with requirements
    return NextResponse.json({
      data: requirements || []
    })

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in university requirements API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/universities/[id]/requirements
 * Create a new requirement for a university (Admin only)
 * 
 * Request Body:
 * {
 *   requirement_type: string,
 *   requirement_name: string,
 *   description?: string,
 *   is_required?: boolean,
 *   order_index?: number
 * }
 */
export async function POST(
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
        { error: 'Invalid university ID format' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.requirement_type || !body.requirement_name) {
      return NextResponse.json(
        { error: 'requirement_type and requirement_name are required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = supabaseServer()

    // Create new requirement
    const { data: requirement, error } = await supabase
      .from('university_requirements')
      .insert([{
        university_id: id,
        requirement_type: body.requirement_type,
        requirement_name: body.requirement_name,
        description: body.description,
        is_required: body.is_required ?? true,
        order_index: body.order_index ?? 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create requirement' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Requirement created successfully',
      data: requirement
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in university requirements POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 