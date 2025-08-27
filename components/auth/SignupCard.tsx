"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { supabaseBrowser } from "@/lib/supabase/helpers";

type UserRole = "student" | "parent";

export default function SignupCard() {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [role,      setRole]      = useState<UserRole>("student");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const router = useRouter();

  const disabled = loading || !firstName || !lastName || !email || !password || password !== confirm;

  const handleSignup = async () => {
    if (disabled) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, role },
          emailRedirectTo: `${window.location.origin}/auth/login`,
        },
      });
      if (error) throw error;

      const userId = data.user?.id;
      if (userId) {
        await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, first_name: firstName, last_name: lastName, role, email }),
        });
      }

      alert("Account created. Please verify your email (if enabled).");
      router.push("/auth/login");
    } catch (e: any) {
      setError(e?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="First Name" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
        <Input label="Last Name"  value={lastName}  onChange={(e)=>setLastName(e.target.value)} />
      </div>
      <Input label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(["student","parent"] as const).map(r => (
          <label key={r} className="flex items-center p-3 border rounded-lg cursor-pointer">
            <input type="radio" name="role" checked={role===r} onChange={()=>setRole(r)} className="mr-2" />
            {r === "student" ? "Student" : "Parent"}
          </label>
        ))}
      </div>
      <PasswordInput label="Password" value={password} onChange={(e)=>setPassword(e.target.value)} minLength={8}/>
      <PasswordInput label="Confirm Password" value={confirm} onChange={(e)=>setConfirm(e.target.value)}/>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="button" onClick={handleSignup} disabled={disabled} className="w-full">
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </div>
  );
}