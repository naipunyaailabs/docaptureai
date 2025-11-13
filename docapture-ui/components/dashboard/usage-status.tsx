"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Crown, AlertTriangle, CheckCircle, ArrowRight, ShieldCheck, Star, FileText } from "lucide-react"
import { apiService, type UsageStatusData } from "@/lib/api"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface UsageStatusProps {
  onStatusChange?: (canProcess: boolean) => void
}

export function UsageStatus({ onStatusChange }: UsageStatusProps) {
  const [statusData, setStatusData] = useState<UsageStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isLoading: authLoading } = useAuth()

  // Fetch usage status with error handling and loading states
  const fetchUsageStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiService.checkUsageStatus()
      if (response.success && response.data) {
        setStatusData(response.data)
        onStatusChange?.(response.data.canProcess)
      } else {
        setError(response.error || "Failed to load usage status.")
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching usage status.")
    } finally {
      setIsLoading(false)
    }
  }, [onStatusChange])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setIsLoading(false)
      setError("Please log in to see your usage status.")
      return
    }
    fetchUsageStatus()
  }, [user, authLoading, fetchUsageStatus])

  // Loading state
  if (isLoading || authLoading) {
    return (
      <Card>
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

  // Error state
  if (error && !statusData) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Status Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {!user && (
            <Button asChild className="w-full mt-4">
              <Link href="/auth/login">Log In</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // No data state
  if (!statusData) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Usage status is currently unavailable.
        </CardContent>
      </Card>
    )
  }

  const { planName, documentsUsed, documentsLimit, canProcess, message, planId } = statusData
  const isUnlimited = documentsLimit === -1
  const progressPercentage = isUnlimited ? 100 : (documentsUsed / documentsLimit) * 100

  // Determine plan icon and styling
  const planIcons = {
    trial: Crown,
    basic: Star,
    pro: ShieldCheck,
    enterprise: ShieldCheck
  } as const
  const PlanIcon = planIcons[planId as keyof typeof planIcons] || Crown

  const cardBorderColor = !canProcess && !isUnlimited 
    ? "border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20" 
    : ""

  return (
    <Card className={cardBorderColor}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <PlanIcon
            className={`h-5 w-5 mr-2 ${!canProcess && !isUnlimited ? "text-orange-500" : "text-brand-primary"}`}
          />
          {planName} Plan Status
        </CardTitle>
        <CardDescription>
          {isUnlimited
            ? "Unlimited document processing"
            : canProcess
              ? `${documentsLimit - documentsUsed} documents remaining`
              : "Document limit reached"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Progress Section */}
        <section aria-labelledby="usage-progress">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Document Usage</span>
              </div>
              <div className={`px-2 py-1 text-xs rounded-full ${
                !canProcess && !isUnlimited && progressPercentage >= 100
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}>
                {documentsUsed} / {isUnlimited ? "Unlimited" : documentsLimit}
              </div>
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
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {!canProcess && !isUnlimited && progressPercentage >= 100
                ? "Document limit reached"
                : isUnlimited
                  ? "Unlimited document processing"
                  : `${documentsLimit - documentsUsed} documents remaining`}
            </p>
          </div>
        </section>

        {/* Status Message Section */}
        {message && (
          <section aria-labelledby="status-message">
            <Alert
              role="status"
              className={`${
                canProcess
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                  : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
              }`}
            >
              {canProcess ? (
                <CheckCircle 
                  className="h-4 w-4 text-green-600 dark:text-green-400" 
                  aria-hidden="true"
                />
              ) : (
                <AlertTriangle 
                  className="h-4 w-4 text-orange-600 dark:text-orange-400" 
                  aria-hidden="true"
                />
              )}
              <AlertDescription
                id="status-message"
                className={`${
                  canProcess ? "text-green-700 dark:text-green-300" : "text-orange-700 dark:text-orange-300"
                }`}
              >
                {message}
              </AlertDescription>
            </Alert>
          </section>
        )}

        {/* Action Section */}
        {((planId === "trial" && !canProcess) ||
          (planId !== "enterprise" && !canProcess) ||
          (planId !== "enterprise" && !isUnlimited && progressPercentage >= 80)) && (
          <section aria-labelledby="action-section">
            <div className="pt-2">
              <Button 
                asChild 
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-black"
                aria-label={planId === "trial" || !canProcess ? "Upgrade Plan" : "Contact Sales"}
              >
                <Link href={planId === "trial" || !canProcess ? "/pricing" : "/contact"}>
                  {planId === "trial" || !canProcess ? "Upgrade Plan" : "Contact Sales"}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  )
}
