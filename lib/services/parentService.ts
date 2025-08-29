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

// Service class for better organization and error handling
class ParentService {
  private async getCurrentUser() {
    const { data: { user }, error } = await supabaseBrowser().auth.getUser()
    if (error || !user) {
      throw new Error('Unauthorized')
    }
    return user
  }

  private handleError(error: any, context: string): string {
    console.error(`${context} error:`, error)
    
    // Handle specific Supabase errors
    if (error?.code === 'PGRST116') {
      return 'No data found'
    }
    
    if (error?.code === '23503') {
      return 'Invalid reference data'
    }
    
    return error?.message || 'An unexpected error occurred'
  }

  async getLinkedStudents(): Promise<{
    students: Student[]
    error?: string
  }> {
    try {
      const user = await this.getCurrentUser()
      const supabase = supabaseBrowser()

      // Get parent links
      const { data: links, error: linksError } = await supabase
        .from('parent_links')
        .select('student_user_id')
        .eq('parent_user_id', user.id)

      if (linksError) {
        return { 
          students: [], 
          error: this.handleError(linksError, 'Parent links query') 
        }
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
        return { 
          students: [], 
          error: this.handleError(profilesError, 'Student profiles query') 
        }
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

      console.log('Student IDs:', studentIds)
      console.log('Academic profiles found:', academicProfiles)
      
      const academicMap = new Map((academicProfiles || []).map(p => [p.user_id, p]))
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]))

      console.log('Academic map:', academicMap)
      console.log('Profile map:', profileMap)

      const students: Student[] = studentIds
        .map(studentId => {
          const profile = profileMap.get(studentId)
          const academic = academicMap.get(studentId)
          
          console.log(`Processing student ${studentId}:`, { profile, academic })
          
          if (!profile) return null
          
          const student = {
            user_id: profile.user_id,
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            email: profile.email || '',
            graduation_year: academic?.graduation_year ? Number(academic.graduation_year) : undefined,
            gpa: academic?.gpa ? Number(academic.gpa) : undefined,
            sat_score: academic?.sat_score ? Number(academic.sat_score) : undefined,
            act_score: academic?.act_score ? Number(academic.act_score) : undefined,
            target_countries: academic?.target_countries || undefined,
            intended_majors: academic?.intended_majors || undefined,
          } as Student
          
          console.log(`Created student object:`, student)
          return student
        })
        .filter((student): student is Student => student !== null)

      console.log('Final students array:', students)

      return { students }
    } catch (error) {
      return { 
        students: [], 
        error: this.handleError(error, 'getLinkedStudents') 
      }
    }
  }

  async getStudentApplications(studentId: string): Promise<{
    applications: ParentApplication[]
    error?: string
  }> {
    try {
      const user = await this.getCurrentUser()
      const supabase = supabaseBrowser()

      // Verify parent has access to this student
      const { data: link, error: linkError } = await supabase
        .from('parent_links')
        .select('student_user_id')
        .eq('parent_user_id', user.id)
        .eq('student_user_id', studentId)
        .maybeSingle()

      if (linkError || !link) {
        return { 
          applications: [], 
          error: 'Access denied to this student' 
        }
      }

      // Get applications with university data
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          *,
          universities (
            id, name, city, state, country, us_news_ranking, acceptance_rate
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

      if (applicationsError) {
        return { 
          applications: [], 
          error: this.handleError(applicationsError, 'Applications query') 
        }
      }

      // Get student profile
      const { data: studentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', studentId)
        .single()

      if (profileError) {
        console.error('Student profile query error:', profileError)
        // Continue without student profile
      }

      const applicationsWithStudent: ParentApplication[] = (applications || []).map(app => ({
        ...app,
        student: studentProfile ? {
          first_name: studentProfile.first_name,
          last_name: studentProfile.last_name
        } : undefined
      }))

      return { applications: applicationsWithStudent }
    } catch (error) {
      return { 
        applications: [], 
        error: this.handleError(error, 'getStudentApplications') 
      }
    }
  }

  async getStudentApplication(applicationId: string): Promise<{
    application?: ParentApplication
    error?: string
  }> {
    try {
      const user = await this.getCurrentUser()
      const supabase = supabaseBrowser()

      // Get the application with university data
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          universities (
            id, name, city, state, country, us_news_ranking, acceptance_rate
          )
        `)
        .eq('id', applicationId)
        .single()

      if (appError || !application) {
        return { error: 'Application not found' }
      }

      // Verify parent has access to this student
      const { data: link, error: linkError } = await supabase
        .from('parent_links')
        .select('student_user_id')
        .eq('parent_user_id', user.id)
        .eq('student_user_id', application.student_id)
        .maybeSingle()

      if (linkError || !link) {
        return { error: 'Access denied to this application' }
      }

      // Get student profile
      const { data: studentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', application.student_id)
        .single()

      if (profileError) {
        console.error('Student profile query error:', profileError)
        // Continue without student profile
      }

      const applicationWithStudent: ParentApplication = {
        ...application,
        student: studentProfile ? {
          first_name: studentProfile.first_name,
          last_name: studentProfile.last_name
        } : undefined
      }

      return { application: applicationWithStudent }
    } catch (error) {
      return { error: this.handleError(error, 'getStudentApplication') }
    }
  }

  async checkParentOnboarding(): Promise<{
    needsOnboarding: boolean
    error?: string
  }> {
    try {
      const user = await this.getCurrentUser()
      const supabase = supabaseBrowser()

      // Check if parent has any linked students
      const { data: links, error: linksError } = await supabase
        .from('parent_links')
        .select('student_user_id')
        .eq('parent_user_id', user.id)
        .limit(1)

      if (linksError) {
        return { 
          needsOnboarding: false, 
          error: this.handleError(linksError, 'Onboarding check') 
        }
      }

      return { needsOnboarding: !links || links.length === 0 }
    } catch (error) {
      return { 
        needsOnboarding: false, 
        error: this.handleError(error, 'checkParentOnboarding') 
      }
    }
  }
}

// Export a singleton instance
const parentService = new ParentService()

// Export the functions for backward compatibility
export const getLinkedStudents = () => parentService.getLinkedStudents()
export const getStudentApplications = (studentId: string) => parentService.getStudentApplications(studentId)
export const getStudentApplication = (applicationId: string) => parentService.getStudentApplication(applicationId)
export const checkParentOnboarding = () => parentService.checkParentOnboarding()

// Export the service class for advanced usage
export { ParentService }