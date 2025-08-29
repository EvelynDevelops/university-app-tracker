"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { supabaseBrowser } from '@/lib/supabase/helpers'

export default function DebugProfilePage() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadDebugData = async () => {
    try {
      setLoading(true)
      const supabase = supabaseBrowser()
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setDebugData({ error: 'Not authenticated' })
        return
      }

      const debugInfo: any = {
        user_id: user.id,
        auth: { success: true }
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      debugInfo.profile = { 
        success: !profileError, 
        data: profile, 
        error: profileError?.message 
      }

      // Get parent links
      const { data: links, error: linksError } = await supabase
        .from('parent_links')
        .select('*')
        .eq('parent_user_id', user.id)
      
      debugInfo.parent_links = { 
        success: !linksError, 
        data: links, 
        error: linksError?.message,
        count: links?.length || 0
      }

      // Get student profiles if links exist
      if (links && links.length > 0) {
        const studentIds = links.map(l => l.student_user_id)
        const { data: studentProfiles, error: studentError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', studentIds)

        debugInfo.student_profiles = { 
          success: !studentError, 
          data: studentProfiles, 
          error: studentError?.message,
          count: studentProfiles?.length || 0
        }

        // Get academic profiles
        const { data: academicProfiles, error: academicError } = await supabase
          .from('student_profile')
          .select('*')
          .in('user_id', studentIds)

        debugInfo.academic_profiles = { 
          success: !academicError, 
          data: academicProfiles, 
          error: academicError?.message,
          count: academicProfiles?.length || 0
        }
      }

      setDebugData(debugInfo)
    } catch (e) {
      setDebugData({ error: e instanceof Error ? e.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDebugData()
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Debug Profile Data</h1>
        
        {loading ? (
          <div className="text-gray-600 dark:text-gray-400">Loading debug data...</div>
        ) : (
          <div className="space-y-6">
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 