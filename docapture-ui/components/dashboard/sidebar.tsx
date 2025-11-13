"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { config } from "@/lib/config"
import { DashboardNav } from "./dashboard-nav"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { CurrentLogo } from "../CurrentLogo"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

export function Sidebar({ className, isCollapsed, setIsCollapsed }: SidebarProps) {
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(true)

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  const toggleMobileSidebar = () => {
    setIsMobileCollapsed(!isMobileCollapsed)
  }

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true')
    }
  }, [setIsCollapsed])

  return (
    <>
      {/* Mobile/Medium Toggle Button - Visible on mobile and medium screens */}
      {/* <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 xl:hidden rounded-full border bg-background hover:bg-transparent transition-colors"
        style={{ 
          borderColor: config.colors.primary,
          color: config.colors.primary
        }}
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button> */}

      {/* Sidebar */}
      <div
        className={cn(
          "border-r transition-all duration-300  ease-in-out",
          // Mobile/Medium styles
          "fixed xl:relative",
          isMobileCollapsed ? "-translate-x-full xl:translate-x-0" : "translate-x-0",
          // Desktop styles
          isCollapsed ? "xl:w-20" : "xl:w-64",
          // Base styles
          "w-64 h-screen bg-background dark:bg-black z-40",
          className,
        )}
        
      >
        <div className="flex h-full flex-col gap-2">
          <div
            className={cn(
              "flex h-14 items-center border-b px-4 xl:h-[60px] xl:px-6 relative",
              isCollapsed && "justify-center",
            )}
            style={{ borderColor: config.colors.primary }}
          >
            <Link
              href="/dashboard"
              className={cn("flex items-center gap-2 font-semibold", isCollapsed && "justify-center")}
              style={{ color: config.colors.primary }}
            >
              <div className="flex items-center gap-2">
                <CurrentLogo isCollapsed={isCollapsed} />
              </div>
            </Link>
            {/* Desktop Toggle Button - Only visible on xl screens */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex absolute -right-12 top-1/2 -translate-y-1/2 rounded-full border bg-background hover:bg-transparent transition-colors"
              style={{ 
                borderColor: config.colors.primary,
                color: config.colors.primary
              }}
              onClick={toggleSidebar}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <DashboardNav isCollapsed={isCollapsed} />
          </div>
          {/* Desktop Bottom Toggle - Only visible on xl screens */}
          <div className="  md:block mt-auto border-t p-2" style={{ borderColor: config.colors.primary }}>
            <Button
              variant="ghost"
              size="icon"
              className="w-full justify-center "
              style={{ color: config.colors.primary }}
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
