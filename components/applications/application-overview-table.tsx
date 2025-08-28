"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getApplications, Application } from '@/lib/services/applicationService'

function ContributorsOverviewTable() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      const result = await getApplications()
      
      if (result.error) {
        setError(result.error)
      } else {
        setApplications(result.applications)
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = (applicationId: string) => {
    router.push(`/student/applications/${applicationId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700'
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-700'
      case 'UNDER_REVIEW':
        return 'bg-purple-100 text-purple-700'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-700'
      case 'WAITLISTED':
        return 'bg-orange-100 text-orange-700'
      case 'REJECTED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto rounded-xl border border-border bg-background p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Applications Overview</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading applications...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto rounded-xl border border-border bg-background p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Applications Overview</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto rounded-xl border border-border bg-background p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Applications Overview</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-muted-foreground mb-2">No applications yet</div>
            <div className="text-sm text-muted-foreground">
              Start by adding universities to your application list
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none mx-auto rounded-xl border border-border bg-background p-4 sm:p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-foreground">Applications Overview</h2>
      <div className="-mx-4 sm:mx-0 overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <Table className="table-auto w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">University</TableHead>
                <TableHead className="min-w-[240px]">Location</TableHead>
                <TableHead className="min-w-[180px]">Deadline</TableHead>
                <TableHead className="min-w-[200px]">Status</TableHead>
                <TableHead className="text-right min-w-[200px]">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow 
                  key={app.id} 
                  className="hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(app.id)}
                >
                  <TableCell className="font-medium">
                    {app.university?.name || 'Unknown University'}
                  </TableCell>
                  <TableCell>{app.university?.location || 'N/A'}</TableCell>
                  <TableCell>{formatDate(app.deadline)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(app.status)}`}
                    >
                      {formatStatus(app.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {app.application_type ? formatStatus(app.application_type) : 'Not set'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default ContributorsOverviewTable;
