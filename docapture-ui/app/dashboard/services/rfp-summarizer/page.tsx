"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileBarChart, ArrowLeft, Loader2, Upload } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { apiService, type ServiceInfo } from "@/lib/api"
// Removed CopilotKit imports
import { aguiClient } from "@/lib/agui-client"

export default function RfpSummarizerPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [service, setService] = useState<ServiceInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingError, setProcessingError] = useState<string | null>(null)

  // Removed CopilotKit hooks - using direct AGUI service calls instead
  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch service details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      setIsLoading(true)
      try {
        const response = await apiService.getServiceById("rfp-summarizer")
        if (response.success && response.data) {
          setService(response.data)
        } else {
          setError("Service not found")
        }
      } catch (err) {
        setError("An error occurred while fetching service details")
      } finally {
        setIsLoading(false)
      }
    }
    if (isAuthenticated) {
      fetchServiceDetails()
    }
  }, [isAuthenticated])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setProcessingError(null)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setProcessingError("Please select an RFP document file")
      return
    }
    
    setIsProcessing(true)
    setProcessingError(null)
    
    try {
      const response = await aguiClient.summarizeRfp(selectedFile)
      if (response.success) {
        setResult(response.data)
      } else {
        throw new Error(response.error || "Failed to summarize RFP")
      }
    } catch (err) {
      console.error("Error:", err)
      setProcessingError("Failed to summarize RFP")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle loading state
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
      </div>
    )
  }
  
  // Handle initial loading
  if (isLoading && !service) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
        </main>
      </div>
    )
  }
  
  // Handle error state
  if (error && !service) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <FileBarChart className="h-4 w-4" />
            <AlertTitle>Service not found</AlertTitle>
            <AlertDescription>The RFP Summarizer service is not available.</AlertDescription>
          </Alert>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/services">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Link>
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button and title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <Button asChild variant="outline" className="mr-4">
              <Link href="/dashboard/services">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{service?.name}</h1>
              <p className="text-muted-foreground">{service?.description}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Powered by AG-UI Protocol
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-6">Summarize RFP Documents</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  RFP Document
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.tiff,.txt"
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={isProcessing}
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={isProcessing || !selectedFile}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Summarize RFP
                    </>
                  )}
                </Button>
              </div>
              
              {/* Removed AI Assistant section */}
            </form>
            
            {processingError && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Processing Error</AlertTitle>
                <AlertDescription>{processingError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Output Panel */}
          <div className="bg-card rounded-lg border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">RFP Summary</h2>
              <div className="text-sm">
                <span className={`px-2 py-1 rounded-full ${
                  processingError ? "bg-red-100 text-red-800" :
                  result ? "bg-green-100 text-green-800" :
                  isProcessing ? "bg-yellow-100 text-yellow-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {processingError ? "Error" : result ? "Completed" : isProcessing ? "Processing" : "Ready"}
                </span>
              </div>
            </div>
            
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="h-8 w-8 text-brand-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Analyzing your RFP document...</p>
              </div>
            ) : result ? (
              <div className="space-y-6 h-96 overflow-y-auto">
                {result.result?.html ? (
                  // Handle HTML response from RFP summarizer
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: result.result.html }}
                  />
                ) : result.executiveSummary || result.summary ? (
                  // Handle structured response (fallback)
                  <>
                    <div>
                      <h3 className="text-lg font-medium mb-3">Executive Summary</h3>
                      <div className="bg-muted p-4 rounded-md">
                        <p>{result.executiveSummary || result.summary}</p>
                      </div>
                    </div>
                    
                    {result.keyRequirements && (
                      <div>
                        <h3 className="text-lg font-medium mb-3">Key Requirements</h3>
                        <div className="bg-muted p-4 rounded-md">
                          <ul className="list-disc pl-6 space-y-2">
                            {result.keyRequirements.map((req: string, index: number) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {result.timeline && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium mb-3">Timeline</h3>
                          <div className="bg-muted p-4 rounded-md">
                            <div className="space-y-2">
                              <p><strong>Proposal Submission:</strong> {result.timeline.proposalSubmission}</p>
                              <p><strong>Evaluation Period:</strong> {result.timeline.evaluationPeriod}</p>
                              <p><strong>Project Kickoff:</strong> {result.timeline.projectKickoff}</p>
                              <p><strong>Delivery Deadline:</strong> {result.timeline.deliveryDeadline}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-3">Budget</h3>
                          <div className="bg-muted p-4 rounded-md">
                            <p><strong>Budget Range:</strong> {result.budgetRange}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Fallback for unknown response format
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileBarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Upload an RFP document to see summary results here</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>This service uses the AG-UI protocol for real-time document processing.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}