import { supabaseServer } from '@/lib/supabase/server'
import { APIError } from './middleware'

// 通用的数据库操作类
export class DatabaseService {
  private supabase = supabaseServer()

  // 检查用户是否有权限访问应用
  async checkApplicationAccess(userId: string, applicationId: string, userRole: string): Promise<boolean> {
    try {
      // 获取应用信息
      const { data: application, error: appError } = await this.supabase
        .from('applications')
        .select('student_id')
        .eq('id', applicationId)
        .single()

      if (appError || !application) {
        throw new APIError(404, 'Application not found')
      }

      // 学生只能访问自己的应用
      if (userRole === 'student') {
        return application.student_id === userId
      }

      // 家长需要检查是否链接到学生
      if (userRole === 'parent') {
        const { data: link, error: linkError } = await this.supabase
          .from('parent_links')
          .select('student_user_id')
          .eq('parent_user_id', userId)
          .eq('student_user_id', application.student_id)
          .maybeSingle()

        return !linkError && !!link
      }

      return false
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError(500, 'Failed to check application access')
    }
  }

  // 检查大学是否存在
  async checkUniversityExists(universityId: string): Promise<{ id: string; name: string }> {
    const { data: university, error } = await this.supabase
      .from('universities')
      .select('id, name')
      .eq('id', universityId)
      .single()

    if (error || !university) {
      throw new APIError(404, 'University not found')
    }

    return university
  }

  // 检查应用是否已存在
  async checkApplicationExists(studentId: string, universityId: string): Promise<boolean> {
    const { data: existingApplication, error } = await this.supabase
      .from('applications')
      .select('id')
      .eq('student_id', studentId)
      .eq('university_id', universityId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new APIError(500, 'Failed to check existing application')
    }

    return !!existingApplication
  }

  // 获取应用详情（包含大学信息）
  async getApplicationWithUniversity(applicationId: string) {
    const { data: application, error } = await this.supabase
      .from('applications')
      .select(`
        *,
        universities (
          id,
          name,
          city,
          state,
          country,
          us_news_ranking,
          acceptance_rate,
          application_system,
          tuition_in_state,
          tuition_out_state,
          application_fee,
          deadlines
        )
      `)
      .eq('id', applicationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new APIError(404, 'Application not found')
      }
      throw new APIError(500, 'Failed to fetch application')
    }

    return application
  }

  // 获取用户的所有应用
  async getUserApplications(userId: string) {
    const { data: applications, error } = await this.supabase
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
      .eq('student_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new APIError(500, 'Failed to fetch applications')
    }

    return applications || []
  }

  // 构建大学搜索查询
  buildUniversitySearchQuery(params: {
    q?: string
    country?: string
    ranking_min?: number
    ranking_max?: number
    acceptance_rate_min?: number
    acceptance_rate_max?: number
    tuition_min?: number
    tuition_max?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    limit?: number
    offset?: number
  }) {
    let query = this.supabase
      .from('universities')
      .select('*', { count: 'exact' })

    // Apply search filter for university name
    if (params.q) {
      query = query.ilike('name', `%${params.q}%`)
    }

    // Apply country filter
    if (params.country) {
      query = query.eq('country', params.country)
    }

    // Apply ranking range filter
    if (params.ranking_min !== undefined) {
      query = query.gte('us_news_ranking', params.ranking_min)
    }
    if (params.ranking_max !== undefined) {
      query = query.lte('us_news_ranking', params.ranking_max)
    }

    // Apply acceptance rate range filter
    if (params.acceptance_rate_min !== undefined) {
      query = query.gte('acceptance_rate', params.acceptance_rate_min)
    }
    if (params.acceptance_rate_max !== undefined) {
      query = query.lte('acceptance_rate', params.acceptance_rate_max)
    }

    // Apply tuition fees range filter
    if (params.tuition_min !== undefined) {
      query = query.gte('tuition_out_state', params.tuition_min)
    }
    if (params.tuition_max !== undefined) {
      query = query.lte('tuition_out_state', params.tuition_max)
    }

    // Apply sorting
    const sortFieldMap: { [key: string]: string } = {
      'name': 'name',
      'ranking': 'us_news_ranking',
      'acceptance_rate': 'acceptance_rate',
      'tuition_fees': 'tuition_out_state'
    }
    const sortField = sortFieldMap[params.sort_by || 'name'] || 'name'
    query = query.order(sortField, { ascending: params.sort_order === 'asc' })

    // Apply pagination
    if (params.limit && params.offset !== undefined) {
      query = query.range(params.offset, params.offset + params.limit - 1)
    }

    return query
  }
}

// 导出单例实例
export const dbService = new DatabaseService() 