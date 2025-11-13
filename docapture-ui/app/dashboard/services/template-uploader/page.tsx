"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, ArrowLeft, Loader2, Info } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { apiService, type ServiceInfo } from "@/lib/api"
// Removed CopilotKit imports
import { aguiClient } from "@/lib/agui-client"

export default function TemplateUploaderPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [service, setService] = useState<ServiceInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fields, setFields] = useState<string[]>([""])
  const [result, setResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [events, setEvents] = useState<any[]>([]); // Add events state

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
        const response = await apiService.getServiceById("template-uploader")
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

  const addField = () => {
    setFields([...fields, ""]);
  };

  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = value;
    setFields(newFields);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      const newFields = fields.filter((_, i) => i !== index);
      setFields(newFields);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setProcessingError(null);
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setProcessingError("Please select a template document");
      return;
    }
    
    // Filter out empty fields
    const nonEmptyFields = fields.filter(f => f.trim() !== "");
    if (nonEmptyFields.length === 0) {
      setProcessingError("Please specify at least one field to extract");
      return;
    }
    
    setIsProcessing(true);
    setProcessingError(null);
    setEvents([{ type: "info", message: "Starting template upload...", timestamp: Date.now() }]); // Add initial event
    
    try {
      setEvents(prev => [...prev, { type: "info", message: "Uploading template...", timestamp: Date.now() }]);
      
      const response = await aguiClient.executeAgent('template-uploader', { 
        document: selectedFile, 
        requiredFields: nonEmptyFields 
      })
      
      if (response.success) {
        setEvents(prev => [...prev, { type: "success", message: "Template uploaded successfully", timestamp: Date.now() }]);
        setResult(response.data)
      } else {
        throw new Error(response.error || "Failed to upload template")
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMessage = "Failed to upload template";
      setEvents(prev => [...prev, { type: "error", message: errorMessage, timestamp: Date.now() }]);
      setProcessingError(errorMessage);
    } finally {
      setIsProcessing(false);
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
            <Upload className="h-4 w-4" />
            <AlertTitle>Service not found</AlertTitle>
            <AlertDescription>The Template Uploader service is not available.</AlertDescription>
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
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Powered by AG-UI Protocol
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Input Form */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-6">Upload Document Template</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Template Document
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Template Fields</h3>
                  <button
                    type="button"
                    onClick={addField}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                    disabled={isProcessing}
                  >
                    Add Field
                  </button>
                </div>
                
                {fields.map((field, index) => (
                  <div key={index} className="flex items-center mb-3">
                    <input
                      type="text"
                      value={field}
                      onChange={(e) => updateField(index, e.target.value)}
                      placeholder="E.g., Invoice Number, Total Amount, Due Date"
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                      disabled={isProcessing}
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="ml-2 px-3 py-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                        disabled={isProcessing}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <p className="mt-1 text-sm text-gray-500">
                  Specify the key fields that should be extracted from documents using this template.
                </p>
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
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Template
                    </>
                  )}
                </Button>
              </div>
              
              {/* Removed AI Assistant section */}
            </form>
            
            {processingError && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Upload Error</AlertTitle>
                <AlertDescription>{processingError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Processing Events */}
          {events.length > 0 && (
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-2xl font-semibold mb-6">Processing Events</h2>
              <div className="space-y-2 max-h-40 overflow-auto">
                {[...events].reverse().map((event, index) => (
                  <div key={index} className="text-sm p-2 bg-muted rounded">
                    <div className="flex justify-between">
                      <span className={`font-medium ${
                        event.type === "error" ? "text-red-500" : 
                        event.type === "success" ? "text-green-500" : "text-blue-500"
                      }`}>
                        {event.type}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1">{event.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output Panel */}
          <div className="bg-card rounded-lg border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Upload Results</h2>
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
                <p className="text-muted-foreground">Uploading your template...</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Template Details</h3>
                  <div className="bg-muted p-4 rounded-md">
                    <p><strong>File Name:</strong> {result.fileName}</p>
                    <p><strong>Fields Defined:</strong> {result.fieldsCount}</p>
                    <p><strong>Template ID:</strong> {result.templateId}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Next Steps</h3>
                  <div className="bg-muted p-4 rounded-md">
                    <p>Your template is now available for use with the field extractor service.</p>
                    <p className="mt-2">Documents similar to this template will have improved extraction accuracy.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Upload a template to see results here</p>
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