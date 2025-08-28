// Types
export interface Application {
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

export interface CreateApplicationRequest {
  university_id: string
  application_type?: string
  deadline?: string
  notes?: string
}

export interface ApplicationAPIResponse {
  data: Application[]
  total: number
}

export interface CreateApplicationResponse {
  data: Application
  message: string
}

/**
 * Get all applications for the current student
 */
export async function getApplications(): Promise<{
  applications: Application[]
  error?: string
}> {
  try {
    const response = await fetch('/api/v1/applications')
    
    if (!response.ok) {
      if (response.status === 401) {
        return {
          applications: [],
          error: 'Please log in to view your applications'
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApplicationAPIResponse = await response.json()
    
    return {
      applications: result.data
    }
  } catch (error: any) {
    return {
      applications: [],
      error: error?.message ?? 'Failed to load applications'
    }
  }
}

/**
 * Add a university to the student's application list
 */
export async function addToApplicationList(request: CreateApplicationRequest): Promise<{
  application?: Application
  message?: string
  error?: string
}> {
  try {
    const response = await fetch('/api/v1/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        return {
          error: 'Please log in to add universities to your list'
        }
      }
      
      const errorData = await response.json()
      return {
        error: errorData.error || `HTTP error! status: ${response.status}`
      }
    }
    
    const result: CreateApplicationResponse = await response.json()
    
    return {
      application: result.data,
      message: result.message
    }
  } catch (error: any) {
    return {
      error: error?.message ?? 'Failed to add university to application list'
    }
  }
}

/**
 * Check if a university is already in the student's application list
 */
export async function isUniversityInApplicationList(universityId: string): Promise<{
  isInList: boolean
  error?: string
}> {
  try {
    const { applications, error } = await getApplications()
    
    if (error) {
      return {
        isInList: false,
        error
      }
    }
    
    const isInList = applications.some(app => app.university_id === universityId)
    
    return {
      isInList
    }
  } catch (error: any) {
    return {
      isInList: false,
      error: error?.message ?? 'Failed to check application list'
    }
  }
} 