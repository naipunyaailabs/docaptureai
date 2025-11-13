// pages/test-agui.tsx
// Test page for AG-UI integration

"use client";

import React, { useState } from "react";
import { useDocumentFieldExtractor } from "@/hooks/useAGUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function TestAGUIPage() {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  
  const fieldExtractor = useDocumentFieldExtractor({
    onProgress: (progress, message) => {
      console.log(`Progress: ${progress}% - ${message}`);
    },
    onComplete: (result) => {
      console.log('Field extraction completed:', result);
    },
    onError: (error) => {
      console.error('Field extraction error:', error);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleExtractFields = async () => {
    if (!documentFile) return;
    
    console.log('Starting field extraction...');
    const result = await fieldExtractor.extractFields(documentFile, {
      prompt: "Extract all key information from this document",
      requiredFields: ["title", "date", "amount", "vendor", "description"]
    });
    
    console.log('Field extraction result:', result);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AG-UI Integration Test
          </CardTitle>
          <CardDescription>
            Test the AG-UI protocol integration with your existing backend services. Field extraction and summarization work with any document type.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Document:
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.tiff,.txt"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-brand-primary file:text-black
                hover:file:bg-brand-primary/90"
            />
            {documentFile && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {documentFile.name} ({(documentFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Progress Indicator */}
          {fieldExtractor.isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{fieldExtractor.message}</span>
                <span className="text-gray-500">{fieldExtractor.progress}%</span>
              </div>
              <Progress value={fieldExtractor.progress} className="h-2" />
            </div>
          )}

          {/* Error Display */}
          {fieldExtractor.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{fieldExtractor.error}</AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          <Button
            onClick={handleExtractFields}
            disabled={!documentFile || fieldExtractor.isLoading}
            className="flex items-center gap-2"
          >
            {fieldExtractor.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Extracting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Extract Fields
              </>
            )}
          </Button>

          {/* Results Display */}
          {fieldExtractor.result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Extraction Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Extracted Fields:</h4>
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-64">
                      {JSON.stringify(
                        fieldExtractor.result?.result?.extracted || 
                        fieldExtractor.result?.extracted || 
                        fieldExtractor.result, 
                        null, 2
                      )}
                    </pre>
                  </div>
                  
                  {(fieldExtractor.result?.result?.templateId || fieldExtractor.result?.templateId) && (
                    <p className="text-sm text-gray-600">
                      Template Used: {fieldExtractor.result?.result?.templateId || fieldExtractor.result?.templateId}
                      {(fieldExtractor.result?.result?.confidence || fieldExtractor.result?.confidence) && 
                        ` (${fieldExtractor.result?.result?.confidence || fieldExtractor.result?.confidence}% confidence)`
                      }
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Log */}
          {fieldExtractor.events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Event Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-32 overflow-auto">
                  {fieldExtractor.events.map((event, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="font-mono">{event.type}</span>
                      <span className="text-gray-400">•</span>
                      <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                      {event.data?.message && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{event.data.message}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1">
                <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}</p>
                <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_API_KEY ? 'Set' : 'Not set'}</p>
                <p><strong>Current State:</strong> {JSON.stringify({
                  isLoading: fieldExtractor.isLoading,
                  progress: fieldExtractor.progress,
                  hasResult: !!fieldExtractor.result,
                  hasError: !!fieldExtractor.error,
                  eventsCount: fieldExtractor.events.length
                })}</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
