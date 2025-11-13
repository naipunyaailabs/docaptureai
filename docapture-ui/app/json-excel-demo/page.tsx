"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  createFieldExtractionExcel, 
  downloadExcelWorkbook 
} from '@/lib/advanced-excel-utils';
import { Download, FileSpreadsheet, CheckCircle2, Code, Table } from 'lucide-react';

export default function JsonExcelDemoPage() {
  const [status, setStatus] = useState<string>('');

  // Example 1: Simple invoice
  const simpleInvoice = {
    extracted: {
      invoiceNumber: "INV-2025-001",
      invoiceDate: "2025-01-15",
      customerName: "John Smith",
      customerEmail: "john.smith@example.com",
      totalAmount: 15750.50,
      taxAmount: 1575.05,
      isPaid: false,
      paymentTerms: "Net 30 days",
      notes: "Please include PO number on payment"
    },
    templateId: 'invoice_simple_v1',
    confidence: 95,
    usedTemplate: true,
    processingTime: 1234
  };

  // Example 2: Complex invoice with line items
  const complexInvoice = {
    extracted: {
      invoiceNumber: "INV-2025-002",
      invoiceDate: "2025-01-16",
      dueDate: "2025-02-15",
      customer: {
        name: "Acme Corporation",
        email: "billing@acme.com",
        phone: "+1-555-0123",
        address: {
          street: "123 Business Ave",
          city: "New York",
          state: "NY",
          zip: "10001"
        }
      },
      vendor: {
        name: "DoCapture Services",
        taxId: "12-3456789"
      },
      lineItems: [
        { 
          description: "Software License - Annual", 
          quantity: 1, 
          unitPrice: 10000,
          total: 10000
        },
        { 
          description: "Support Services - Monthly", 
          quantity: 12, 
          unitPrice: 500,
          total: 6000
        },
        { 
          description: "Training Package", 
          quantity: 2, 
          unitPrice: 1500,
          total: 3000
        }
      ],
      subtotal: 19000,
      taxRate: 0.08,
      taxAmount: 1520,
      totalAmount: 20520,
      isPaid: false,
      paymentMethod: "Bank Transfer",
      tags: ["Priority", "Corporate", "Recurring"]
    },
    templateId: 'invoice_complex_v2',
    confidence: 92,
    usedTemplate: true,
    processingTime: 2847
  };

  // Example 3: RFP with nested structure
  const rfpDocument = {
    extracted: {
      rfpTitle: "Software Development Services RFP",
      rfpNumber: "RFP-2025-IT-001",
      issueDate: "2025-01-10",
      submissionDeadline: "2025-02-10",
      organization: {
        name: "City Government",
        department: "IT Department",
        contact: {
          name: "Jane Doe",
          title: "IT Director",
          email: "jane.doe@city.gov",
          phone: "+1-555-0199"
        }
      },
      projectScope: "Development of citizen portal",
      estimatedBudget: 500000,
      projectDuration: "12 months",
      requirements: [
        { id: "REQ-001", category: "Technical", description: "Must support 10,000 concurrent users" },
        { id: "REQ-002", category: "Security", description: "HIPAA compliance required" },
        { id: "REQ-003", category: "Performance", description: "99.9% uptime guarantee" },
        { id: "REQ-004", category: "Integration", description: "API integration with existing systems" }
      ],
      evaluationCriteria: [
        { criterion: "Technical Approach", weight: 40 },
        { criterion: "Experience", weight: 30 },
        { criterion: "Cost", weight: 20 },
        { criterion: "Timeline", weight: 10 }
      ],
      milestones: [
        { phase: "Design", duration: "2 months", deliverable: "UI/UX mockups" },
        { phase: "Development", duration: "6 months", deliverable: "Working prototype" },
        { phase: "Testing", duration: "2 months", deliverable: "QA report" },
        { phase: "Deployment", duration: "2 months", deliverable: "Production system" }
      ],
      isActive: true
    },
    templateId: 'rfp_template_v3',
    confidence: 88,
    usedTemplate: true,
    processingTime: 3456
  };

  const handleExport = async (data: any, filename: string, exampleName: string) => {
    setStatus(`Generating ${exampleName}...`);
    
    try {
      const workbook = await createFieldExtractionExcel(data, {
        serviceId: 'field-extractor-demo',
        processedAt: new Date().toISOString(),
        exampleName: exampleName
      });
      
      await downloadExcelWorkbook(workbook, filename);
      setStatus(`✓ ${exampleName} exported successfully!`);
    } catch (error) {
      setStatus(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Smart JSON to Excel Conversion</h1>
        <p className="text-muted-foreground text-lg">
          See how complex nested JSON is intelligently transformed into organized Excel workbooks
        </p>
      </div>

      <Tabs defaultValue="simple" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="complex">Complex</TabsTrigger>
          <TabsTrigger value="nested">Deeply Nested</TabsTrigger>
        </TabsList>

        {/* Simple Invoice Example */}
        <TabsContent value="simple" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Example 1: Simple Invoice
              </CardTitle>
              <CardDescription>
                Basic invoice with simple key-value pairs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* JSON Input */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="outline">Input JSON</Badge>
                  </h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
{JSON.stringify(simpleInvoice.extracted, null, 2)}
                  </pre>
                </div>

                {/* Excel Output Preview */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="default">Excel Output (2 Sheets)</Badge>
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-medium mb-2">Sheet 1: Summary</p>
                      <div className="text-xs space-y-1">
                        <div className="grid grid-cols-2 gap-2 border-b pb-1">
                          <span className="font-semibold">Field</span>
                          <span className="font-semibold">Value</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2"><span>Invoice Number</span><span>INV-2025-001</span></div>
                        <div className="grid grid-cols-2 gap-2"><span>Invoice Date</span><span>2025-01-15</span></div>
                        <div className="grid grid-cols-2 gap-2"><span>Customer Name</span><span>John Smith</span></div>
                        <div className="grid grid-cols-2 gap-2"><span>Total Amount</span><span>15,750.50</span></div>
                        <div className="grid grid-cols-2 gap-2"><span>Is Paid</span><span>No</span></div>
                        <div className="text-muted-foreground">... 4 more fields</div>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-medium mb-2">Sheet 2: Metadata</p>
                      <div className="text-xs space-y-1">
                        <div className="grid grid-cols-2 gap-2"><span>Template ID</span><span>invoice_simple_v1</span></div>
                        <div className="grid grid-cols-2 gap-2"><span>Confidence</span><span>95%</span></div>
                        <div className="grid grid-cols-2 gap-2"><span>Processing Time</span><span>1234ms</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => handleExport(simpleInvoice, 'simple-invoice.xlsx', 'Simple Invoice')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Simple Invoice Excel
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complex Invoice Example */}
        <TabsContent value="complex" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Example 2: Complex Invoice with Arrays
              </CardTitle>
              <CardDescription>
                Invoice with nested objects and line items array
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* JSON Input */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="outline">Input JSON</Badge>
                  </h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
{JSON.stringify(complexInvoice.extracted, null, 2)}
                  </pre>
                </div>

                {/* Excel Output Preview */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="default">Excel Output (3 Sheets)</Badge>
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-medium mb-2">Sheet 1: Summary</p>
                      <div className="text-xs space-y-1">
                        <div className="grid grid-cols-3 gap-2 border-b pb-1">
                          <span className="font-semibold">Field</span>
                          <span className="font-semibold">Value</span>
                          <span className="font-semibold">Type</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2"><span>Invoice Number</span><span>INV-2025-002</span><span>Text</span></div>
                        <div className="grid grid-cols-3 gap-2"><span>Customer.Name</span><span>Acme Corp</span><span>Text</span></div>
                        <div className="grid grid-cols-3 gap-2"><span>Line Items</span><span>3 items</span><span>→ Sheet</span></div>
                        <div className="grid grid-cols-3 gap-2"><span>Total Amount</span><span>20,520.00</span><span>Number</span></div>
                        <div className="text-muted-foreground">... 15 more fields</div>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-medium mb-2">Sheet 2: Line Items</p>
                      <div className="text-xs">
                        <div className="grid grid-cols-4 gap-1 border-b pb-1 font-semibold">
                          <span>Description</span>
                          <span>Qty</span>
                          <span>Price</span>
                          <span>Total</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          <span className="truncate">Software License</span>
                          <span>1</span>
                          <span>10,000</span>
                          <span>10,000</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          <span className="truncate">Support Services</span>
                          <span>12</span>
                          <span>500</span>
                          <span>6,000</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          <span className="truncate">Training Package</span>
                          <span>2</span>
                          <span>1,500</span>
                          <span>3,000</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-medium mb-2">Sheet 3: Metadata</p>
                      <div className="text-xs space-y-1">
                        <div className="grid grid-cols-2 gap-2"><span>Confidence</span><span>92%</span></div>
                        <div className="grid grid-cols-2 gap-2"><span>Total Sheets</span><span>3</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => handleExport(complexInvoice, 'complex-invoice.xlsx', 'Complex Invoice')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Complex Invoice Excel
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RFP Example */}
        <TabsContent value="nested" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Example 3: Deeply Nested RFP Document
              </CardTitle>
              <CardDescription>
                Complex RFP with multiple nested arrays and objects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* JSON Input */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="outline">Input JSON</Badge>
                  </h4>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
{JSON.stringify(rfpDocument.extracted, null, 2)}
                  </pre>
                </div>

                {/* Excel Output Preview */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="default">Excel Output (6 Sheets)</Badge>
                  </h4>
                  
                  <div className="space-y-3 max-h-96 overflow-auto">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="font-medium mb-1 text-sm">Sheet 1: Summary</p>
                      <p className="text-xs text-muted-foreground">Basic RFP info + references to other sheets</p>
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <p className="font-medium mb-1 text-sm">Sheet 2: Requirements</p>
                      <p className="text-xs text-muted-foreground">4 requirements with ID, category, description</p>
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <p className="font-medium mb-1 text-sm">Sheet 3: Evaluation Criteria</p>
                      <p className="text-xs text-muted-foreground">Criteria with weights (Technical 40%, Experience 30%...)</p>
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <p className="font-medium mb-1 text-sm">Sheet 4: Milestones</p>
                      <p className="text-xs text-muted-foreground">Project phases, durations, deliverables</p>
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <p className="font-medium mb-1 text-sm">Sheet 5: Organization Details</p>
                      <p className="text-xs text-muted-foreground">Organization info with contact details</p>
                    </div>

                    <div className="bg-muted p-3 rounded-lg">
                      <p className="font-medium mb-1 text-sm">Sheet 6: Metadata</p>
                      <p className="text-xs text-muted-foreground">Processing information and statistics</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => handleExport(rfpDocument, 'rfp-document.xlsx', 'RFP Document')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download RFP Excel (6 Sheets)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Display */}
      {status && (
        <Card className={status.startsWith('✓') ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {status.startsWith('✓') ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              )}
              <span className={`font-medium ${status.startsWith('✓') ? 'text-green-700' : 'text-blue-700'}`}>
                {status}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Smart Conversion Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">🎯 Organized Structure</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Main fields in Summary sheet</li>
                <li>• Arrays get dedicated sheets</li>
                <li>• Clear visual hierarchy</li>
                <li>• Easy to navigate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📊 Smart Formatting</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Numbers with commas</li>
                <li>• Dates in ISO format</li>
                <li>• Booleans as Yes/No</li>
                <li>• Auto-fitted columns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">✨ Professional Output</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Styled headers (blue)</li>
                <li>• Alternating row colors</li>
                <li>• Auto-filter enabled</li>
                <li>• Frozen headers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
