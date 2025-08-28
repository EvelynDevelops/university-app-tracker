import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { MapPinIcon, FileTextIcon, ChevronDownIcon } from '@/public/icons'

interface UniversityDetailHeaderProps {
  university: {
    id: string
    name: string
    city: string
    state: string
    country: string
  }
  onApply: () => void
}

export default function UniversityDetailHeader({ university, onApply }: UniversityDetailHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="mb-6">
      <Button 
        variant="outline" 
        onClick={handleBack}
        className="mb-4"
      >
        <ChevronDownIcon className="w-4 h-4 mr-2 rotate-90" />
        Back to Universities
      </Button>
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {university.name}
          </h1>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-2">
            <MapPinIcon className="w-4 h-4" />
            <span>{[university.city, university.state, university.country].filter(Boolean).join(', ')}</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={onApply}>
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  )
} 