"use client"

import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-full flex-1 items-center justify-center p-4 md:p-8">
      <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
    </div>
  )
}
  