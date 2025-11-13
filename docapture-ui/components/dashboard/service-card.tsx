"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { FileText, Table, FileSearch, FileBarChart, FileCheck, FileCode, Brain, Zap } from "lucide-react"
import type { ServiceInfo } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface ServiceCardProps {
  service: ServiceInfo
  usageCount: number
  status: "available" | "maintenance" | "beta"
  disabled?: boolean
}

export function ServiceCard({ service, usageCount, status, disabled = false }: ServiceCardProps) {
  const router = useRouter()
  const { user } = useAuth()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-500/30"
      case "maintenance":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-500/30"
      case "beta":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-purple-500/30"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-slate-500/30"
    }
  }

  const getIconComponent = (iconName: string | undefined) => {
    switch (iconName) {
      case "FileText":
        return <FileText className="h-6 w-6" />
      case "Table":
        return <Table className="h-6 w-6" />
      case "FileSearch":
        return <FileSearch className="h-6 w-6" />
      case "FileBarChart":
        return <FileBarChart className="h-6 w-6" />
      case "FileCheck":
        return <FileCheck className="h-6 w-6" />
      case "FileCode":
        return <FileCode className="h-6 w-6" />
      case "Brain":
        return <Brain className="h-6 w-6" />
      default:
        return <Zap className="h-6 w-6" /> // Default icon
    }
  }

  const handleServiceClick = () => {
    // If user is not logged in, redirect to login page
    if (!user) {
      router.push(`/auth/login?redirect=/dashboard/services/${service.id}`)
      return
    }
    
    // If service is explicitly disabled, don't navigate
    if (disabled) {
      return
    }
    
    // Navigate to the service page
    router.push(`/dashboard/services/${service.id}`)
  }

  return (
    <Card
      className={`flex flex-col h-full bg-card hover:shadow-lg hover:border-brand-primary/50 transition-all duration-200 ease-in-out ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={handleServiceClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 bg-muted rounded-md text-brand-accent dark:text-brand-accent">
            {getIconComponent(service.icon)}
          </div>
          <Badge className={`${getStatusColor(status)} px-2.5 py-0.5 text-xs font-medium`}>{status}</Badge>
        </div>
        <CardTitle className="text-lg leading-tight">{service.name}</CardTitle>
        <CardDescription className="text-sm line-clamp-2 h-[40px]">
          {service.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pt-0 pb-3">
        <div className="text-xs text-muted-foreground">
          Used {usageCount} {usageCount === 1 ? "time" : "times"} this month
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant={disabled ? "outline" : "default"}
          className={`w-full ${disabled ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-brand-primary hover:bg-brand-primary/90 text-primary-foreground"}`}
          onClick={(e) => {
            e.stopPropagation() // Prevent card click event
            handleServiceClick()
          }}
          disabled={disabled} // This is for form submission, onClick handles interaction
        >
          {!user ? "Log In to Use" : disabled ? "Upgrade Required" : "Use Service"}
        </Button>
      </CardFooter>
    </Card>
  )
}