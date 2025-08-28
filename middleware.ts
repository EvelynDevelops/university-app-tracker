import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = [/^\/student/, /^\/parent/, /^\/universities/]
  const isProtected = protectedPaths.some((r) => r.test(req.nextUrl.pathname))

  if (isProtected && !user) {
    const url = new URL("/auth/login", req.url)
    url.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Role-based redirects for authenticated users
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = profile?.role

    // Redirect to appropriate dashboard based on role
    if (req.nextUrl.pathname === '/dashboard') {
      if (role === 'parent') {
        return NextResponse.redirect(new URL('/parent/dashboard', req.url))
      } else if (role === 'student') {
        return NextResponse.redirect(new URL('/student/dashboard', req.url))
      }
    }

    // Prevent access to wrong role's routes
    if (role === 'parent' && req.nextUrl.pathname.startsWith('/student/')) {
      return NextResponse.redirect(new URL('/parent/dashboard', req.url))
    }

    if (role === 'student' && req.nextUrl.pathname.startsWith('/parent/')) {
      return NextResponse.redirect(new URL('/student/dashboard', req.url))
    }

    // Check if parent needs onboarding
    if (role === 'parent' && req.nextUrl.pathname === '/parent/dashboard') {
      const supabase = createMiddlewareClient({ req, res })
      const { data: existingLinks } = await supabase
        .from('parent_links')
        .select('student_user_id')
        .eq('parent_user_id', user.id)
        .limit(1)

      if (!existingLinks || existingLinks.length === 0) {
        return NextResponse.redirect(new URL('/parent/onboarding', req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
} 