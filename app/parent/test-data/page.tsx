"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { supabaseBrowser } from '@/lib/supabase/helpers'

export default function TestDataPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const supabase = supabaseBrowser()
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setData({ error: 'Not authenticated' })
        return
      }

      const testData: any = {
        user_id: user.id,
        auth: { success: true }
      }

      // Test 1: Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      testData.profile = { 
        success: !profileError, 
        data: profile, 
        error: profileError?.message 
      }

      // Test 2: Get all parent_links
      const { data: allLinks, error: allLinksError } = await supabase
        .from('parent_links')
        .select('*')
      
      testData.all_parent_links = { 
        success: !allLinksError, 
        data: allLinks, 
        error: allLinksError?.message,
        count: allLinks?.length || 0
      }

      // Test 3: Get parent_links for current user
      const { data: userLinks, error: userLinksError } = await supabase
        .from('parent_links')
        .select('*')
        .eq('parent_user_id', user.id)
      
      testData.user_parent_links = { 
        success: !userLinksError, 
        data: userLinks, 
        error: userLinksError?.message,
        count: userLinks?.length || 0
      }

      // Test 4: Get all profiles
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('*')
      
      testData.all_profiles = { 
        success: !allProfilesError, 
        data: allProfiles, 
        error: allProfilesError?.message,
        count: allProfiles?.length || 0
      }

      setData(testData)
    } catch (e) {
      setData({ error: e instanceof Error ? e.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Test Data</h1>
        
        {loading ? (
          <div className="text-gray-600 dark:text-gray-400">Loading test data...</div>
        ) : (
          <div className="space-y-6">
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 