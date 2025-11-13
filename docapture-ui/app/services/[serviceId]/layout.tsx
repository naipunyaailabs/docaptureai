import type React from "react"

export default function ServiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}