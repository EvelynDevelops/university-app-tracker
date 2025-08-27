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
import { Button } from '@/components/ui/Button'
import { UsersIcon } from '@/public/icons'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              U
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">UniTracker</span>
              <span className="truncate text-xs">Student Portal</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/student/dashboard')}>
                    <a href="/student/dashboard">
                      <span>Dashboard</span>
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
        {/* Fixed Topbar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Left side - Sidebar trigger and Logo */}
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg">
                  U
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    UniTracker
                  </h1>
                </div>
              </div>
            </div>

            {/* Right side - User Avatar */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
                  Student User
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0"
                >
                  <UsersIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content with topbar offset */}
        <div className="pt-16">
          <div className="flex flex-1 flex-col">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
