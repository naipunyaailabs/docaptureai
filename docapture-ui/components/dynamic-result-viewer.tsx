"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  FileSearch,
  FileBarChart,
  FileCode,
  Table,
  Brain,
  ChevronRight,
  FileSpreadsheet
} from "lucide-react";
import { convertJsonToExcelFormat, downloadAsExcel, processFieldExtractionForExcel } from "@/lib/excel-utils";
import { createFieldExtractionExcel, downloadExcelWorkbook } from "@/lib/advanced-excel-utils";

interface DynamicResultViewerProps {
  serviceId: string;
  result: any;
  isLoading: boolean;
  error: string | null;
}

export function DynamicResultViewer({
  serviceId,
  result,
  isLoading,
  error
}: DynamicResultViewerProps) {
  // Render JSON data in a formatted way
  const renderJsonResult = (data: any) => {
    if (!data) return null;
    
    // For field extraction results
    if (serviceId === "field-extractor") {
      return (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium flex items-center gap-2 text-lg">
                <FileSearch className="h-5 w-5" />
                Extracted Fields
              </h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={async () => {
                  const workbook = await createFieldExtractionExcel(data, { serviceId, processedAt: new Date().toISOString() });
                  await downloadExcelWorkbook(workbook, "field-extraction-results.xlsx");
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              {renderExtractedFields(data.extracted || data)}
            </div>
          </div>
          
          {/* Template information if available */}
          {(data.templateId || data.confidence !== undefined || data.usedTemplate !== undefined) && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2 text-lg">
                <FileCode className="h-5 w-5" />
                Template Information
              </h3>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                {data.templateId && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Template ID:</span>
                    <Badge variant="secondary">{data.templateId}</Badge>
                  </div>
                )}
                {data.confidence !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Confidence:</span>
                    <Badge variant="default">{data.confidence}%</Badge>
                  </div>
                )}
                {data.usedTemplate !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Template Used:</span>
                    <Badge variant={data.usedTemplate ? "default" : "secondary"}>
                      {data.usedTemplate ? "Yes" : "No"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // For other services, render generic JSON with Excel export option
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Processed Results
          </h3>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => downloadAsExcel(data, `${serviceId}-results.xlsx`)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  // Render extracted fields in a more readable format
  const renderExtractedFields = (fields: any) => {
    if (!fields) return null;
    
    // If it's already a string, try to parse it as JSON
    if (typeof fields === "string") {
      try {
        fields = JSON.parse(fields);
      } catch (e) {
        // If parsing fails, just display as string
        return <div className="text-sm">{fields}</div>;
      }
    }
    
    // If it's not an object, display as is
    if (typeof fields !== "object") {
      return <div className="text-sm">{JSON.stringify(fields)}</div>;
    }
    
    // Render object fields
    return (
      <div className="space-y-4">
        {Object.entries(fields).map(([key, value]) => (
          <div key={key} className="border-b border-muted pb-3 last:border-b-0">
            <div className="font-medium text-primary mb-2 flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              {formatFieldName(key)}
            </div>
            <div className="ml-6">
              {renderFieldValue(value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Format field names to be more readable
  const formatFieldName = (name: string) => {
    // Convert camelCase to Title Case
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Render field values with appropriate formatting
  const renderFieldValue = (value: any) => {
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground italic">No items</span>;
      }
      
      // Check if it's an array of objects
      if (typeof value[0] === "object" && value[0] !== null) {
        return (
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="bg-background p-3 rounded border">
                {renderExtractedFields(item)}
              </div>
            ))}
          </div>
        );
      }
      
      // Simple array
      return (
        <ul className="list-disc pl-5 space-y-1">
          {value.map((item, index) => (
            <li key={index} className="text-sm">{String(item)}</li>
          ))}
        </ul>
      );
    }
    
    // Handle objects
    if (value !== null && typeof value === "object") {
      return (
        <div className="bg-background p-3 rounded border">
          {renderExtractedFields(value)}
        </div>
      );
    }
    
    // Handle null/undefined
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Not specified</span>;
    }
    
    // Handle strings and other primitives
    return <div className="text-sm">{String(value)}</div>;
  };

  // Render HTML content
  const renderHtmlResult = (htmlContent: string) => {
    if (!htmlContent) return null;
    
    return (
      <div className="border rounded-lg p-4">
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    );
  };

  // Render table data with Excel export
  const renderTableResult = (tableData: any[]) => {
    if (!tableData || !Array.isArray(tableData) || tableData.length === 0) return null;
    
    // Assume first object's keys are column headers
    const headers = Object.keys(tableData[0]);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium flex items-center gap-2">
            <Table className="h-5 w-5" />
            Tabular Data
          </h3>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => downloadAsExcel(tableData, "table-data.xlsx")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header) => (
                  <th 
                    key={header} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((row, index) => (
                <tr key={index}>
                  {headers.map((header) => (
                    <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render document summarizer result with PDF/Word download options
  const renderDocumentSummaryResult = (data: any) => {
    if (!data) return null;
    
    // Check if we have a downloadable file
    const hasDownload = data.fileName && data.downloadUrl;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Summary
          </h3>
          {hasDownload && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = data.downloadUrl;
                  link.download = data.fileName.replace(/\.[^/.]+$/, ".pdf"); // Ensure PDF extension
                  link.click();
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = data.downloadUrl;
                  link.download = data.fileName.replace(/\.[^/.]+$/, ".docx"); // Ensure DOCX extension
                  link.click();
                }}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Word
              </Button>
            </div>
          )}
        </div>
        
        {data.summary ? (
          <div 
            className="prose max-w-none border rounded-lg p-4"
            dangerouslySetInnerHTML={{ __html: data.summary }}
          />
        ) : (
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-12 w-12 text-primary mr-4" />
              <div>
                <h4 className="font-semibold">Summary Ready</h4>
                <p className="text-muted-foreground">
                  Your document summary has been generated successfully.
                </p>
                {data.fileName && (
                  <p className="text-sm mt-1">
                    File: {data.fileName}
                    {data.fileSize && ` (${(data.fileSize / 1024).toFixed(1)} KB)`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render RFP creation result with proper download option
  const renderRfpResult = (data: any) => {
    if (!data) return null;
    
    // Extract the result data
    const resultData = data.result || data;
    
    // State for download functionality
    const [isDownloading, setIsDownloading] = React.useState(false);
    
    const handleDownload = async () => {
      setIsDownloading(true);
      try {
        // In a real implementation, this would trigger a download of the actual file
        // For now, we'll show an alert that the file would be downloaded
        alert("In a real implementation, this would download the generated RFP document. The file has been created on the server and can be accessed through the appropriate endpoint.");
      } catch (err) {
        console.error("Download error:", err);
      } finally {
        setIsDownloading(false);
      }
    };
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <div className="font-medium">
                {resultData.fileName || "Generated_RFP.docx"}
              </div>
              {resultData.fileSize && (
                <div className="text-sm text-muted-foreground">
                  {(resultData.fileSize / 1024).toFixed(1)} KB
                </div>
              )}
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </div>
        
        {resultData.message && (
          <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
            {resultData.message}
          </div>
        )}
        
        {resultData.processingTime && (
          <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
            Processing completed in {resultData.processingTime}ms
          </div>
        )}
        
        <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
          <p><strong>Note:</strong> The RFP document has been generated successfully. In a production environment, you would be able to download the file directly. For now, please contact support to retrieve your generated document.</p>
        </div>
      </div>
    );
  };

  // Render RFP summarizer result
  const renderRfpSummaryResult = (data: any) => {
    if (!data) return null;
    
    // Check if we have HTML content (primary format from RFP summarizer)
    if (data.result?.html) {
      return (
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            RFP Summary
          </h3>
          <div 
            className="prose max-w-none border rounded-lg p-4"
            dangerouslySetInnerHTML={{ __html: data.result.html }}
          />
        </div>
      );
    }
    
    // Fallback to structured data if HTML is not available
    if (data.executiveSummary || data.summary) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Executive Summary</h3>
            <div className="bg-muted p-4 rounded-md">
              <p>{data.executiveSummary || data.summary}</p>
            </div>
          </div>
          
          {data.keyRequirements && (
            <div>
              <h3 className="text-lg font-medium mb-3">Key Requirements</h3>
              <div className="bg-muted p-4 rounded-md">
                <ul className="list-disc pl-6 space-y-2">
                  {data.keyRequirements.map((req: string, index: number) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {data.timeline && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Timeline</h3>
                <div className="bg-muted p-4 rounded-md">
                  <div className="space-y-2">
                    <p><strong>Proposal Submission:</strong> {data.timeline.proposalSubmission}</p>
                    <p><strong>Evaluation Period:</strong> {data.timeline.evaluationPeriod}</p>
                    <p><strong>Project Kickoff:</strong> {data.timeline.projectKickoff}</p>
                    <p><strong>Delivery Deadline:</strong> {data.timeline.deliveryDeadline}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Budget</h3>
                <div className="bg-muted p-4 rounded-md">
                  <p><strong>Budget Range:</strong> {data.budgetRange}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Final fallback - render as JSON
    return renderJsonResult(data);
  };

  // Determine what type of result to render based on service and data
  const renderResult = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Processing your request...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      );
    }
    
    if (!result) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <FileText className="h-12 w-12 mb-4" />
          <p>Process a document to see results here</p>
        </div>
      );
    }
    
    // For RFP creator service
    if (serviceId === "rfp-creator") {
      return renderRfpResult(result.result || result);
    }
    
    // For RFP summarizer service
    if (serviceId === "rfp-summarizer") {
      return renderRfpSummaryResult(result.result || result);
    }
    
    // For document summarizer, render with PDF/Word download options
    if (serviceId === "document-summarizer") {
      return renderDocumentSummaryResult(result.result || result);
    }
    
    // For field extractor, render JSON with enhanced formatting
    if (serviceId === "field-extractor") {
      return renderJsonResult(result.result || result);
    }
    
    // For other services, try to determine format
    const data = result.result || result;
    
    // If it's a string and looks like HTML
    if (typeof data === "string" && data.startsWith("<")) {
      return renderHtmlResult(data);
    }
    
    // If it's an array, assume it's table data
    if (Array.isArray(data)) {
      return renderTableResult(data);
    }
    
    // Default to JSON rendering
    return renderJsonResult(data);
  };

  // Get status badge
  const getStatusBadge = () => {
    if (error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    if (isLoading) {
      return <Badge variant="secondary">Processing</Badge>;
    }
    if (result) {
      return <Badge variant="default">Completed</Badge>;
    }
    return <Badge variant="outline">Ready</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Results
        </CardTitle>
        {getStatusBadge()}
      </CardHeader>
      <CardContent>
        {renderResult()}
      </CardContent>
    </Card>
  );
}