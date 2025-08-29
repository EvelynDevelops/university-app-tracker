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

export async function getLinkedParents(): Promise<{
  parents?: LinkedParent[]
  error?: string
}> {
  try {
    const supabase = supabaseBrowser()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get parent links where this student is the student_user_id
    const { data: links, error: linksError } = await supabase
      .from('parent_links')
      .select('parent_user_id')
      .eq('student_user_id', user.id)

    if (linksError) {
      console.error('Parent links query error:', linksError)
      return { error: 'Failed to fetch linked parents' }
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
      console.error('Parent profiles query error:', profilesError)
      return { error: 'Failed to fetch parent profiles' }
    }

    const formattedParents: LinkedParent[] = (profiles || []).map(profile => ({
      user_id: profile.user_id,
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
      link_id: profile.user_id
    }))

    return { parents: formattedParents }
  } catch (error) {
    console.error('getLinkedParents error:', error)
    return { error: 'Internal server error' }
  }
}

export async function searchParentByEmail(email: string): Promise<{
  parent?: ParentSearchResult
  error?: string
}> {
  try {
    const supabase = supabaseBrowser()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Search for parent profile by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, email, role')
      .eq('email', email)
      .eq('role', 'parent')
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return { error: 'No parent found with this email address' }
      }
      console.error('Profile search error:', profileError)
      return { error: 'Failed to search for parent' }
    }

    // Check if already linked
    const { data: existingLink } = await supabase
      .from('parent_links')
      .select('parent_user_id')
      .eq('parent_user_id', profile.user_id)
      .eq('student_user_id', user.id)
      .single()

    const parent: ParentSearchResult = {
      user_id: profile.user_id,
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
      is_linked: !!existingLink
    }

    return { parent }
  } catch (error) {
    console.error('searchParentByEmail error:', error)
    return { error: 'Internal server error' }
  }
}

export async function linkParent(parentId: string): Promise<{
  success?: boolean
  error?: string
}> {
  try {
    const supabase = supabaseBrowser()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Create parent link
    const { error } = await supabase
      .from('parent_links')
      .insert({
        parent_user_id: parentId,
        student_user_id: user.id
      })

    if (error) {
      console.error('Link parent error:', error)
      return { error: 'Failed to link parent' }
    }

    return { success: true }
  } catch (error) {
    console.error('linkParent error:', error)
    return { error: 'Internal server error' }
  }
}

export async function unlinkParent(parentId: string): Promise<{
  success?: boolean
  error?: string
}> {
  try {
    const supabase = supabaseBrowser()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Delete the parent link
    const { error } = await supabase
      .from('parent_links')
      .delete()
      .eq('parent_user_id', parentId)
      .eq('student_user_id', user.id)

    if (error) {
      console.error('Unlink parent error:', error)
      return { error: 'Failed to unlink parent' }
    }

    return { success: true }
  } catch (error) {
    console.error('unlinkParent error:', error)
    return { error: 'Internal server error' }
  }
}
