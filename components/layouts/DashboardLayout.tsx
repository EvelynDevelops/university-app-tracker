"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/helpers'
import NotificationsBell from '@/components/layouts/NotificationsBell'
import ParentNotificationsBell from '@/components/layouts/ParentNotificationsBell'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<{
    first_name: string | null
    email: string | null
    role: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) => pathname === href

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const supabase = supabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, email, role')
            .eq('user_id', user.id)
            .single()
          
          setUserProfile(profile)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const isParent = userProfile?.role === 'parent'
  const isStudent = userProfile?.role === 'student'

  const renderStudentMenu = () => (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/student/dashboard')}>
          <a href="/student/dashboard">
            <span>Student Dashboard</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/student/applications')}>
          <a href="/student/applications">
            <span>My Applications</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/universities')}>
          <a href="/universities">
            <span>Universities</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/student/profile')}>
          <a href="/student/profile">
            <span>Academic Profile</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/student/notifications')}>
          <a href="/student/notifications">
            <span>Notifications</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  )

  const renderParentMenu = () => (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/parent/dashboard')}>
          <a href="/parent/dashboard">
            <span>Parent Dashboard</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/parent/manage-students')}>
          <a href="/parent/manage-students">
            <span>My Students</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/parent/manage-students')}>
          <a href="/parent/manage-students">
            <span>Manage Students</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
                 <SidebarMenuItem>
             <SidebarMenuButton asChild isActive={isActive('/parent/universities')}>
               <a href="/parent/universities">
                 <span>Universities</span>
               </a>
             </SidebarMenuButton>
           </SidebarMenuItem>
    </>
  )

  const getPortalTitle = () => {
    if (isParent) return 'Parent Portal'
    if (isStudent) return 'Student Portal'
    return 'Portal'
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="floating" collapsible="offcanvas" className="z-[60]">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg">
              U
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-lg">UniTracker</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {isStudent && renderStudentMenu()}
                {isParent && renderParentMenu()}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/settings')}>
                    <a href="/settings">
                      <span>Settings</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="relative">
            <button
              className="flex w-full items-center gap-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => setMenuOpen(v => !v)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                {userProfile?.first_name ? userProfile.first_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {loading ? 'Loading...' : (userProfile?.first_name || 'User')}
                </span>
                <span className="truncate text-xs">
                  {loading ? '...' : (userProfile?.email || 'user@example.com')}
                </span>
              </div>
              <div className="ml-auto text-xs text-gray-500">▾</div>
            </button>
            {menuOpen && (
              <div className="absolute bottom-12 left-2 z-50 w-48 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md">
                <button
                  className="w-full text-left text-sm px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => { setMenuOpen(false); router.push('/auth/login') }}
                >
                  Switch account
                </button>
                <button
                  className="w-full text-left text-sm px-3 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={async () => {
                    setMenuOpen(false)
                    try {
                      const supabase = supabaseBrowser()
                      await supabase.auth.signOut()
                    } catch {}
                    router.push('/')
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {/* Header with notifications bell */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{getPortalTitle()}</h1>
          </div>
          {isStudent && <NotificationsBell />}
          {isParent && <ParentNotificationsBell />}
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
