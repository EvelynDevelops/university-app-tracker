"use client"

import { useParams } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import ApplicationDetail from '@/components/applications/ApplicationDetail'

export default function ApplicationDetailPage() {
  const params = useParams()
  return (
    <DashboardLayout>
      <ApplicationDetail applicationId={params.id as string} />
    </DashboardLayout>
  )
}
