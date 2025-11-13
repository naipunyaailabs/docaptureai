# Docapture Full Stack Deployment Guide

Complete guide for deploying the Docapture application using Docker Compose for development, staging, and production environments.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start (Development)](#quick-start-development)
- [Production Deployment](#production-deployment)
- [Configuration](#configuration)
- [Deployment Commands](#deployment-commands)
- [Monitoring and Logs](#monitoring-and-logs)
- [Troubleshooting](#troubleshooting)
- [Scaling](#scaling)
- [Backup and Recovery](#backup-and-recovery)

---

## 🏗️ Architecture Overview

The Docapture application consists of three main components:

```
┌─────────────────────────────────────────────────────────┐
│                Load Balancer/Proxy (External)           │
│              (Not included in this setup)               │
└───────────────────┬─────────────────┬───────────────────┘
                    │                 │
        ┌───────────▼─────────┐  ┌────▼──────────────────┐
        │  Frontend (Port 3000)│  │  Backend (Port 5000)  │
        │   Next.js + Bun      │  │    Bun Runtime        │
        │   docapture-ui       │  │  docextract-api       │
        └──────────────────────┘  └───────────┬───────────┘
                                              │
                                    ┌─────────▼──────────┐
                                    │  MongoDB (27017)   │
                                    │   Database         │
                                    └────────────────────┘
```

### Components:

1. **Frontend (docapture-ui)**
   - Next.js 15 application
   - Runs on Bun runtime
   - Port: 3000 (exposed)
   - Handles user interface and client-side logic

2. **Backend (docextract-api)**
   - Bun-based REST API
   - Port: 5000 (exposed)
   - Document processing, AI integration, authentication
   - Email service for user verification

3. **MongoDB**
   - Database for user data, subscriptions, processing history
   - Port: 27017 (internal only)
   - Persistent storage with volumes

---

## ✅ Prerequisites

### Required Software

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository

### System Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB free space

**Recommended (Production):**
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 50GB+ SSD

### Installation

**Windows:**
```bash
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/

# Verify installation
docker --version
docker-compose --version
```

**Linux:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

**macOS:**
```bash
# Install Docker Desktop for Mac
# Download from: https://www.docker.com/products/docker-desktop/

# Verify installation
docker --version
docker-compose --version
```

---

## MCPTools';
import MCPStatus from './MCPStatus';
import MCPSessionControls from './MCPSessionControls';
import MCPChat from './MCPChat';
import MCPCostDisplay from './MCPCostDisplay';
import MCPFileViewer from './MCPFileViewer';
import MCPClaimsViewer from './MCPClaimsViewer';
import MCPCitationsViewer from './MCPCitationsViewer';
import MCPSummaryViewer from './MCPSummaryViewer';
import MCPExtractedDataViewer from './MCPExtractedDataViewer';
import MCPRFPViewer from './MCPRFPViewer';
import MCPTimelineViewer from './MCPTimelineViewer';
import MCPGraphViewer from './MCPGraphViewer';
import MCPDebugViewer from './MCPDebugViewer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Play, 
  Square, 
  RotateCcw, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Calendar, 
  Network,
  Eye,
  EyeOff,
  Settings,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';

const MultiClaimProcessor = () => {
  const [session, setSession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showDebug, setShowDebug] = useState(false);
  const [cost, setCost] = useState(0);
  const [files, setFiles] = useState([]);
  const [claims, setClaims] = useState([]);
  const [citations, setCitations] = useState([]);
  const [summary, setSummary] = useState('');
  const [extractedData, setExtractedData] = useState({});
  const [rfp, setRfp] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  // Initialize session
  const initializeSession = async () => {
    try {
      const response = await axios.post(`${config.backendUrl}/api/mcp/session`);
      setSession(response.data.sessionId);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError('Failed to initialize session');
      console.error('Session initialization error:', err);
    }
  };

  // Connect to SSE stream
  const connectToStream = () => {
    if (!session) return;

    const eventSource = new EventSource(`${config.backendUrl}/api/mcp/stream/${session}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleStreamData(data);
      } catch (err) {
        console.error('Error parsing stream data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      setError('Connection to server lost');
      setIsConnected(false);
    };
  };

  // Handle incoming stream data
  const handleStreamData = (data) => {
    switch (data.type) {
      case 'status':
        // Handle status updates
        break;
      case 'file':
        setFiles(prev => [...prev, data.payload]);
        break;
      case 'claim':
        setClaims(prev => [...prev, data.payload]);
        break;
      case 'citation':
        setCitations(prev => [...prev, data.payload]);
        break;
      case 'summary':
        setSummary(data.payload);
        break;
      case 'extracted_data':
        setExtractedData(data.payload);
        break;
      case 'rfp':
        setRfp(data.payload);
        break;
      case 'timeline':
        setTimeline(data.payload);
        break;
      case 'graph':
        setGraphData(data.payload);
        break;
      case 'cost':
        setCost(data.payload.total);
        break;
      case 'debug':
        setDebugInfo(prev => ({ ...prev, ...data.payload }));
        break;
      case 'complete':
        setIsProcessing(false);
        break;
      case 'error':
        setError(data.payload);
        setIsProcessing(false);
        break;
    }
  };

  // Start processing
  const startProcessing = async () => {
    if (!session || isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);
      await axios.post(`${config.backendUrl}/api/mcp/process/${session}`);
    } catch (err) {
      setError('Failed to start processing');
      setIsProcessing(false);
      console.error('Processing start error:', err);
    }
  };

  // Stop processing
  const stopProcessing = async () => {
    if (!session || !isProcessing) return;

    try {
      await axios.post(`${config.backendUrl}/api/mcp/stop/${session}`);
      setIsProcessing(false);
    } catch (err) {
      console.error('Processing stop error:', err);
    }
  };

  // Reset session
  const resetSession = async () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setSession(null);
    setIsConnected(false);
    setIsProcessing(false);
    setCost(0);
    setFiles([]);
    setClaims([]);
    setCitations([]);
    setSummary('');
    setExtractedData({});
    setRfp('');
    setTimeline([]);
    setGraphData(null);
    setDebugInfo({});
    setError(null);

    await initializeSession();
  };

  // Download results
  const downloadResults = async () => {
    try {
      const response = await axios.get(`${config.backendUrl}/api/mcp/results/${session}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mcp-results-${session}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download results');
    }
  };

  // Initialize on component mount
  useEffect(() => {
    initializeSession();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Connect to stream when session is established
  useEffect(() => {
    if (session && !isConnected) {
      connectToStream();
    }
  }, [session, isConnected]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Multi-Claim Processor</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <MCPSessionControls 
                session={session}
                isConnected={isConnected}
                isProcessing={isProcessing}
                onStart={startProcessing}
                onStop={stopProcessing}
                onReset={resetSession}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <MCPStatus isConnected={isConnected} isProcessing={isProcessing} />
              <MCPCostDisplay cost={cost} />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tools and File Upload */}
          <div className="space-y-6">
            <MCPTools session={session} isConnected={isConnected} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Uploaded Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MCPFileViewer files={files} />
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Chat and Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Processing Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MCPChat session={session} isConnected={isConnected} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Results
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDebug(!showDebug)}
                  >
                    {showDebug ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="claims">Claims</TabsTrigger>
                    <TabsTrigger value="citations">Citations</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                  </TabsList>
                  <Separator className="my-4" />
                  <ScrollArea className="h-[300px]">
                    <TabsContent value="claims">
                      <MCPClaimsViewer claims={claims} />
                    </TabsContent>
                    <TabsContent value="citations">
                      <MCPCitationsViewer citations={citations} />
                    </TabsContent>
                    <TabsContent value="summary">
                      <MCPSummaryViewer summary={summary} />
                    </TabsContent>
                    <TabsContent value="data">
                      <MCPExtractedDataViewer data={extractedData} />
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Advanced Views */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MCPTimelineViewer timeline={timeline} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Network className="mr-2 h-5 w-5" />
                  Relationship Graph
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MCPGraphViewer data={graphData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Generated RFP
                  </span>
                  <Button variant="outline" size="sm" onClick={downloadResults}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MCPRFPViewer rfp={rfp} />
              </CardContent>
            </Card>

            {showDebug && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Debug Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MCPDebugViewer debugInfo={debugInfo} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiClaimProcessor;