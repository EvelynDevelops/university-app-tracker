import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      user_id: string
      role: "student" | "parent"
      first_name?: string
      last_name?: string
      email?: string
    }
    if (!body?.user_id || !body?.role) {
      return NextResponse.json({ error: "user_id and role are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: body.user_id,
          role: body.role,
          first_name: body.first_name ?? null,
          last_name: body.last_name ?? null,
          email: body.email ?? null,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unexpected error" }, { status: 500 })
  }
} 