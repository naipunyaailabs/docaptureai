"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plug,
  CheckCircle2,
  Circle,
  ExternalLink,
  Copy,
  RefreshCw,
  Settings,
  Zap,
  Cloud,
  Mail,
  MessageSquare,
  Webhook,
  Key,
  Activity,
  Clock,
  AlertCircle,
  Loader2,
  Plus
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiService } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

type Integration = {
  id: string
  name: string
  description: string
  icon: any
  category: 'storage' | 'automation' | 'communication' | 'other'
  connected: boolean
  connectedAt?: string
  status?: 'active' | 'inactive' | 'error'
  features: string[]
}

type WebhookEndpoint = {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  createdAt: string
  lastTriggered?: string
}

type ActivityLog = {
  id: string
  integration: string
  action: string
  timestamp: string
  status: 'success' | 'failed'
  details?: string
}

export default function IntegrationsPage() {
  const { user } = useAuth()
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false)
  const [apiKey, setApiKey] = useState("sk_live_abc123...xyz789")
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const integrations: Integration[] = [
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automate workflows with 5000+ apps',
      icon: Zap,
      category: 'automation',
      connected: true,
      connectedAt: '2025-01-10',
      status: 'active',
      features: ['Automated workflows', 'Multi-step zaps', 'Real-time triggers']
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Save processed documents to Google Drive',
      icon: Cloud,
      category: 'storage',
      connected: true,
      connectedAt: '2025-01-08',
      status: 'active',
      features: ['Auto-save results', 'Folder organization', 'Shared drives']
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Sync documents with Dropbox',
      icon: Cloud,
      category: 'storage',
      connected: false,
      features: ['Cloud storage', 'File sharing', 'Team folders']
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      description: 'Microsoft OneDrive integration',
      icon: Cloud,
      category: 'storage',
      connected: false,
      features: ['Office 365 sync', 'SharePoint', 'Team collaboration']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications in Slack channels',
      icon: MessageSquare,
      category: 'communication',
      connected: false,
      features: ['Real-time alerts', 'Channel notifications', 'Direct messages']
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Send results via email',
      icon: Mail,
      category: 'communication',
      connected: false,
      features: ['Email delivery', 'Attachment support', 'Custom templates']
    },
  ]

  const webhooks: WebhookEndpoint[] = [
    {
      id: '1',
      name: 'Production Webhook',
      url: 'https://api.example.com/webhooks/processing',
      events: ['processing.completed', 'processing.failed'],
      status: 'active',
      createdAt: '2025-01-05',
      lastTriggered: '2025-01-14 10:30 AM'
    },
    {
      id: '2',
      name: 'Development Webhook',
      url: 'https://dev.example.com/webhooks/test',
      events: ['processing.started', 'processing.completed'],
      status: 'active',
      createdAt: '2025-01-12'
    }
  ]

  const activityLogs: ActivityLog[] = [
    {
      id: '1',
      integration: 'Google Drive',
      action: 'File uploaded: invoice_001.xlsx',
      timestamp: '2025-01-14 10:30 AM',
      status: 'success'
    },
    {
      id: '2',
      integration: 'Zapier',
      action: 'Workflow triggered: Send to Accounting',
      timestamp: '2025-01-14 09:15 AM',
      status: 'success'
    },
    {
      id: '3',
      integration: 'Google Drive',
      action: 'File uploaded: receipt_045.xlsx',
      timestamp: '2025-01-14 08:45 AM',
      status: 'success'
    },
    {
      id: '4',
      integration: 'Zapier',
      action: 'Workflow triggered: Process Document',
      timestamp: '2025-01-13 04:20 PM',
      status: 'failed',
      details: 'Connection timeout'
    },
  ]

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsConnectDialogOpen(true)
  }

  const handleDisconnect = async (integrationId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // In a real implementation, this would call an API to disconnect the integration
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Disconnecting:', integrationId)
      // Refresh the page to show updated status
      window.location.reload()
    } catch (err) {
      setError("Failed to disconnect integration")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const connectedIntegrations = integrations.filter(i => i.connected)
  const availableIntegrations = integrations.filter(i => !i.connected)

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <header className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Plug className="w-8 h-8 mr-3 text-brand-primary" />
          Integrations
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect DoCapture with your favorite tools and services
        </p>
      </header>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Integration capabilities are coming soon. Currently connected integrations are for demonstration purposes only.
        </AlertDescription>
      </Alert>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="connected" className="space-y-6">
        <TabsList>
          <TabsTrigger value="connected" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Connected ({connectedIntegrations.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="gap-2">
            <Plug className="h-4 w-4" />
            Available ({availableIntegrations.length})
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Connected Integrations Tab */}
        <TabsContent value="connected" className="space-y-4">
          {connectedIntegrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plug className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-xl font-semibold text-muted-foreground mb-2">No Connected Integrations</p>
                <p className="text-muted-foreground text-center mb-4">
                  Connect your first integration to automate your workflow
                </p>
                <Button onClick={() => (document.querySelector('[data-value="available"]') as HTMLElement)?.click()}>
                  Browse Available Integrations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connectedIntegrations.map((integration) => (
                <Card key={integration.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <integration.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <Badge className="mt-1" variant={integration.status === 'active' ? 'default' : 'secondary'}>
                            {integration.status === 'active' ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <Circle className="h-3 w-3 mr-1" />
                            )}
                            {integration.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Connected on {new Date(integration.connectedAt!).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-destructive hover:text-destructive"
                          onClick={() => handleDisconnect(integration.id)}
                          disabled={loading}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Available Integrations Tab */}
        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableIntegrations.map((integration) => (
              <Card key={integration.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <integration.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                      </div>
                    </div>
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      {integration.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      onClick={() => handleConnect(integration)}
                    >
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Endpoints</CardTitle>
              <CardDescription>Configure webhooks to receive real-time notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{webhook.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{webhook.url}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                          {webhook.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Created: {new Date(webhook.createdAt).toLocaleDateString()}
                        </span>
                        {webhook.lastTriggered && (
                          <span className="text-xs text-muted-foreground">
                            Last triggered: {webhook.lastTriggered}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {webhook.events.map((event, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Webhook
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for programmatic access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Production API Key</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {showApiKey ? apiKey : 'sk_live_****************************************************************xyz789'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create New API Key
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Activity</CardTitle>
              <CardDescription>Recent integration activities and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLogs.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    {activity.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        <span>{activity.integration}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{activity.timestamp}</span>
                      </div>
                      {activity.details && (
                        <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
                      )}
                    </div>
                    <Badge variant={activity.status === 'success' ? 'default' : 'destructive'}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connect Integration Dialog */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Follow the steps below to connect {selectedIntegration?.name} to your DoCapture account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Step 1: Sign in to {selectedIntegration?.name}</Label>
              <p className="text-sm text-muted-foreground">
                You'll be redirected to {selectedIntegration?.name} to authorize the connection.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Step 2: Grant permissions</Label>
              <p className="text-sm text-muted-foreground">
                Review and approve the requested permissions for DoCapture.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Step 3: Complete setup</Label>
              <p className="text-sm text-muted-foreground">
                You'll be redirected back to DoCapture to complete the integration setup.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // In a real implementation, this would redirect to the OAuth flow
              setIsConnectDialogOpen(false)
              // Simulate connection success
              setTimeout(() => {
                window.location.reload()
              }, 1000)
            }}>
              Connect to {selectedIntegration?.name}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}