"use client"

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, Loader2 } from "lucide-react"

export default function TestUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [testError, setTestError] = useState<string | null>(null)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setTestError(null)
      setTestResult(null)
    }
  }

  // Test file upload
  const testUpload = async () => {
    if (!selectedFile) {
      setTestError("Please select a file to test")
      return
    }
    
    setIsTesting(true)
    setTestError(null)
    setTestResult(null)
    
    try {
      console.log("Testing file upload with file:", selectedFile.name)
      
      // Create FormData
      const formData = new FormData()
      formData.append("document", selectedFile)
      formData.append("prompt", "Test upload")
      
      // Log FormData contents
      console.log("FormData entries:")
      for (const [key, value] of formData.entries()) {
        console.log(key, value)
      }
      
      // Log headers that will be sent
      const headers = {
        "Authorization": "Bearer test-token",
      }
      
      console.log("Headers to be sent:", headers)
      
      // Send test request
      const response = await fetch("http://localhost:3001/agui/field-extractor", {
        method: "POST",
        headers: headers,
        body: formData,
      })
      
      console.log("Request headers being sent:", [...response.headers.entries()])
      
      console.log("Response status:", response.status)
      console.log("Response headers:", [...response.headers.entries()])
      
      setTestResult({
        status: response.status,
        headers: [...response.headers.entries()],
        ok: response.ok
      })
    } catch (err) {
      console.error("Test error:", err)
      setTestError("Failed to test upload: " + (err as Error).message)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">File Upload Test</h1>
        
        <div className="bg-card rounded-lg border p-6 max-w-2xl">
          <h2 className="text-2xl font-semibold mb-6">Test File Upload</h2>
          
          <div className="space-y-6">
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
                disabled={isTesting}
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={testUpload} 
                disabled={isTesting || !selectedFile}
                className="flex-1"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Test Upload
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {testError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Test Error</AlertTitle>
              <AlertDescription>{testError}</AlertDescription>
            </Alert>
          )}
          
          {testResult && (
            <Alert className="mt-4">
              <AlertTitle>Test Result</AlertTitle>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  )
}