import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export interface AuthenticatedRequest extends NextRequest {
  user: any
  profile: any
}

export interface APIResponse<T = any> {
  data?: T
  error?: string
  message?: string
  total?: number
  pagination?: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
}

// 统一错误处理
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
  }
}

export function handleAPIError(error: unknown): NextResponse {
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
  )
  }
  
  console.error('Unexpected error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

// 认证中间件
export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
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

      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = user
      authenticatedReq.profile = profile

      return await handler(authenticatedReq)
    } catch (error) {
      return handleAPIError(error)
    }
  }
}

// 带参数的认证中间件
export async function withAuthWithParams<T extends Record<string, any>>(
  handler: (req: AuthenticatedRequest, params: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: { params: T }): Promise<NextResponse> => {
    try {
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

      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = user
      authenticatedReq.profile = profile

      return await handler(authenticatedReq, context.params)
    } catch (error) {
      return handleAPIError(error)
    }
  }
}

// 角色验证中间件
export function withRole(requiredRole: 'student' | 'parent') {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (req.profile.role !== requiredRole) {
        throw new APIError(403, `Access denied. ${requiredRole} role required.`)
      }
      return await handler(req)
    })
  }
}

// 带参数的角色验证中间件
export function withRoleWithParams(requiredRole: 'student' | 'parent') {
  return <T extends Record<string, any>>(
    handler: (req: AuthenticatedRequest, params: T) => Promise<NextResponse>
  ) => {
    return withAuthWithParams<T>(async (req: AuthenticatedRequest, params: T) => {
      if (req.profile.role !== requiredRole) {
        throw new APIError(403, `Access denied. ${requiredRole} role required.`)
      }
      return await handler(req, params)
    })
  }
}

// 统一响应格式化
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: APIResponse<T> = { data }
  if (message) response.message = message
  
  return NextResponse.json(response, { status })
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number,
  message?: string
): NextResponse {
  const response: APIResponse<T[]> = {
    data,
    total,
    pagination: {
      total,
      limit,
      offset,
      has_more: total > offset + limit
    }
  }
  if (message) response.message = message
  
  return NextResponse.json(response)
}

// UUID 验证工具
export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// 查询参数解析工具
export function parseQueryParams<T extends Record<string, any>>(
  searchParams: URLSearchParams,
  schema: T
): T {
  const params = {} as T
  
  for (const [key, config] of Object.entries(schema)) {
    const value = searchParams.get(key)
    if (value !== null) {
      if (config.type === 'number') {
        params[key as keyof T] = parseInt(value) as T[keyof T]
      } else if (config.type === 'float') {
        params[key as keyof T] = parseFloat(value) as T[keyof T]
      } else if (config.type === 'boolean') {
        params[key as keyof T] = (value === 'true') as T[keyof T]
      } else {
        params[key as keyof T] = value as T[keyof T]
      }
    } else if (config.default !== undefined) {
      params[key as keyof T] = config.default
    }
  }
  
  return params
} 