export async function postParentNote(applicationId: string, note: string): Promise<{ error?: string }>{
  try {
    const res = await fetch('/api/v1/parent/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: applicationId, note })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { error: err.error || `HTTP ${res.status}` }
    }
    return {}
  } catch (e: any) {
    return { error: e?.message ?? 'Failed to post note' }
  }
}