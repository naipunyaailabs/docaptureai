"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionDetails } from "@/components/dashboard/subscription-details"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CreditCard, 
  Download, 
  FileQuestion, 
  Check,
  Zap,
  Crown,
  Rocket,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { apiService } from "@/lib/api"

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [billingHistory, setBillingHistory] = useState<any[]>([])

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Fetch current subscription
        const subscriptionResponse = await apiService.getUserSubscription()
        
        if (subscriptionResponse.success && subscriptionResponse.data) {
          setSubscriptionData(subscriptionResponse.data)
        } else {
          setError(subscriptionResponse.error || "Failed to load subscription data")
        }
        
        // For now, we'll use mock billing history
        // In a real implementation, this would come from an API
        setBillingHistory([
          { id: 'INV-2025-001', date: '2025-06-01', amount: 0, status: 'Paid', plan: 'Trial' },
          { id: 'INV-2025-002', date: '2025-05-01', amount: 0, status: 'Paid', plan: 'Trial' },
          { id: 'INV-2025-003', date: '2025-04-01', amount: 0, status: 'Paid', plan: 'Trial' }
        ])
      } catch (err) {
        setError("An error occurred while fetching subscription data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchSubscriptionData()
  }, [user])

  // Current plan data from API
  const currentPlan = subscriptionData ? {
    name: subscriptionData.planName,
    documentsUsed: subscriptionData.documentsUsed,
    documentsLimit: subscriptionData.documentsLimit,
    renewalDate: subscriptionData.currentPeriodEnd,
    amount: 0 // Would come from subscription data in a real implementation
  } : {
    name: 'Loading...',
    documentsUsed: 0,
    documentsLimit: 0,
    renewalDate: '',
    amount: 0
  }

  const plans = [
    {
      id: 'trial',
      name: 'Trial',
      icon: Zap,
      monthlyPrice: 0,
      yearlyPrice: 0,
      documents: 5,
      features: [
        '5 documents per month',
        'Basic field extraction',
        'Email support',
        'Standard processing speed'
      ],
      current: subscriptionData?.planId === 'trial'
    },
    {
      id: 'basic',
      name: 'Basic',
      icon: Check,
      monthlyPrice: 29,
      yearlyPrice: 290,
      documents: 100,
      features: [
        '100 documents per month',
        'All extraction services',
        'Priority email support',
        'Fast processing',
        'Batch processing',
        'Export to Excel'
      ],
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Crown,
      monthlyPrice: 99,
      yearlyPrice: 990,
      documents: 500,
      features: [
        '500 documents per month',
        'All extraction services',
        'Priority support (24/7)',
        'Fastest processing',
        'Advanced batch processing',
        'Multi-format export',
        'API access',
        'Custom templates'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Rocket,
      monthlyPrice: null,
      yearlyPrice: null,
      documents: -1,
      features: [
        'Unlimited documents',
        'All services + Custom',
        'Dedicated support',
        'SLA guarantee',
        'Custom integrations',
        'On-premise deployment',
        'Advanced analytics',
        'Team management'
      ]
    }
  ]

  const usagePercentage = subscriptionData ? 
    (subscriptionData.documentsUsed / subscriptionData.documentsLimit) * 100 : 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <header className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <CreditCard className="w-8 h-8 mr-3 text-brand-primary" />
          Subscription Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your plan, view usage, and billing history.
        </p>
      </header>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
        <>
          {/* Current Usage Alert */}
          {usagePercentage >= 80 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You've used {subscriptionData?.documentsUsed} of {subscriptionData?.documentsLimit} documents ({usagePercentage.toFixed(0)}%). 
                Consider upgrading to continue processing.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="current" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="current">Current Plan</TabsTrigger>
              <TabsTrigger value="plans">Upgrade</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            {/* Current Plan Tab */}
            <TabsContent value="current" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <SubscriptionDetails />
                  
                  {/* Usage Stats */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Usage Statistics</CardTitle>
                      <CardDescription>Your document processing usage this period</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Documents Processed</span>
                          <span className="text-sm text-muted-foreground">
                            {subscriptionData?.documentsUsed} / {subscriptionData?.documentsLimit}
                          </span>
                        </div>
                        <Progress value={usagePercentage} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Remaining</p>
                          <p className="text-2xl font-bold">{subscriptionData ? subscriptionData.documentsLimit - subscriptionData.documentsUsed : 0}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Renewal Date</p>
                          <p className="text-2xl font-bold">
                            {subscriptionData ? new Date(subscriptionData.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Quick Actions */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full" asChild>
                        <Link href="#plans">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Upgrade Plan
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/contact">
                          <FileQuestion className="w-4 h-4 mr-2" />
                          Contact Support
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">No payment method</p>
                          <p className="text-xs text-muted-foreground">Trial account</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        Add Payment Method
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Upgrade Plans Tab */}
            <TabsContent value="plans" className="space-y-6" id="plans">
              <div className="flex gap-2 mb-6">
                <Button
                  variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
                  onClick={() => setSelectedPlan('monthly')}
                >
                  Monthly
                </Button>
                <Button
                  variant={selectedPlan === 'yearly' ? 'default' : 'outline'}
                  onClick={() => setSelectedPlan('yearly')}
                >
                  Yearly
                  <Badge variant="secondary" className="ml-2">Save 17%</Badge>
                </Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan) => {
                  const Icon = plan.icon
                  const price = selectedPlan === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
                  
                  return (
                    <Card 
                      key={plan.id}
                      className={`relative ${
                        plan.popular ? 'border-brand-primary shadow-lg' : ''
                      } ${plan.current ? 'bg-muted/50' : ''}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-brand-primary">Most Popular</Badge>
                        </div>
                      )}
                      
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Icon className="h-6 w-6 text-brand-primary" />
                          {plan.current && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription>
                          <span className="text-3xl font-bold text-foreground">
                            {price === null ? 'Custom' : `$${price}`}
                          </span>
                          {price !== null && (
                            <span className="text-muted-foreground">
                              /{selectedPlan === 'monthly' ? 'mo' : 'yr'}
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          {plan.documents === -1 ? 'Unlimited' : plan.documents} documents/month
                        </div>
                        <ul className="space-y-2 text-sm">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className="w-full" 
                          variant={plan.current ? 'outline' : 'default'}
                          disabled={plan.current}
                        >
                          {plan.current ? 'Current Plan' : 
                           price === null ? 'Contact Sales' : 'Upgrade'}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
            
            {/* Billing History Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>View and download your invoices</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {billingHistory.map((invoice) => (
                      <div 
                        key={invoice.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded">
                            <DollarSign className="h-5 w-5 text-brand-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{invoice.id}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(invoice.date).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{invoice.plan}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                            <Badge variant="outline" className="mt-1">
                              {invoice.status}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}