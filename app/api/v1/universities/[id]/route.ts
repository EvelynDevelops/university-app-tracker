import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/v1/universities/[id]
 * Get detailed information for a specific university
 * 
 * Path Parameters:
 * - id: University ID (UUID)
 * 
 * Example: /api/v1/universities/508d46ce-c832-4aa2-879d-d9ed1cfd58b1
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
        { error: 'Invalid university ID format' },
        { status: 400 }
      )
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
        return NextResponse.json(
          { error: 'University not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch university' },
        { status: 500 }
      )
    }

    // Return successful response
    return NextResponse.json({
      data: university
    })

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in university API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
