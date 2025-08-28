export interface UniversityRequirement {
  id: string
  university_id: string
  requirement_type: string
  requirement_name: string
  description?: string
  is_required: boolean
  order_index: number
  application_requirement_progress?: Array<{
    id: string
    application_id: string
    requirement_id: string
    status: string
    completed_at?: string
    notes?: string
  }>
}

export async function fetchRequirements(universityId: string, applicationId?: string): Promise<{
  requirements: UniversityRequirement[]
  error?: string
}> {
  try {
    const url = applicationId
      ? `/api/v1/universities/${universityId}/requirements?application_id=${applicationId}`
      : `/api/v1/universities/${universityId}/requirements`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return { requirements: data.data || [] }
  } catch (e: any) {
    return { requirements: [], error: e?.message ?? 'Failed to load requirements' }
  }
}