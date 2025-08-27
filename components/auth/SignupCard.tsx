"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { LoadingIcon } from "@/public/icons";

type UserRole = "student" | "parent";

export default function SignupCard() {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    // basic client-side checks
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    setFormError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, email, password, role: userRole }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || "Signup failed");
        }

        // wipe secrets from memory
        setPassword(""); 
        setConfirmPassword("");

        router.push("/dashboard");
      } catch (err: any) {
        setFormError(err.message ?? "Something went wrong");
      }
    });
  };

  const disabled =
    isPending ||
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    password !== confirmPassword;

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg backdrop-blur-sm p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            name="firstName"
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            required
            autoComplete="given-name"
          />
          <Input
            name="lastName"
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            required
            autoComplete="family-name"
          />
        </div>

        <Input
          name="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          aria-invalid={!!formError && formError.toLowerCase().includes("email")}
        />

        {/* Role */}
        <fieldset className="mt-2">
          <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            I am registering as:
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["student","parent"] as const).map(role => (
              <label key={role} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="userRole"
                  value={role}
                  checked={userRole === role}
                  onChange={() => setUserRole(role)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {role === "student" ? "Student" : "Parent"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {role === "student" ? "Track applications" : "Monitor progress"}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        <PasswordInput
          name="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          minLength={8}
          required
          autoComplete="new-password"
        />

        <PasswordInput
          name="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
          autoComplete="new-password"
        />

        {formError && (
          <p className="text-sm text-red-600" role="alert" aria-live="polite">
            {formError}
          </p>
        )}

        <Button
          type="submit"
          disabled={disabled}
          className="w-full aria-busy:opacity-60"
          aria-busy={isPending}
        >
          {isPending ? (
            <span className="flex items-center justify-center">
              <LoadingIcon className="w-4 h-4 mr-2" role="status" aria-label="Loading" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
