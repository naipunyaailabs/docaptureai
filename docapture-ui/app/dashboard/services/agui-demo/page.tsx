"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileSearch, ArrowLeft, Loader2, Upload } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { apiService, type ServiceInfo } from "@/lib/api"
// Removed CopilotKit imports
import { aguiClient } from "@/lib/agui-client"

export default function AGUIDemoPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  
  const [service, setService] = useState<ServiceInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [output, setOutput] = useState<string>("")
  const [status, setStatus] = useState<string>("Ready")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingError, setProcessingError] = useState<string | null>(null)

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
        const response = await apiService.getServiceById("field-extractor")
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

  // Auto-scroll output to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

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
      setError("Please select a file to process")
      return
    }
    
    setIsProcessing(true)
    setProcessingError(null)
    setStatus("Processing")
    setOutput("")
    
    try {
      const response = await aguiClient.extractDocumentFields(selectedFile, { prompt })
      setOutput(JSON.stringify(response, null, 2))
      setStatus("Completed")
    } catch (err) {
      console.error("Error:", err)
      setProcessingError("Failed to extract fields from document")
      setStatus("Error")
      setOutput(`Error: ${(err as Error).message}`)
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
            <FileSearch className="h-4 w-4" />
            <AlertTitle>Service not found</AlertTitle>
            <AlertDescription>The Field Extractor service is not available.</AlertDescription>
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
              <h1 className="text-3xl font-bold">AG-UI Demo</h1>
              <p className="text-muted-foreground">Demonstration of the Agent-User Interaction protocol</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Powered by AG-UI Protocol
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-6">Document Processing</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Document
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

              <div>
                <label className="block text-sm font-medium mb-2">
                  Prompt (Optional)
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Extract invoice details"
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={isProcessing}
                />
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Process Document
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">🤖 AI Assistant Available</h3>
                <p className="text-blue-700 text-sm">
                  Click the assistant button in the bottom right corner to ask the AI to help with field extraction.
                  You can say things like "Extract the key information from this invoice" or "Find the contract terms in this document".
                </p>
              </div>
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
              <h2 className="text-2xl font-semibold">Live Output</h2>
              <div className="text-sm">
                <span className={`px-2 py-1 rounded-full ${
                  status === "Error" ? "bg-red-100 text-red-800" :
                  status === "Completed" ? "bg-green-100 text-green-800" :
                  status === "Processing" || status === "Starting..." ? "bg-yellow-100 text-yellow-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {status}
                </span>
              </div>
            </div>
            
            <div 
              ref={outputRef}
              className="bg-muted p-4 rounded-md h-96 overflow-y-auto font-mono text-sm whitespace-pre-wrap"
            >
              {output || (
                <div className="text-muted-foreground h-full flex items-center justify-center">
                  {isProcessing ? "Waiting for output..." : "Process a document to see output here"}
                </div>
              )}
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>This demo shows real-time streaming of document processing using the AG-UI protocol.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}