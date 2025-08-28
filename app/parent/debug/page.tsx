"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getLinkedStudents } from '@/lib/services/parentService'
import { supabaseBrowser } from '@/lib/supabase/helpers'

export default function ParentDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runDebug()
  }, [])

  const runDebug = async () => {
    try {
      setLoading(true)
      const supabase = supabaseBrowser()
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setDebugInfo({ error: 'Not authenticated' })
        return
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Get parent links
      const { data: links, error: linksError } = await supabase
        .from('parent_links')
        .select('*')
        .eq('parent_user_id', user.id)

      // Test the service function
      const serviceResult = await getLinkedStudents()

      setDebugInfo({
        user: {
          id: user.id,
          email: user.email
        },
        profile: {
          data: profile,
          error: profileError?.message
        },
        parent_links: {
          data: links,
          error: linksError?.message
        },
        service_result: serviceResult
      })
    } catch (error) {
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Running debug...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Parent Portal Debug</h1>
        
        {debugInfo?.error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <h2 className="text-red-800 dark:text-red-200 font-semibold">Error</h2>
            <p className="text-red-700 dark:text-red-300">{debugInfo.error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <h2 className="font-semibold mb-2">User Info</h2>
              <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo?.user, null, 2)}</pre>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <h2 className="font-semibold mb-2">Profile</h2>
              <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo?.profile, null, 2)}</pre>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <h2 className="font-semibold mb-2">Parent Links</h2>
              <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo?.parent_links, null, 2)}</pre>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <h2 className="font-semibold mb-2">Service Result</h2>
              <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo?.service_result, null, 2)}</pre>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={runDebug}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh Debug Info
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
} 