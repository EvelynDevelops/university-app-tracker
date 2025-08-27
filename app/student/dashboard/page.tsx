"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import Pipeline, { PipelineStage, PipelineCard } from '@/components/dashboard/Pipeline'
import { supabaseBrowser } from '@/lib/supabase/helpers'
import AcademicProfileModal from '@/components/modals/AcademicProfileModal'

export default function StudentDashboard() {
  const [firstName, setFirstName] = useState<string>('')
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false)

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

  const stages: PipelineStage[] = [
    { id: 'to-do', name: 'To Do' },
    { id: 'preparing', name: 'Preparing' },
    { id: 'submitted', name: 'Submitted' },
    { id: 'decision', name: 'Decision' },
  ]

  const cards: PipelineCard[] = [
    { id: '1', title: 'MIT', subtitle: 'Early Action', stageId: 'to-do' },
    { id: '2', title: 'Stanford', subtitle: 'Regular', stageId: 'preparing' },
    { id: '3', title: 'UCLA', subtitle: 'Submitted 10/10', stageId: 'submitted' },
    { id: '4', title: 'CMU', subtitle: 'Awaiting decision', stageId: 'decision' },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {`Hello, ${firstName || 'Student'}`}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to your student dashboard. Here you can track your applications and manage your university journey.
        </p>
        
        {/* Metric cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Applications</h3>
            <p className="text-3xl font-bold text-blue-600">5</p>
          </div>
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Submitted</h3>
            <p className="text-3xl font-bold text-green-600">3</p>
          </div>
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">2</p>
          </div>
          <div className="bg-card rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Accepted</h3>
            <p className="text-3xl font-bold text-purple-600">1</p>
          </div>
        </div>

        {/* Pipeline */}
        <div className="mt-10">
          <Pipeline stages={stages} cards={cards} />
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
