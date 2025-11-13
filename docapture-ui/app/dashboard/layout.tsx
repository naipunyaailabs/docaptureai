"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { useAuth } from "@/contexts/auth-context"
import { UnverifiedNotice } from "@/components/auth/unverified-notice"
import { DashboardHeader } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Load initial state from localStorage
  useEffect(() => {
    setIsMounted(true)
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Save state to localStorage whenever it changes
  const handleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
    if (isMounted) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed))
    }
  }

  if (isLoading) {
    return <DashboardLoading />
  }

  if (user && !user.emailVerified) {
    return <UnverifiedNotice />
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      
        <main className="px-6 fixed inset-0 overflow-y-auto">
            <DashboardHeader />
          <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        
            {children}
          </div>
        </main>
      </div>
   
  )
}

function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}
