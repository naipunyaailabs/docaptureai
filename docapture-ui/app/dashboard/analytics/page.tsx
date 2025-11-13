"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Activity,
  Download,
  Calendar,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiService } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [processingHistory, setProcessingHistory] = useState<any[]>([])

  // Convert time range to days
  const getDaysFromTimeRange = (range: typeof timeRange) => {
    switch (range) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      case 'all': return 365
      default: return 30
    }
  }

  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Fetch analytics data
        const days = getDaysFromTimeRange(timeRange)
        const analyticsResponse = await apiService.getAnalytics(days)
        
        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalyticsData(analyticsResponse.data)
        } else {
          setError(analyticsResponse.error || "Failed to load analytics data")
        }
        
        // Fetch processing history for activity log
        const historyResponse = await apiService.getProcessingResults(10, 0)
        
        if (historyResponse.success && historyResponse.data) {
          setProcessingHistory(historyResponse.data)
        }
      } catch (err) {
        setError("An error occurred while fetching data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user, timeRange])

  // Stats derived from analytics data
  const stats = analyticsData ? {
    totalProcessed: analyticsData.totalProcessed,
    successRate: analyticsData.successRate,
    avgProcessingTime: analyticsData.avgProcessingTime,
    documentsThisMonth: analyticsData.documentsThisMonth
  } : {
    totalProcessed: 0,
    successRate: 0,
    avgProcessingTime: 0,
    documentsThisMonth: 0
  }

  // Service stats derived from analytics data
  const serviceStats = analyticsData?.serviceBreakdown?.map((service: any) => ({
    name: service.serviceName,
    processed: service.count,
    success: Math.round(service.count * (service.successRate / 100)),
    avgTime: `${(Math.random() * 5).toFixed(1)}s` // Placeholder for actual avg time
  })) || []

  // Recent activity from processing history
  const recentActivity = processingHistory.map((record: any) => ({
    action: `Processed ${record.fileName}`,
    service: record.serviceName,
    time: new Date(record.processedAt).toLocaleString(),
    status: record.status
  }))

  // Monthly trend data (simplified for now)
  const monthlyTrend = [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 62 },
    { month: 'Mar', count: 78 },
    { month: 'Apr', count: 87 },
    { month: 'May', count: 95 },
    { month: 'Jun', count: 87 }
  ]

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <header className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BarChart3 className="w-8 h-8 mr-3 text-brand-primary" />
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Monitor your document processing performance and trends.</p>
      </header>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Time Range Selector */}
          <div className="flex gap-2">
            <Button 
              variant={timeRange === '7d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              Last 7 days
            </Button>
            <Button 
              variant={timeRange === '30d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              Last 30 days
            </Button>
            <Button 
              variant={timeRange === '90d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('90d')}
            >
              Last 90 days
            </Button>
            <Button 
              variant={timeRange === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('all')}
            >
              All time
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProcessed}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
                <Progress value={stats.successRate} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgProcessingTime.toFixed(1)}s</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">-0.3s</span> faster
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.documentsThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  {timeRange === '30d' ? 'June 2025' : 'Current period'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">By Service</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <AnalyticsOverview />
              
              {/* Monthly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Processing Trend</CardTitle>
                  <CardDescription>Documents processed per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyTrend.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-12 text-sm font-medium">{item.month}</div>
                        <div className="flex-1">
                          <Progress value={(item.count / 100) * 100} className="h-2" />
                        </div>
                        <div className="w-12 text-right text-sm font-medium">{item.count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service Performance</CardTitle>
                  <CardDescription>Breakdown by service type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceStats.map((service, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{service.name}</div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">Avg: {service.avgTime}</span>
                            <Badge variant="outline">
                              {service.success}/{service.processed}
                            </Badge>
                          </div>
                        </div>
                        <Progress 
                          value={(service.success / service.processed) * 100} 
                          className="h-2" 
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Success Rate: {((service.success / service.processed) * 100).toFixed(1)}%</span>
                          <span>Total: {service.processed} documents</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest document processing activities</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Log
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                        {activity.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Activity className="h-3 w-3" />
                            <span>{activity.service}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{activity.time}</span>
                          </div>
                        </div>
                        <Badge variant={activity.status === 'completed' ? 'default' : 'destructive'}>
                          {activity.status}
                        </Badge>
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