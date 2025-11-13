"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, FileText, Clock } from "lucide-react"
import { apiService } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface AnalyticsData {
  totalProcessed: number
  successRate: number
  avgProcessingTime: number
  serviceBreakdown: Array<{
    serviceId: string
    serviceName: string
    count: number
  }>
}

export function AnalyticsOverview() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, isLoading: authLoading } = useAuth()

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiService.getAnalytics(30) // Last 30 days
      if (response.success && response.data) {
        setAnalyticsData(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (user) {
      fetchAnalytics()
    } else {
      setIsLoading(false)
    }
  }, [user, authLoading, fetchAnalytics])

  // Loading state
  if (isLoading || authLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-muted rounded w-1/3"></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data state
  if (!analyticsData || !user) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>Start processing documents to see your analytics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No data available yet. Process your first document to get started!
          </div>
        </CardContent>
      </Card>
    )
  }

  const { totalProcessed, avgProcessingTime, serviceBreakdown } = analyticsData
  const mostUsedService = serviceBreakdown && serviceBreakdown.length > 0 
    ? serviceBreakdown[0].serviceName 
    : "N/A"

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
        <CardDescription>Your document processing activity over the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProcessed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgProcessingTime ? `${(avgProcessingTime / 1000).toFixed(1)}s` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Per document</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Used Service</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                {mostUsedService}
              </div>
              <p className="text-xs text-muted-foreground">Top performer</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
