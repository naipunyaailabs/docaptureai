"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LayoutDashboard, Grid3x3, Plug, Settings, History, BarChart3, CreditCard } from "lucide-react"
import { config } from "@/lib/config"

interface DashboardNavProps {
  isCollapsed: boolean
}

export function DashboardNav({ isCollapsed }: DashboardNavProps) {
  const pathname = usePathname()
  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/services", label: "Services", icon: Grid3x3 },
    { href: "/dashboard/history", label: "History", icon: History },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, isNew: true },
    { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard, isNew: true },
    { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
    { href: "/dashboard/profile", label: "Settings", icon: Settings },
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
        {navItems.map(({ href, label, icon: Icon, isNew }) => {
          const isActive =
            (pathname.startsWith(href) &&
              href !== "/dashboard" &&
              href.split("/").length === pathname.split("/").length) ||
            pathname === href

          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    isCollapsed && "justify-center w-9 h-9",
                    `text-[${config.colors.secondary}] hover:bg-brand-primary hover:text-white`,
                    isActive && `bg-[${config.colors.accent}] text-[${config.colors.primary}]`,
                  )}
                  aria-label={label}
                >
                  <Icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
                  {!isCollapsed && (
                    <>
                      {label}
                      {isNew && <span className="ml-auto text-xs tracking-widest text-[${config.colors.secondary}]">NEW</span>}
                    </>
                  )}
                  {isCollapsed && <span className="sr-only">{label}</span>}
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="flex items-center gap-4">
                  {label}
                  {isNew && <span className="ml-auto text-xs tracking-widest text-[${config.colors.secondary}]">NEW</span>}
                </TooltipContent>
              )}
            </Tooltip>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}
