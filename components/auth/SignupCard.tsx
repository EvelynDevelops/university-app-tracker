"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { LoadingIcon } from "@/public/icons"
import { supabaseBrowser } from "@/lib/supabase/helpers"

type UserRole = "student" | "parent"

export default function SignupCard() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>("student")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const disabled =
    loading ||
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    password !== confirmPassword

  const handleSignup = async (e?: React.SyntheticEvent) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    if (disabled) return

    setLoading(true)
    setError(null)
    try {
      const supabase = supabaseBrowser()
      // register
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, role },
        },
      })
      if (error) throw error

      const userId = data.user?.id
      if (userId) {
        await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, first_name: firstName, last_name: lastName, role, email }),
        })
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      router.push("/student/dashboard")
    } catch (err: any) {
      setError(err?.message ?? "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm p-4 sm:p-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" required />
          <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required />
        </div>

        <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />

        <fieldset className="mt-2">
          <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am registering as:</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["student", "parent"] as const).map((r) => (
              <label
                key={r}
                className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <input
                  type="radio"
                  name="userRole"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {r === "student" ? "Student" : "Parent"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {r === "student" ? "Track applications" : "Monitor progress"}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" minLength={8} required />
        <PasswordInput label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required />

        {error && (
          <p className="text-sm text-red-600" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        <Button type="button" onClick={handleSignup} disabled={disabled} className="w-full">
          {loading ? (
            <span className="flex items-center justify-center">
              <LoadingIcon className="w-4 h-4 mr-2" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}