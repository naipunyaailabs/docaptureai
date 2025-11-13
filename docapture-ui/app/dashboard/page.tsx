"use client"

import { Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { UsageStatus } from "@/components/dashboard/usage-status"
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview"
import { SubscriptionDetails } from "@/components/dashboard/subscription-details"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Grid3x3, History, Settings2, CreditCard } from "lucide-react" // Updated Settings icon

export default function DashboardOverviewPage() {
  const { user, isLoading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-4 md:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center px-4 md:px-8">
        <AlertCircle className="w-16 h-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-8">Please log in to access the dashboard.</p>
        <Button asChild>
          <Link href="/auth/login">Log In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <header className="mb-2 md:mb-4">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1 md:text-lg">
          Welcome back, {user?.name}! Here's a summary of your activity and subscription.
        </p>
      </header>

      <UsageStatus onStatusChange={() => {}} />

      <AnalyticsOverview />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Quick Actions</CardTitle>
          <CardDescription>Navigate to key areas of your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" asChild className="justify-start text-left p-6 hover:bg-muted/50 transition-colors">
            <Link href="/dashboard/services" className="flex items-center">
              <Grid3x3 className="mr-3 h-5 w-5 text-brand-primary" />
              <div>
                <span className="font-semibold">Browse Services</span>
                <p className="text-xs text-muted-foreground">Explore all available tools</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="justify-start text-left p-6 hover:bg-muted/50 transition-colors">
            <Link href="/dashboard/history" className="flex items-center">
              <History className="mr-3 h-5 w-5 text-brand-primary" />
              <div>
                <span className="font-semibold">Processing History</span>
                <p className="text-xs text-muted-foreground">Review past activities</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="justify-start text-left p-6 hover:bg-muted/50 transition-colors">
            <Link href="/pricing" className="flex items-center">
              <CreditCard className="mr-3 h-5 w-5 text-brand-primary" />
              <div>
                <span className="font-semibold">Pricing Plans</span>
                <p className="text-xs text-muted-foreground">View or change your plan</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" asChild className="justify-start text-left p-6 hover:bg-muted/50 transition-colors">
            <Link href="/dashboard/profile" className="flex items-center">
              <Settings2 className="mr-3 h-5 w-5 text-brand-primary" />
              <div>
                <span className="font-semibold">Account Settings</span>
                <p className="text-xs text-muted-foreground">Manage your profile</p>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
