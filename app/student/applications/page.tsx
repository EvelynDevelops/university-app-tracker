"use client"

import DashboardLayout from '@/components/layouts/DashboardLayout'
import ContributorsOverviewTable from '@/components/dashboard/application-overview-table'

export default function StudentApplicationsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Applications</h1>
        <ContributorsOverviewTable />
      </div>
    </DashboardLayout>
  )
}

