"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CalendarDays, FileStack, Zap, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { apiService, type UsageStatusData } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export function SubscriptionDetails() {
  const [statusData, setStatusData] = useState<UsageStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isLoading: authLoading } = useAuth()

  const fetchUsageStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiService.checkUsageStatus()
      if (response.success && response.data) {
        setStatusData(response.data)
      } else {
        setError(response.error || "Failed to load subscription details.")
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching subscription details.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setIsLoading(false)
      setError("Please log in to see your subscription details.")
      return
    }
    fetchUsageStatus()
  }, [user, authLoading, fetchUsageStatus])

  if (isLoading || authLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-muted rounded w-1/3 mb-1"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="h-2 bg-muted rounded mt-3"></div>
            <div className="h-4 bg-muted rounded w-3/4 mt-1"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !statusData) {
    return (
      <Card className="h-full border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Subscription Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          {!user && (
            <Button asChild className="w-full mt-4">
              <Link href="/auth/login">Log In</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!statusData) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 text-center text-muted-foreground">
          Subscription details are currently unavailable.
        </CardContent>
      </Card>
    )
  }

  const { planName, documentsUsed, documentsLimit, planId, canProcess } = statusData
  const isUnlimited = documentsLimit === -1
  const usagePercentage = isUnlimited ? 100 : (documentsUsed / documentsLimit) * 100

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Subscription Details</CardTitle>
        <CardDescription>Manage your current plan and usage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-brand-primary" />
              {planName} Plan
            </h3>
            <Badge variant={canProcess ? "default" : "destructive"} className="mt-1">
              {canProcess ? "Active" : "Limit Reached"}
            </Badge>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/pricing">Change Plan</Link>
          </Button>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-muted-foreground">Monthly Document Usage</span>
            <span className="text-sm font-semibold">
              {documentsUsed} / {isUnlimited ? "Unlimited" : documentsLimit}
            </span>
          </div>
          <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div 
                  className="h-2 w-full rounded-full bg-muted"
                  aria-hidden="true"
                />
              </div>
              <div
                className="relative h-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          {!isUnlimited && usagePercentage > 85 && (
            <p className="text-xs text-orange-600 mt-1">You're approaching your monthly limit.</p>
          )}
        </div>

        <Button className="w-full bg-brand-primary hover:bg-brand-primary/90 text-black">
          <Zap className="w-4 h-4 mr-2" /> Upgrade to Enterprise
        </Button>
      </CardContent>
    </Card>
  )
}
