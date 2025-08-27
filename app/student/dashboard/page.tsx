"use client"

import DashboardLayout from '@/components/layouts/DashboardLayout'

export default function StudentDashboard() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Student Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to your student dashboard. Here you can track your applications and manage your university journey.
        </p>
        
        {/* 这里可以添加仪表板内容 */}
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
      </div>
    </DashboardLayout>
  )
}
