"use client";

import React, { useState, useCallback } from "react";
import { useAGUI } from "@/hooks/useAGUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicResultViewer } from "@/components/dynamic-result-viewer";
import { BatchProcessor } from "@/components/batch-processor";
import { FileText, Download, CheckCircle, AlertCircle, Loader2, Upload, Info, Files } from "lucide-react";
import type { ServiceInfo } from "@/lib/api";

interface DynamicServicePageProps {
  service: ServiceInfo;
}

export function DynamicServicePage({ service }: DynamicServicePageProps) {
  const [inputData, setInputData] = useState<Record<string, any>>({});
  const agui = useAGUI({
    onProgress: (progress, message) => {
      console.log(`[${service.name}] Progress: ${progress}% - ${message}`);
    },
    onComplete: (result) => {
      console.log(`[${service.name}] Completed:`, result);
    },
    onError: (error) => {
      console.error(`[${service.name}] Error:`, error);
    }
  });

  // Handle input changes
  const handleInputChange = (key: string, value: any) => {
    setInputData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      handleInputChange(key, e.target.files[0]);
    }
  };

  // Render dynamic input fields based on service requirements
  const renderInputFields = () => {
    const fields = [];
    
    // Add document file input for services that process documents
    if (service.supportedFileTypes.length > 0) {
      fields.push(
        <div key="document-file" className="space-y-2">
          <Label htmlFor="document">Document File</Label>
          <Input
            id="document"
            type="file"
            onChange={(e) => handleFileChange(e, "document")}
            accept={service.supportedFileTypes.join(",")}
            disabled={agui.isLoading}
          />
          {inputData.document && (
            <p className="text-sm text-muted-foreground">
              Selected: {inputData.document.name} ({(inputData.document.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
      );
    }
    
    // Add format selection for services that support multiple formats
    if (service.supportedFormats.length > 1) {
      fields.push(
        <div key="format" className="space-y-2">
          <Label htmlFor="format">Output Format</Label>
          <Select
            onValueChange={(value) => handleInputChange("format", value)}
            defaultValue="excel"
            disabled={agui.isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {service.supportedFormats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    } else if (service.supportedFormats.length === 1) {
      // Hidden input for single format
      fields.push(
        <input
          key="format-hidden"
          type="hidden"
          value="excel"
        />
      );
    }
    
    // Add prompt input for services that support custom prompts
    const promptServices = ["field-extractor", "document-summarizer", "groq-extraction"];
    if (promptServices.includes(service.id)) {
      fields.push(
        <div key="prompt" className="space-y-2">
          <Label htmlFor="prompt">
            {service.id === "field-extractor" ? "Extraction Prompt" : "Summary Prompt"}
          </Label>
          <Textarea
            id="prompt"
            placeholder={
              service.id === "field-extractor" 
                ? "E.g., Extract job title, description, responsibilities, and required skills" 
                : "E.g., Focus on key points and important details"
            }
            value={inputData.prompt || ""}
            onChange={(e) => handleInputChange("prompt", e.target.value)}
            disabled={agui.isLoading}
          />
        </div>
      );
    }
    
    // Add required fields input for field extractor
    if (service.id === "field-extractor") {
      fields.push(
        <div key="required-fields" className="space-y-2">
          <Label htmlFor="required-fields">Required Fields (comma separated)</Label>
          <Input
            id="required-fields"
            placeholder="E.g., jobTitle, jobDescription, keyResponsibilities"
            value={inputData.requiredFields?.join(", ") || ""}
            onChange={(e) => handleInputChange("requiredFields", e.target.value.split(",").map(f => f.trim()))}
            disabled={agui.isLoading}
          />
        </div>
      );
    }
    
    // Add RFP-specific fields
    if (service.id === "rfp-creator") {
      fields.push(
        <div key="rfp-title" className="space-y-2">
          <Label htmlFor="rfp-title">RFP Title *</Label>
          <Input
            id="rfp-title"
            placeholder="E.g., Software Development Services RFP"
            value={inputData.title || ""}
            onChange={(e) => handleInputChange("title", e.target.value)}
            disabled={agui.isLoading}
            required
          />
        </div>
      );
      
      fields.push(
        <div key="rfp-organization" className="space-y-2">
          <Label htmlFor="rfp-organization">Organization *</Label>
          <Input
            id="rfp-organization"
            placeholder="E.g., Acme Corporation"
            value={inputData.organization || ""}
            onChange={(e) => handleInputChange("organization", e.target.value)}
            disabled={agui.isLoading}
            required
          />
        </div>
      );
      
      fields.push(
        <div key="rfp-deadline" className="space-y-2">
          <Label htmlFor="rfp-deadline">Deadline *</Label>
          <Input
            id="rfp-deadline"
            type="date"
            value={inputData.deadline || ""}
            onChange={(e) => handleInputChange("deadline", e.target.value)}
            disabled={agui.isLoading}
            required
          />
        </div>
      );
    }
    
    return fields.length > 0 ? (
      <div className="space-y-4">
        {fields}
      </div>
    ) : (
      <p className="text-muted-foreground">No input required for this service.</p>
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields for RFP creator
    if (service.id === "rfp-creator") {
      if (!inputData.title || !inputData.organization || !inputData.deadline) {
        alert("Please fill in all required fields (Title, Organization, and Deadline)");
        return;
      }
    }
    
    // Prepare input data based on service type
    let input: any = { ...inputData };
    
    // For field extractor, ensure requiredFields is properly formatted
    if (service.id === "field-extractor" && input.requiredFields) {
      // Already handled in handleInputChange
    }
    
    // For RFP creator, ensure sections is an array
    if (service.id === "rfp-creator") {
      // In a real implementation, you might want to add section inputs
      // For now, we'll use default sections
      if (!input.sections) {
        input.sections = [
          { title: "Project Overview", content: "We need a comprehensive solution..." },
          { title: "Technical Requirements", content: "The system must support..." },
          { title: "Timeline", content: "Project should be completed within..." }
        ];
      }
    }
    
    try {
      await agui.executeAgent(service.id, input);
    } catch (error) {
      console.error("Error executing service:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button and title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">{service.name}</h1>
            <p className="text-muted-foreground">{service.description}</p>
          </div>
        </div>

        {/* Tabs for Single vs Batch Processing */}
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Single Document
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-2">
              <Files className="h-4 w-4" />
              Batch Processing
            </TabsTrigger>
          </TabsList>

          {/* Single Document Processing */}
          <TabsContent value="single" className="space-y-8">
            <div className="flex flex-col gap-8">
              {/* Input Form */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-2xl font-semibold mb-6">Document Processing</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {renderInputFields()}
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={agui.isLoading}
                      className="flex-1"
                    >
                      {agui.isLoading ? (
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
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        agui.reset();
                        setInputData({});
                      }}
                      disabled={agui.isLoading}
                    >
                      Reset
                    </Button>
                  </div>
                </form>
                
                {/* Progress Indicator */}
                {agui.isLoading && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{agui.message}</span>
                      <span className="text-gray-500">{agui.progress}%</span>
                    </div>
                    <Progress value={agui.progress} className="h-2" />
                  </div>
                )}
                
                {/* Error Display */}
                {agui.error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{agui.error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Service Information */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Service Information</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Category:</span> {service.category}</p>
                    {service.supportedFileTypes.length > 0 && (
                      <p><span className="font-medium">Supported File Types:</span> {service.supportedFileTypes.join(", ")}</p>
                    )}
                    {service.supportedFormats.length > 0 && (
                      <p><span className="font-medium">Output Formats:</span> {service.supportedFormats.join(", ")}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Processing Events */}
              {agui.events.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Processing Events
                    </CardTitle>
                    <CardDescription>
                      Real-time processing updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-auto">
                      {[...agui.events].reverse().slice(0, 10).map((event, index) => (
                        <div key={index} className="text-xs p-2 bg-muted rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">{event.type}</span>
                            <span className="text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          {event.data?.message && (
                            <p className="text-muted-foreground mt-1">{event.data.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Output Panel */}
              <div className="space-y-6">
                <DynamicResultViewer
                  serviceId={service.id}
                  result={agui.result}
                  isLoading={agui.isLoading}
                  error={agui.error}
                />
              </div>
            </div>
          </TabsContent>

          {/* Batch Processing */}
          <TabsContent value="batch">
            <BatchProcessor service={service} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}