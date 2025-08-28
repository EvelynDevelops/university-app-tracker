import { supabaseBrowser } from '@/lib/supabase/helpers'

export interface Student {
  user_id: string
  first_name: string
  last_name: string
  email: string
  graduation_year?: number
  gpa?: number
  sat_score?: number
  act_score?: number
  target_countries?: string[]
  intended_majors?: string[]
}

export interface ParentApplication {
  id: string
  student_id: string
  university_id: string
  application_type: string | null
  deadline: string | null
  status: string
  submitted_date: string | null
  decision_date: string | null
  decision_type: string | null
  notes: string | null
  created_at: string
  university?: {
    id: string
    name: string
    city: string
    state: string
    country: string
    us_news_ranking: number | null
    acceptance_rate: number | null
  }
  student?: {
    first_name: string
    last_name: string
  }
}

export async function getLinkedStudents(): Promise<{
  students?: Student[]
  error?: string
}> {
  try {
    const supabase = supabaseBrowser()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // First, get parent links
    const { data: links, error: linksError } = await supabase
      .from('parent_links')
      .select('student_user_id')
      .eq('parent_user_id', user.id)

    if (linksError) {
      console.error('Parent links query error:', linksError)
      return { error: 'Failed to fetch students' }
    }

    if (!links || links.length === 0) {
      return { students: [] }
    }

    // Get student profiles
    const studentIds = links.map(l => l.student_user_id)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, email')
      .in('user_id', studentIds)

    if (profilesError) {
      console.error('Profiles query error:', profilesError)
      return { error: 'Failed to fetch student profiles' }
    }

    // Get student academic profiles
    const { data: academicProfiles, error: academicError } = await supabase
      .from('student_profile')
      .select('*')
      .in('user_id', studentIds)

    if (academicError) {
      console.error('Academic profiles query error:', academicError)
      // Continue without academic profiles
    }

    const academicMap = new Map((academicProfiles || []).map(p => [p.user_id, p]))

    const formattedStudents: Student[] = (profiles || []).map(profile => {
      const academic = academicMap.get(profile.user_id)
      return {
        user_id: profile.user_id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        graduation_year: academic?.graduation_year,
        gpa: academic?.gpa,
        sat_score: academic?.sat_score,
        act_score: academic?.act_score,
        target_countries: academic?.target_countries,
        intended_majors: academic?.intended_majors,
      }
    })

    return { students: formattedStudents }
  } catch (error) {
    console.error('getLinkedStudents error:', error)
    return { error: 'Internal server error' }
  }
}

export async function getStudentApplications(studentId: string): Promise<{
  applications?: ParentApplication[]
  error?: string
}> {
  try {
    const supabase = supabaseBrowser()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Verify parent has access to this student
    const { data: link, error: linkError } = await supabase
      .from('parent_links')
      .select('student_user_id')
      .eq('parent_user_id', user.id)
      .eq('student_user_id', studentId)
      .single()

    if (linkError || !link) {
      return { error: 'Access denied' }
    }

    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        universities (
          id, name, city, state, country, us_news_ranking, acceptance_rate
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) {
      return { error: 'Failed to fetch applications' }
    }

    // Get student profile separately
    const { data: studentProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', studentId)
      .single()

    if (error) {
      return { error: 'Failed to fetch applications' }
    }

    const applicationsWithStudent = (applications || []).map(app => ({
      ...app,
      student: studentProfile ? {
        first_name: studentProfile.first_name,
        last_name: studentProfile.last_name
      } : undefined
    }))

    return { applications: applicationsWithStudent }
  } catch (error) {
    return { error: 'Internal server error' }
  }
}

export async function getStudentApplication(applicationId: string): Promise<{
  application?: ParentApplication
  error?: string
}> {
  try {
    const supabase = supabaseBrowser()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get application with parent access verification
    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        *,
        universities (
          id, name, city, state, country, us_news_ranking, acceptance_rate
        )
      `)
      .eq('id', applicationId)
      .single()

    if (error || !application) {
      return { error: 'Application not found' }
    }

    // Get student profile separately
    const { data: studentProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', application.student_id)
      .single()

    if (error || !application) {
      return { error: 'Application not found' }
    }

    // Verify parent has access to this student
    const { data: link, error: linkError } = await supabase
      .from('parent_links')
      .select('student_user_id')
      .eq('parent_user_id', user.id)
      .eq('student_user_id', application.student_id)
      .single()

    if (linkError || !link) {
      return { error: 'Access denied' }
    }

    const applicationWithStudent = {
      ...application,
      student: studentProfile ? {
        first_name: studentProfile.first_name,
        last_name: studentProfile.last_name
      } : undefined
    }

    return { application: applicationWithStudent }
  } catch (error) {
    return { error: 'Internal server error' }
  }
}

export async function checkParentOnboarding(): Promise<{
  needsOnboarding?: boolean
  error?: string
}> {
  try {
    const supabase = supabaseBrowser()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Check if parent has any linked students
    const { data: links, error } = await supabase
      .from('parent_links')
      .select('student_user_id')
      .eq('parent_user_id', user.id)
      .limit(1)

    if (error) {
      return { error: 'Failed to check onboarding status' }
    }

    return { needsOnboarding: !links || links.length === 0 }
  } catch (error) {
    return { error: 'Internal server error' }
  }
}

export async function postParentNote(applicationId: string, note: string): Promise<{
  error?: string
}> {
  try {
    const supabase = supabaseBrowser()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Verify parent has access to this application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('student_id')
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      return { error: 'Application not found' }
    }

    const { data: link, error: linkError } = await supabase
      .from('parent_links')
      .select('student_user_id')
      .eq('parent_user_id', user.id)
      .eq('student_user_id', application.student_id)
      .single()

    if (linkError || !link) {
      return { error: 'Access denied' }
    }

    const { error } = await supabase
      .from('parent_notes')
      .insert({
        application_id: applicationId,
        parent_user_id: user.id,
        note
      })

    if (error) {
      return { error: 'Failed to post note' }
    }

    return {}
  } catch (error) {
    return { error: 'Internal server error' }
  }
}