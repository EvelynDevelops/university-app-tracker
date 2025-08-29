import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { 
  successResponse, 
  paginatedResponse,
  APIError,
  handleAPIError
} from '@/lib/api/middleware'
import { 
  validateBody, 
  validationSchemas 
} from '@/lib/api/validation'
import { dbService } from '@/lib/api/database'

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

    // Get applications using database service
    const applications = await dbService.getUserApplications(user.id)

    // Transform the data to include location
    const transformedApplications = applications.map(app => ({
      ...app,
      university: app.university ? {
        ...app.university,
        location: [app.university.city, app.university.state, app.university.country]
          .filter(Boolean)
          .join(', ')
      } : null
    }))

    return paginatedResponse(
      transformedApplications,
      transformedApplications.length,
      transformedApplications.length,
      0
    )

  } catch (error) {
    return handleAPIError(error)
  }
}

/**
 * POST /api/v1/applications
 * Add a new application for the current student
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
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = validateBody(body, validationSchemas.createApplication) as {
      university_id: string
      application_type?: string
      deadline?: string
      notes?: string
    }

    // Check if university exists
    const university = await dbService.checkUniversityExists(validatedData.university_id)

    // Check if application already exists
    const exists = await dbService.checkApplicationExists(user.id, validatedData.university_id)
    if (exists) {
      throw new APIError(409, 'Application already exists for this university')
    }

    // Create new application
    const { data: newApplication, error: insertError } = await supabase
      .from('applications')
      .insert({
        student_id: user.id,
        university_id: validatedData.university_id,
        application_type: validatedData.application_type || null,
        deadline: validatedData.deadline || null,
        status: 'NOT_STARTED',
        notes: validatedData.notes || null
      })
      .select()
      .single()

    if (insertError) {
      throw new APIError(500, 'Failed to create application')
    }

    return successResponse(
      newApplication,
      `Successfully added ${university.name} to your application list`,
      201
    )

  } catch (error) {
    return handleAPIError(error)
  }
}
