import { supabaseBrowser } from '@/lib/supabase/helpers'

export interface LinkedParent {
  user_id: string
  first_name: string
  last_name: string
  email: string
  link_id: string
}

export interface ParentSearchResult {
  user_id: string
  first_name: string
  last_name: string
  email: string
  is_linked: boolean
}

// Service class for better organization and error handling
class StudentService {
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
      return 'No parent found with this email address'
    }
    
    if (error?.code === '23505') {
      return 'This parent is already linked to your account'
    }
    
    if (error?.code === '23503') {
      return 'Invalid parent account'
    }
    
    return error?.message || 'An unexpected error occurred'
  }

  async getLinkedParents(): Promise<{
    parents: LinkedParent[]
    error?: string
  }> {
    try {
      const user = await this.getCurrentUser()
      const supabase = supabaseBrowser()

      // Get parent links and profiles in separate queries for better type safety
      const { data: links, error: linksError } = await supabase
        .from('parent_links')
        .select('parent_user_id')
        .eq('student_user_id', user.id)

      if (linksError) {
        return { 
          parents: [], 
          error: this.handleError(linksError, 'Parent links query') 
        }
      }

      if (!links || links.length === 0) {
        return { parents: [] }
      }

      // Get parent profiles
      const parentIds = links.map(l => l.parent_user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', parentIds)

      if (profilesError) {
        return { 
          parents: [], 
          error: this.handleError(profilesError, 'Parent profiles query') 
        }
      }

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]))
      const parents: LinkedParent[] = (links || [])
        .map(link => {
          const profile = profileMap.get(link.parent_user_id)
          if (!profile) return null
          return {
            user_id: profile.user_id,
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            email: profile.email || '',
            link_id: link.parent_user_id
          }
        })
        .filter((parent): parent is LinkedParent => parent !== null)

      return { parents }
    } catch (error) {
      return { 
        parents: [], 
        error: this.handleError(error, 'getLinkedParents') 
      }
    }
  }

  async searchParentByEmail(email: string): Promise<{
    parent?: ParentSearchResult
    error?: string
  }> {
    try {
      const user = await this.getCurrentUser()
      const supabase = supabaseBrowser()

      // Search for parent profile by email with role check
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, role')
        .eq('email', email.toLowerCase().trim())
        .eq('role', 'parent')
        .single()

      if (profileError) {
        return { error: this.handleError(profileError, 'Profile search') }
      }

      // Check if already linked using a more efficient query
      const { data: existingLink } = await supabase
        .from('parent_links')
        .select('parent_user_id')
        .eq('parent_user_id', profile.user_id)
        .eq('student_user_id', user.id)
        .maybeSingle() // Use maybeSingle instead of single to avoid errors

      const parent: ParentSearchResult = {
        user_id: profile.user_id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        is_linked: !!existingLink
      }

      return { parent }
    } catch (error) {
      return { error: this.handleError(error, 'searchParentByEmail') }
    }
  }

  async linkParent(parentId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const user = await this.getCurrentUser()
      const supabase = supabaseBrowser()

      // First verify the parent exists and is actually a parent
      const { data: parentProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('user_id, role')
        .eq('user_id', parentId)
        .eq('role', 'parent')
        .single()

      if (verifyError || !parentProfile) {
        return { 
          success: false, 
          error: 'Invalid parent account' 
        }
      }

      // Check if already linked
      const { data: existingLink } = await supabase
        .from('parent_links')
        .select('parent_user_id')
        .eq('parent_user_id', parentId)
        .eq('student_user_id', user.id)
        .maybeSingle()

      if (existingLink) {
        return { 
          success: false, 
          error: 'This parent is already linked to your account' 
        }
      }

      // Create parent link
      const { error: linkError } = await supabase
        .from('parent_links')
        .insert({
          parent_user_id: parentId,
          student_user_id: user.id
        })

      if (linkError) {
        return { 
          success: false, 
          error: this.handleError(linkError, 'Link parent') 
        }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: this.handleError(error, 'linkParent') 
      }
    }
  }

  async unlinkParent(parentId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const user = await this.getCurrentUser()
      const supabase = supabaseBrowser()

      // Delete the parent link
      const { error } = await supabase
        .from('parent_links')
        .delete()
        .eq('parent_user_id', parentId)
        .eq('student_user_id', user.id)

      if (error) {
        return { 
          success: false, 
          error: this.handleError(error, 'Unlink parent') 
        }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: this.handleError(error, 'unlinkParent') 
      }
    }
  }
}

// Export a singleton instance
const studentService = new StudentService()

// Export the functions for backward compatibility
export const getLinkedParents = () => studentService.getLinkedParents()
export const searchParentByEmail = (email: string) => studentService.searchParentByEmail(email)
export const linkParent = (parentId: string) => studentService.linkParent(parentId)
export const unlinkParent = (parentId: string) => studentService.unlinkParent(parentId)

// Export the service class for advanced usage
export { StudentService }
