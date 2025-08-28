"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { LoadingIcon } from '@/public/icons'
import { supabaseBrowser } from '@/lib/auth/helpers'

export default function LoginCard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const code = searchParams.get('code')
    const redirect = searchParams.get('redirect') || '/student/dashboard'
    if (!code) return

    ;(async () => {
      try {
        setLoading(true)
        const supabase = supabaseBrowser()
        const { error } = await supabase.auth.exchangeCodeForSession(code) // 这里传字符串
        if (error) {
          alert(error.message)
          return
        }
        router.replace(redirect) // 登录成功后跳转
      } finally {
        setLoading(false)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    if (loading) return
    setLoading(true)
    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { alert(error.message); return }
      router.push('/student/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm p-6">
      <div className="space-y-4" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); handleSubmit(); } }}>
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Remember me</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          className="w-full"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Don't have an account?{' '}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}