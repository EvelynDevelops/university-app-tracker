import Link from 'next/link'
import SignupCard from '@/components/auth/SignupCard'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* left - register form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-blue-600"></div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                University Tracker
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create your account
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Join thousands of students and parents tracking university applications
            </p>
          </div>

          {/* Signup Card */}
          <SignupCard />
        </div>
      </div>

      {/* right - promotion content */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-600 to-emerald-700 items-center justify-center p-12">
        <div className="max-w-md text-white">
          {/* quote icon */}
          <div className="mb-8">
            <svg className="w-16 h-16 text-green-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
          </div>

          {/* quote text */}
          <blockquote className="text-2xl font-semibold mb-8 leading-relaxed">
            "As a parent, I love being able to stay involved in my child's college application process without being intrusive."
          </blockquote>

          {/* user info */}
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div>
              <div className="font-semibold">Michael Chen</div>
              <div className="text-green-200 text-sm">Parent</div>
            </div>
          </div>

          {/* stats data */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-green-200 text-sm">Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-green-200 text-sm">Universities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">95%</div>
              <div className="text-green-200 text-sm">Success Rate</div>
            </div>
          </div>

          {/* features */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span className="text-green-100">Free to get started</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span className="text-green-100">Secure and private</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span className="text-green-100">24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 