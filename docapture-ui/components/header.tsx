"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { config } from "@/lib/config"
import { useTheme } from "@/contexts/theme-context"
import { useEffect, useState } from "react"

export function Header() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentLogo, setCurrentLogo] = useState("/docapture-logo.png")

  // Effect to mark component as mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Effect to update logo based on theme and mounted state
  useEffect(() => {
    if (mounted) {
      const effectiveTheme = resolvedTheme || theme;
      if (effectiveTheme === "dark") {
        setCurrentLogo("/docapture-dark-logo.png")
      } else {
        setCurrentLogo("/docapture-logo.png")
      }
    }
  }, [mounted, theme, resolvedTheme])

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About us" },
    { href: "/contact", label: "Contact us" },
    { href: "/services", label: "Services" },
  ]

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              {mounted ? (
                <Image
                  src={currentLogo || "/placeholder.svg"}
                  alt="docapture.AI Logo"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />
              ) : (
                <div style={{ width: 120, height: 32 }} />
              )}
              <span className="text-xs text-muted-foreground hidden sm:block border-l border-border pl-3">
                by {config.company.name}
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-brand-primary ${
                  pathname === item.href ? "text-brand-primary" : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button asChild className="bg-brand-primary hover:bg-brand-primary/90 text-black">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-foreground hover:text-foreground/80">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild className="bg-brand-primary hover:bg-brand-primary/90 text-black">
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}