"use client"

import Image from "next/image"
import { useTheme } from "@/contexts/theme-context"
import { useEffect, useState } from "react"

interface CurrentLogoProps {
  isCollapsed?: boolean
}

export function CurrentLogo({ isCollapsed = false }: CurrentLogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentLogo, setCurrentLogo] = useState("/docapture-logo.png")
  const [currentMiniLogo, setCurrentMiniLogo] = useState("/docapture-mini-logo.png")

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
        setCurrentMiniLogo("/docapture-dark-logo-mini.png")
      } else {
        setCurrentLogo("/docapture-logo.png")
        setCurrentMiniLogo("/docapture-logo-mini.png")
      }
    }
  }, [mounted, theme, resolvedTheme])

  return (
    <div className="flex items-center space-x-3">
      {mounted ? (
        <Image
          src={isCollapsed ? currentMiniLogo : currentLogo}
          alt="docapture.AI Logo"
          width={isCollapsed ? 32 : 120}
          height={isCollapsed ? 32 : 32}
          className={isCollapsed ? "h-8 w-8" : "h-8 w-auto"}
          priority
        />
      ) : (
        <div style={{ width: isCollapsed ? 32 : 120, height: 32 }} />
      )}
    </div>
  )
}
