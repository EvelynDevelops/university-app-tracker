"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import Pipeline, { PipelineStage, PipelineCard } from '@/components/dashboard/Pipeline'
import { supabaseBrowser } from '@/lib/supabase/helpers'
import AcademicProfileModal from '@/components/modals/AcademicProfileModal'
import { getApplications, Application } from '@/lib/services/applicationService'

export default function StudentDashboard() {
  const [firstName, setFirstName] = useState<string>('')
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const supabase = supabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('user_id', user.id)
            .single()
          if (profile?.first_name) setFirstName(profile.first_name)

          // check student_profile exists; if not, open modal
          const { data: sp } = await supabase
            .from('student_profile')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle()
          if (!sp) setShowProfileModal(true)
        }
      } catch (e) {
        // no-op
      }
    })()
  }, [])

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      const result = await getApplications()
      
      if (!result.error) {
        setApplications(result.applications)
      }
    } catch (e) {
      // Handle error silently for dashboard
    } finally {
      setLoading(false)
    }
  }

  const stages: PipelineStage[] = [
    { id: 'not_started', name: 'Not Started' },
    { id: 'in_progress', name: 'In Progress' },
    { id: 'submitted', name: 'Submitted' },
    { id: 'decision', name: 'Decision' },
  ]

  // Convert applications to pipeline cards
  const cards: PipelineCard[] = applications.map(app => ({
    id: app.id,
    title: app.university?.name || 'Unknown University',
    subtitle: app.application_type ? app.application_type.replace('_', ' ') : 'Not set',
    stageId: app.status.toLowerCase().replace('_', ' ') === 'not started' ? 'not_started' : 
             app.status.toLowerCase().replace('_', ' ') === 'in progress' ? 'in_progress' :
             app.status.toLowerCase().replace('_', ' ') === 'submitted' ? 'submitted' : 'decision'
  }))

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {`Hello, ${firstName || 'Student'}`}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to your student dashboard. Here you can track your applications and manage your university journey.
        </p>
        
        {/* Pipeline */}
        <div className="mt-10">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading applications...</div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">No applications yet</div>
              <div className="text-sm text-muted-foreground">
                Start by adding universities to your application list
              </div>
            </div>
          ) : (
            <Pipeline stages={stages} cards={cards} />
          )}
        </div>
      </div>
      <AcademicProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSaved={() => setShowProfileModal(false)}
      />
    </DashboardLayout>
  )
}
