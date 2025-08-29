import { APIError } from './middleware'

// 基础验证规则
export const validationRules = {
  required: (value: any, fieldName: string) => {
    if (value === undefined || value === null || value === '') {
      throw new APIError(400, `${fieldName} is required`)
    }
  },
  
  uuid: (value: string, fieldName: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(value)) {
      throw new APIError(400, `Invalid ${fieldName} format`)
    }
  },
  
  string: (value: any, fieldName: string, maxLength?: number) => {
    if (typeof value !== 'string') {
      throw new APIError(400, `${fieldName} must be a string`)
    }
    if (maxLength && value.length > maxLength) {
      throw new APIError(400, `${fieldName} must be less than ${maxLength} characters`)
    }
  },
  
  number: (value: any, fieldName: string, min?: number, max?: number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) {
      throw new APIError(400, `${fieldName} must be a valid number`)
    }
    if (min !== undefined && num < min) {
      throw new APIError(400, `${fieldName} must be at least ${min}`)
    }
    if (max !== undefined && num > max) {
      throw new APIError(400, `${fieldName} must be at most ${max}`)
    }
  },
  
  date: (value: string, fieldName: string) => {
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      throw new APIError(400, `${fieldName} must be a valid date`)
    }
  },
  
  enum: (value: any, fieldName: string, allowedValues: any[]) => {
    if (!allowedValues.includes(value)) {
      throw new APIError(400, `${fieldName} must be one of: ${allowedValues.join(', ')}`)
    }
  }
}

// 验证请求体
export function validateBody<T extends Record<string, any>>(
  body: any,
  schema: Record<keyof T, ValidationRule>
): T {
  const validated: T = {} as T
  
  for (const [key, rule] of Object.entries(schema)) {
    const value = body[key]
    
    if (rule.required) {
      validationRules.required(value, key)
    } else if (value === undefined || value === null) {
      continue // 跳过可选字段
    }
    
    // 应用验证规则
    if (rule.type === 'string') {
      validationRules.string(value, key, rule.maxLength)
      validated[key as keyof T] = value
    } else if (rule.type === 'number') {
      validationRules.number(value, key, rule.min, rule.max)
      validated[key as keyof T] = typeof value === 'string' ? parseFloat(value) : value
    } else if (rule.type === 'uuid') {
      validationRules.uuid(value, key)
      validated[key as keyof T] = value
    } else if (rule.type === 'date') {
      validationRules.date(value, key)
      validated[key as keyof T] = value
    } else if (rule.type === 'enum') {
      validationRules.enum(value, key, rule.allowedValues!)
      validated[key as keyof T] = value
    }
  }
  
  return validated
}

// 验证查询参数
export function validateQueryParams<T extends Record<string, any>>(
  searchParams: URLSearchParams,
  schema: Record<keyof T, ValidationRule>
): T {
  const validated: T = {} as T
  
  for (const [key, rule] of Object.entries(schema)) {
    const value = searchParams.get(key)
    
    if (rule.required && !value) {
      throw new APIError(400, `Query parameter ${key} is required`)
    }
    
    if (!value) continue
    
    // 应用验证规则
    if (rule.type === 'string') {
      validationRules.string(value, key, rule.maxLength)
      validated[key as keyof T] = value
    } else if (rule.type === 'number') {
      validationRules.number(value, key, rule.min, rule.max)
      validated[key as keyof T] = parseFloat(value)
    } else if (rule.type === 'boolean') {
      validated[key as keyof T] = value === 'true'
    }
  }
  
  return validated
}

// 验证规则接口
export interface ValidationRule {
  required?: boolean
  type: 'string' | 'number' | 'uuid' | 'date' | 'enum' | 'boolean'
  maxLength?: number
  min?: number
  max?: number
  allowedValues?: any[]
}

// 预定义的验证模式
export const validationSchemas = {
  createApplication: {
    university_id: { required: true, type: 'uuid' as const },
    application_type: { required: false, type: 'string' as const, maxLength: 100 },
    deadline: { required: false, type: 'date' as const },
    notes: { required: false, type: 'string' as const, maxLength: 1000 }
  },
  
  updateApplication: {
    status: { required: false, type: 'enum' as const, allowedValues: ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'WAITLISTED'] },
    submitted_date: { required: false, type: 'date' as const },
    decision_date: { required: false, type: 'date' as const },
    decision_type: { required: false, type: 'string' as const, maxLength: 50 },
    notes: { required: false, type: 'string' as const, maxLength: 1000 },
    application_type: { required: false, type: 'string' as const, maxLength: 100 },
    deadline: { required: false, type: 'date' as const }
  },
  
  universitySearch: {
    q: { required: false, type: 'string' as const, maxLength: 200 },
    country: { required: false, type: 'string' as const, maxLength: 100 },
    ranking_min: { required: false, type: 'number' as const, min: 1 },
    ranking_max: { required: false, type: 'number' as const, min: 1 },
    acceptance_rate_min: { required: false, type: 'number' as const, min: 0, max: 100 },
    acceptance_rate_max: { required: false, type: 'number' as const, min: 0, max: 100 },
    tuition_min: { required: false, type: 'number' as const, min: 0 },
    tuition_max: { required: false, type: 'number' as const, min: 0 },
    limit: { required: false, type: 'number' as const, min: 1, max: 100 },
    offset: { required: false, type: 'number' as const, min: 0 },
    sort_by: { required: false, type: 'enum' as const, allowedValues: ['name', 'ranking', 'acceptance_rate', 'tuition_fees'] },
    sort_order: { required: false, type: 'enum' as const, allowedValues: ['asc', 'desc'] }
  },
  
  createProfile: {
    user_id: { required: true, type: 'uuid' as const },
    role: { required: true, type: 'enum' as const, allowedValues: ['student', 'parent'] },
    first_name: { required: false, type: 'string' as const, maxLength: 100 },
    last_name: { required: false, type: 'string' as const, maxLength: 100 },
    email: { required: false, type: 'string' as const, maxLength: 255 }
  }
} 