"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import Pipeline, { PipelineStage, PipelineCard } from '@/components/dashboard/Pipeline'
import { supabaseBrowser } from '@/lib/supabase/helpers'
import AcademicProfileModal from '@/components/modals/AcademicProfileModal'
import { getApplications, Application, updateApplication } from '@/lib/services/applicationService'

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
    { id: 'under_review', name: 'Under Review' },
    { id: 'decision', name: 'Decision' },
  ]

  // Convert applications to pipeline cards
  const cards: PipelineCard[] = applications.map(app => ({
    id: app.id,
    title: app.university?.name || 'Unknown University',
    subtitle: app.deadline ? new Date(app.deadline).toLocaleDateString() : (app.application_type ? app.application_type.replace('_',' ') : 'Type N/A'),
    stageId: (() => {
      const s = app.status
      if (s === 'NOT_STARTED') return 'not_started'
      if (s === 'IN_PROGRESS') return 'in_progress'
      if (s === 'SUBMITTED') return 'submitted'
      if (s === 'UNDER_REVIEW') return 'under_review'
      return 'decision'
    })()
  }))

  // KPI metrics
  const total = applications.length
  const submitted = applications.filter(a => a.status === 'SUBMITTED').length
  const inProgress = applications.filter(a => a.status === 'IN_PROGRESS').length
  const underReview = applications.filter(a => a.status === 'UNDER_REVIEW').length
  const accepted = applications.filter(a => a.status === 'ACCEPTED').length
  const dueIn7 = applications.filter(a => a.deadline && (new Date(a.deadline as any).getTime() - new Date().setHours(0,0,0,0)) / (1000*60*60*24) <= 7 && (new Date(a.deadline as any).getTime() - new Date().setHours(0,0,0,0)) / (1000*60*60*24) >= 0).length

  // Handle pipeline drag-and-drop updates
  const stageToStatus = (stageId: string): Application['status'] => {
    if (stageId === 'not_started') return 'NOT_STARTED'
    if (stageId === 'in_progress') return 'IN_PROGRESS'
    if (stageId === 'submitted') return 'SUBMITTED'
    if (stageId === 'under_review') return 'UNDER_REVIEW'
    return 'ACCEPTED' // default into decision column; can be refined via detail page
  }

  const handlePipelineChange = async (nextCards: PipelineCard[]) => {
    // Build current status map
    const idToStatus: Record<string, Application['status']> = {}
    for (const a of applications) idToStatus[a.id] = a.status

    // For each card, if stage changed -> update backend and local state
    const updates: Array<Promise<any>> = []
    const localUpdates: Array<{ id: string; status: Application['status'] }> = []
    for (const card of nextCards) {
      const nextStatus = stageToStatus(card.stageId)
      if (idToStatus[card.id] !== nextStatus) {
        localUpdates.push({ id: card.id, status: nextStatus })
        updates.push(updateApplication(card.id, { status: nextStatus }))
      }
    }
    // Optimistic local update
    if (localUpdates.length) {
      setApplications(prev => prev.map(a => {
        const u = localUpdates.find(x => x.id === a.id)
        return u ? { ...a, status: u.status } : a
      }))
    }
    // Fire-and-forget; errors can be handled/logged if needed
    await Promise.allSettled(updates)
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {`Hello, ${firstName || 'Student'}`}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Your application progress and key stats at a glance.</p>

        {/* KPI Cards */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-2xl font-bold">{total}</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="text-xs text-gray-500">In Progress</div>
            <div className="text-2xl font-bold text-yellow-600">{inProgress}</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="text-xs text-gray-500">Submitted</div>
            <div className="text-2xl font-bold text-blue-600">{submitted}</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="text-xs text-gray-500">Under Review</div>
            <div className="text-2xl font-bold text-purple-600">{underReview}</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="text-xs text-gray-500">Accepted</div>
            <div className="text-2xl font-bold text-green-600">{accepted}</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="text-xs text-gray-500">Due in 7 days</div>
            <div className="text-2xl font-bold text-amber-600">{dueIn7}</div>
          </div>
        </div>
        
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
            <Pipeline stages={stages} cards={cards} onChange={handlePipelineChange} />
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
