import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { DocumentIcon, CalendarIcon, ChartIcon } from '@/public/icons'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600"></div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              University Tracker
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Track Your University Applications
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Manage your university applications, deadlines, and progress all in one place. 
            Perfect for students and parents to stay organized throughout the application process.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup">
              <Button size="lg">
                Get Started
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-blue-900">
              <DocumentIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Application Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Keep track of all your university applications in one organized dashboard.
            </p>
          </div>

          <div className="text-center p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-green-900">
              <CalendarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Deadline Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Never miss important deadlines with our smart reminder system.
            </p>
          </div>

          <div className="text-center p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-purple-900">
              <ChartIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Progress Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Visualize your application progress with detailed analytics and insights.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
            <div className="text-gray-600 dark:text-gray-300">Students</div>
          </div>
          <div className="text-center p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">50+</div>
            <div className="text-gray-600 dark:text-gray-300">Universities</div>
          </div>
          <div className="text-center p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">95%</div>
            <div className="text-gray-600 dark:text-gray-300">Success Rate</div>
          </div>
          <div className="text-center p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
            <div className="text-gray-600 dark:text-gray-300">Support</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-24 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 University Application Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
