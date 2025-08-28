import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

// Define the structure for application data
interface Application {
  id: string
  student_id: string
  university_id: string
  application_type?: string
  deadline?: string
  status: string
  submitted_date?: string
  decision_date?: string
  decision_type?: string
  notes?: string
  created_at: string
  university?: {
    id: string
    name: string
    location: string
    ranking?: number
    acceptance_rate?: number
  }
}

/**
 * GET /api/v1/applications
 * Get applications for the current student
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to check if they are a student
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'student') {
      return NextResponse.json(
        { error: 'Access denied. Student role required.' },
        { status: 403 }
      )
    }

    // Get applications with university details
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        university:universities(
          id,
          name,
          city,
          state,
          country,
          us_news_ranking,
          acceptance_rate
        )
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    // Transform the data to include location
    const transformedApplications = applications?.map(app => ({
      ...app,
      university: app.university ? {
        ...app.university,
        location: [app.university.city, app.university.state, app.university.country]
          .filter(Boolean)
          .join(', ')
      } : null
    })) || []

    return NextResponse.json({
      data: transformedApplications,
      total: transformedApplications.length
    })

  } catch (error) {
    console.error('Unexpected error in applications API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/applications
 * Add a new application for the current student
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to check if they are a student
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'student') {
      return NextResponse.json(
        { error: 'Access denied. Student role required.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { university_id, application_type, deadline, notes } = body

    // Validate required fields
    if (!university_id) {
      return NextResponse.json(
        { error: 'university_id is required' },
        { status: 400 }
      )
    }

    // Check if university exists
    const { data: university, error: universityError } = await supabase
      .from('universities')
      .select('id, name')
      .eq('id', university_id)
      .single()

    if (universityError || !university) {
      return NextResponse.json(
        { error: 'University not found' },
        { status: 404 }
      )
    }

    // Check if application already exists for this student and university
    const { data: existingApplication, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('student_id', user.id)
      .eq('university_id', university_id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing application:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing application' },
        { status: 500 }
      )
    }

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Application already exists for this university' },
        { status: 409 }
      )
    }

    // Create new application
    const { data: newApplication, error: insertError } = await supabase
      .from('applications')
      .insert({
        student_id: user.id,
        university_id,
        application_type: application_type || null,
        deadline: deadline || null,
        status: 'NOT_STARTED',
        notes: notes || null
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: newApplication,
      message: `Successfully added ${university.name} to your application list`
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in applications API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
