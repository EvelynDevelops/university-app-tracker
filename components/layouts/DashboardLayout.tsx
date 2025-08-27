"use client"

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
} from "@/components/shared/sidebar"
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
    <SidebarProvider defaultOpen={false}>
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
                      <span>Applications</span>
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
                      <span>Profile</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              S
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Student User</span>
              <span className="truncate text-xs">student@example.com</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {/* Simple header with just the sidebar trigger */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Student Portal</h1>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
