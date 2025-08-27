"use client"

import DashboardLayout from '@/components/layouts/DashboardLayout'
import { UniversityCardList } from '@/components/universities'

export default function UniversitiesPage() {
  // Mock data for universities
  const universities = [
    {
      id: "1",
      name: "Stanford University",
      ranking: 3,
      location: "Stanford, CA",
      acceptanceRate: 4.3,
      applicationRequirements: [
        "SAT/ACT scores",
        "High school transcript",
        "Letters of recommendation",
        "Personal statement",
        "Extracurricular activities"
      ],
      logo: "/logos/stanford.png"
    },
    {
      id: "2",
      name: "MIT",
      ranking: 1,
      location: "Cambridge, MA",
      acceptanceRate: 6.7,
      applicationRequirements: [
        "SAT/ACT scores",
        "High school transcript",
        "Letters of recommendation",
        "Personal statement",
        "Research experience"
      ],
      logo: "/logos/mit.png"
    },
    {
      id: "3",
      name: "Harvard University",
      ranking: 2,
      location: "Cambridge, MA",
      acceptanceRate: 4.6,
      applicationRequirements: [
        "SAT/ACT scores",
        "High school transcript",
        "Letters of recommendation",
        "Personal statement",
        "Leadership experience"
      ],
      logo: "/logos/harvard.png"
    },
    {
      id: "4",
      name: "University of California, Berkeley",
      ranking: 13,
      location: "Berkeley, CA",
      acceptanceRate: 14.5,
      applicationRequirements: [
        "SAT/ACT scores",
        "High school transcript",
        "Letters of recommendation",
        "Personal statement",
        "Community service"
      ],
      logo: "/logos/berkeley.png"
    },
    {
      id: "5",
      name: "Yale University",
      ranking: 4,
      location: "New Haven, CT",
      acceptanceRate: 6.2,
      applicationRequirements: [
        "SAT/ACT scores",
        "High school transcript",
        "Letters of recommendation",
        "Personal statement",
        "Academic achievements"
      ],
      logo: "/logos/yale.png"
    },
    {
      id: "6",
      name: "Princeton University",
      ranking: 5,
      location: "Princeton, NJ",
      acceptanceRate: 5.8,
      applicationRequirements: [
        "SAT/ACT scores",
        "High school transcript",
        "Letters of recommendation",
        "Personal statement",
        "Research projects"
      ],
      logo: "/logos/princeton.png"
    }
  ]

  const handleViewDetails = (id: string) => {
    console.log('View details for university:', id)
  }

  const handleApply = (id: string) => {
    console.log('Apply to university:', id)
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Universities
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Explore top universities and their application requirements
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Universities
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {universities.length} universities
              </p>
            </div>
            <div className="flex gap-2">
              {/* 这里可以添加筛选和搜索按钮 */}
            </div>
          </div>
        </div>

        {/* University Cards */}
        <UniversityCardList
          universities={universities}
          onViewDetails={handleViewDetails}
          onApply={handleApply}
        />
      </div>
    </DashboardLayout>
  )
}
