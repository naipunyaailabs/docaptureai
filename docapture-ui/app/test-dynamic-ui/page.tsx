"use client";

import { useState } from "react";
import { DynamicServicePage } from "@/components/dynamic-service-page";
import { DynamicResultViewer } from "@/components/dynamic-result-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock service data for demonstration
const mockServices = [
  {
    id: "field-extractor",
    name: "Field Flex AI",
    description: "Extract user-defined fields from documents.",
    longDescription: "Upload your documents and specify the exact field names you need to extract. Ideal for unique or rapidly changing document structures.",
    endpoint: "/v1/extract",
    supportedFormats: ["json", "excel"],
    supportedFileTypes: [".pdf", ".jpg", ".jpeg", ".png", ".docx", ".doc", ".txt"],
    icon: "ListChecks",
    category: "Template Extraction",
    fileFieldName: "file",
  },
  {
    id: "document-summarizer",
    name: "Docu Summarizer AI",
    description: "Create comprehensive summaries of documents.",
    longDescription: "Generate concise, accurate summaries of any document with key points and important details highlighted.",
    endpoint: "/v1/summarize",
    supportedFormats: ["html", "text", "markdown"],
    supportedFileTypes: [".pdf", ".jpg", ".jpeg", ".png", ".docx", ".doc", ".txt"],
    icon: "FileText",
    category: "Data Extraction",
    fileFieldName: "file",
  },
  {
    id: "rfp-creator",
    name: "RFP Generator AI",
    description: "Create professional Request for Proposal documents.",
    longDescription: "Generate comprehensive RFP documents with standard sections and customizable content.",
    endpoint: "/v1/create-rfp",
    supportedFormats: ["word"],
    supportedFileTypes: [],
    icon: "FileBarChart",
    category: "Document Creation",
    fileFieldName: "",
  }
];

// Mock results for demonstration
const mockResults = {
  "field-extractor": {
    extracted: {
      "invoice_number": "INV-2023-0042",
      "date": "2023-05-15",
      "due_date": "2023-06-15",
      "vendor": "Acme Supplies Inc.",
      "total": 1250.0,
      "tax": 125.0,
      "currency": "USD"
    },
    templateId: "invoice-template-123",
    confidence: 95,
    usedTemplate: true
  },
  "document-summarizer": {
    summary: `
      <div class="p-4">
        <h2 class="text-xl font-bold mb-4">Document Summary</h2>
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold">Overview</h3>
            <p class="text-gray-700">This document outlines the key terms and conditions of a software development agreement between two parties.</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold">Key Points</h3>
            <ul class="list-disc pl-6 space-y-2 text-gray-700">
              <li>Project duration: 6 months</li>
              <li>Total budget: $150,000</li>
              <li>Payment schedule: Monthly installments</li>
              <li>Deliverables: Custom web application with mobile support</li>
            </ul>
          </div>
        </div>
      </div>
    `,
    format: "html",
    wordCount: 1247
  },
  "rfp-creator": {
    fileName: "Software_Development_Services_RFP.docx",
    fileSize: 245760,
    processingTime: 1245
  }
};

export default function TestDynamicUIPage() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [mockResult, setMockResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setMockResult(null);
    setIsLoading(false);
    setError(null);
  };

  const handleMockProcess = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate processing delay
    setTimeout(() => {
      if (selectedService) {
        setMockResult(mockResults[selectedService.id as keyof typeof mockResults] || {});
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleMockError = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate error delay
    setTimeout(() => {
      setError("Failed to process document. Please try again.");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dynamic UI Testing</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Service Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockServices.map((service) => (
              <Button
                key={service.id}
                variant={selectedService?.id === service.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleServiceSelect(service)}
              >
                <span className="font-medium">{service.name}</span>
              </Button>
            ))}
            
            {selectedService && (
              <div className="pt-4 space-y-3">
                <Button 
                  className="w-full" 
                  onClick={handleMockProcess}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Process Mock Document"}
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleMockError}
                  disabled={isLoading}
                >
                  Simulate Error
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setSelectedService(null);
                    setMockResult(null);
                    setIsLoading(false);
                    setError(null);
                  }}
                >
                  Reset
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Dynamic UI Display */}
        <div className="lg:col-span-2 space-y-6">
          {selectedService ? (
            <>
              <DynamicServicePage service={selectedService} />
              <Card>
                <CardHeader>
                  <CardTitle>Dynamic Result Viewer</CardTitle>
                </CardHeader>
                <CardContent>
                  <DynamicResultViewer
                    serviceId={selectedService.id}
                    result={mockResult}
                    isLoading={isLoading}
                    error={error}
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Select a service to see the dynamic UI in action
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}