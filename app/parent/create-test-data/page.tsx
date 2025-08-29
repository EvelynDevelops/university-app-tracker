"use client"

import { useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/Button'

export default function CreateTestDataPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const createTestData = async () => {
    try {
      setLoading(true)
      setResult(null)
      
      const response = await fetch('/api/v1/parent/create-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create Test Data</h1>
        
        <div className="space-y-6">
          <Button 
            onClick={createTestData} 
            disabled={loading}
            className="px-6"
          >
            {loading ? 'Creating...' : 'Create Parent Link'}
          </Button>

          {result && (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
} 