"use client";

import React, { useState } from "react";
import { useDocumentFieldExtractor, useDocumentSummarizer, useRFPCreator } from "@/hooks/useAGUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Download, CheckCircle, AlertCircle } from "lucide-react";
import { DynamicResultViewer } from "@/components/dynamic-result-viewer";

export function DocumentCopilot() {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'extract' | 'summarize' | 'rfp'>('extract');

  // AG-UI hooks for different document processing services
  const fieldExtractor = useDocumentFieldExtractor({
    onProgress: (progress, message) => {
      console.log(`Field Extraction Progress: ${progress}% - ${message}`);
    },
    onComplete: (result) => {
      console.log('Field extraction completed:', result);
    },
    onError: (error) => {
      console.error('Field extraction error:', error);
    }
  });

  const documentSummarizer = useDocumentSummarizer({
    onProgress: (progress, message) => {
      console.log(`Summarization Progress: ${progress}% - ${message}`);
    },
    onComplete: (result) => {
      console.log('Document summarization completed:', result);
    },
    onError: (error) => {
      console.error('Document summarization error:', error);
    }
  });

  const rfpCreator = useRFPCreator({
    onProgress: (progress, message) => {
      console.log(`RFP Creation Progress: ${progress}% - ${message}`);
    },
    onComplete: (result) => {
      console.log('RFP creation completed:', result);
    },
    onError: (error) => {
      console.error('RFP creation error:', error);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleExtractFields = async () => {
    if (!documentFile) return;
    
    const result = await fieldExtractor.extractFields(documentFile, {
      prompt: "Extract all key information from this document",
      requiredFields: ["title", "date", "amount", "vendor", "description"]
    });
    
    console.log('Field extraction result:', result);
  };

  const handleSummarizeDocument = async () => {
    if (!documentFile) return;
    
    const result = await documentSummarizer.summarizeDocument(documentFile, {
      prompt: "Provide a comprehensive summary focusing on key points and important details",
      format: "excel"
    });
    
    console.log('Document summarization result:', result);
  };

  const handleCreateRFP = async () => {
    const result = await rfpCreator.createRFP({
      title: "Software Development Services RFP",
      organization: "Acme Corporation",
      deadline: "2024-02-15",
      sections: [
        { title: "Project Overview", content: "We need a comprehensive software solution..." },
        { title: "Technical Requirements", content: "The system must support..." },
        { title: "Timeline", content: "Project should be completed within 6 months..." }
      ],
      format: "excel"
    });
    
    console.log('RFP creation result:', result);
  };

  const getCurrentState = () => {
    switch (activeTab) {
      case 'extract': return fieldExtractor;
      case 'summarize': return documentSummarizer;
      case 'rfp': return rfpCreator;
      default: return fieldExtractor;
    }
  };

  const getCurrentServiceId = () => {
    switch (activeTab) {
      case 'extract': return 'field-extractor';
      case 'summarize': return 'document-summarizer';
      case 'rfp': return 'rfp-creator';
      default: return 'field-extractor';
    }
  };

  const currentState = getCurrentState();
  const currentServiceId = getCurrentServiceId();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AG-UI Document Processing Demo
          </CardTitle>
                 <CardDescription>
                   Experience real-time document processing using the AG-UI protocol. Field extraction and summarization work with any document type, while RFP creation generates new RFP documents.
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

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                   <button
                     onClick={() => setActiveTab('extract')}
                     className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                       activeTab === 'extract'
                         ? 'bg-white text-gray-900 shadow-sm'
                         : 'text-gray-600 hover:text-gray-900'
                     }`}
                   >
                     Field Extraction
                     <span className="block text-xs text-gray-500">Any Document</span>
                   </button>
                   <button
                     onClick={() => setActiveTab('summarize')}
                     className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                       activeTab === 'summarize'
                         ? 'bg-white text-gray-900 shadow-sm'
                         : 'text-gray-600 hover:text-gray-900'
                     }`}
                   >
                     Document Summary
                     <span className="block text-xs text-gray-500">Any Document</span>
                   </button>
                   <button
                     onClick={() => setActiveTab('rfp')}
                     className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                       activeTab === 'rfp'
                         ? 'bg-white text-gray-900 shadow-sm'
                         : 'text-gray-600 hover:text-gray-900'
                     }`}
                   >
                     RFP Creation
                     <span className="block text-xs text-gray-500">RFP Documents</span>
                   </button>
          </div>

          {/* Progress Indicator */}
          {currentState.isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{currentState.message}</span>
                <span className="text-gray-500">{currentState.progress}%</span>
              </div>
              <Progress value={currentState.progress} className="h-2" />
            </div>
          )}

          {/* Error Display */}
          {currentState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{currentState.error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {activeTab === 'extract' && (
              <Button
                onClick={handleExtractFields}
                disabled={!documentFile || currentState.isLoading}
                className="flex items-center gap-2"
              >
                {currentState.isLoading ? (
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
            )}

            {activeTab === 'summarize' && (
              <Button
                onClick={handleSummarizeDocument}
                disabled={!documentFile || currentState.isLoading}
                className="flex items-center gap-2"
              >
                {currentState.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Summarizing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Summarize Document
                  </>
                )}
              </Button>
            )}

            {activeTab === 'rfp' && (
              <Button
                onClick={handleCreateRFP}
                disabled={currentState.isLoading}
                className="flex items-center gap-2"
              >
                {currentState.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating RFP...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Create RFP
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => {
                fieldExtractor.reset();
                documentSummarizer.reset();
                rfpCreator.reset();
              }}
            >
              Reset
            </Button>
          </div>

          {/* Dynamic Results Display */}
          <DynamicResultViewer
            serviceId={currentServiceId}
            result={currentState.result}
            isLoading={currentState.isLoading}
            error={currentState.error}
          />

          {/* Event Log */}
          {currentState.events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Event Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-32 overflow-auto">
                  {currentState.events.map((event, index) => (
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
        </CardContent>
      </Card>
    </div>
  );
}