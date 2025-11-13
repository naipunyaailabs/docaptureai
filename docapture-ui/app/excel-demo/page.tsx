"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  createAdvancedExcelWorkbook, 
  downloadExcelWorkbook, 
  createFieldExtractionExcel,
  exportMultiSheetExcel,
  SheetConfig 
} from '@/lib/advanced-excel-utils';
import { Download, FileSpreadsheet, Layers, CheckCircle } from 'lucide-react';

export default function ExcelDemoPage() {
  const [status, setStatus] = useState<string>('');

  // Demo: Basic multi-sheet export
  const handleBasicExport = async () => {
    setStatus('Generating basic multi-sheet workbook...');
    
    const sheets: SheetConfig[] = [
      {
        name: 'Sales Data',
        data: [
          { Month: 'January', Revenue: 50000, Expenses: 30000, Profit: 20000 },
          { Month: 'February', Revenue: 55000, Expenses: 32000, Profit: 23000 },
          { Month: 'March', Revenue: 60000, Expenses: 35000, Profit: 25000 },
          { Month: 'April', Revenue: 65000, Expenses: 37000, Profit: 28000 },
          { Month: 'May', Revenue: 70000, Expenses: 40000, Profit: 30000 }
        ],
        title: 'Monthly Sales Report',
        autoFilter: true,
        freezePane: { row: 2 }
      },
      {
        name: 'Summary',
        data: [
          { Metric: 'Total Revenue', Value: 300000 },
          { Metric: 'Total Expenses', Value: 174000 },
          { Metric: 'Total Profit', Value: 126000 },
          { Metric: 'Average Monthly Profit', Value: 25200 }
        ],
        columns: [
          { header: 'Metric', key: 'Metric', width: 30 },
          { header: 'Value', key: 'Value', width: 20 }
        ]
      }
    ];

    const workbook = await createAdvancedExcelWorkbook(sheets, {
      creator: 'DoCapture Pro',
      title: 'Sales Analysis Report',
      subject: 'Monthly Sales Data',
      company: 'CognitBotz Solutions'
    });

    await downloadExcelWorkbook(workbook, 'sales-report-demo.xlsx');
    setStatus('✓ Basic export completed!');
  };

  // Demo: Field extraction export
  const handleFieldExtractionExport = async () => {
    setStatus('Generating field extraction workbook...');
    
    const extractionResult = {
      extracted: {
        companyName: 'Acme Corporation',
        invoiceNumber: 'INV-2025-001',
        invoiceDate: '2025-01-15',
        totalAmount: 15750.00,
        customerName: 'John Smith',
        items: [
          'Software License - $10,000',
          'Support Services - $5,000',
          'Training - $750'
        ],
        paymentTerms: 'Net 30 days',
        status: 'Pending'
      },
      templateId: 'invoice_template_v2',
      usedTemplate: true,
      confidence: 92,
      processingTime: 1847
    };

    const workbook = await createFieldExtractionExcel(
      extractionResult,
      {
        serviceId: 'field-extractor',
        processedAt: new Date().toISOString(),
        documentType: 'Invoice'
      }
    );

    await downloadExcelWorkbook(workbook, 'field-extraction-demo.xlsx');
    setStatus('✓ Field extraction export completed!');
  };

  // Demo: Complex multi-sheet with styling
  const handleAdvancedExport = async () => {
    setStatus('Generating advanced styled workbook...');
    
    const sheets: SheetConfig[] = [
      {
        name: 'Employee Data',
        data: Array.from({ length: 20 }, (_, i) => ({
          ID: `EMP-${String(i + 1).padStart(3, '0')}`,
          Name: `Employee ${i + 1}`,
          Department: ['Sales', 'Marketing', 'Engineering', 'HR'][i % 4],
          Salary: 50000 + (i * 2000),
          JoinDate: new Date(2020 + (i % 5), (i % 12), 1).toISOString().split('T')[0],
          Performance: (80 + (i % 20)) + '%'
        })),
        title: 'Employee Database - Q1 2025',
        autoFilter: true,
        freezePane: { row: 2 }
      },
      {
        name: 'Department Summary',
        data: [
          { Department: 'Sales', Employees: 5, 'Avg Salary': 58000, Budget: 290000 },
          { Department: 'Marketing', Employees: 5, 'Avg Salary': 56000, Budget: 280000 },
          { Department: 'Engineering', Employees: 5, 'Avg Salary': 62000, Budget: 310000 },
          { Department: 'HR', Employees: 5, 'Avg Salary: 54000, Budget': 270000 }
        ],
        title: 'Department-wise Analysis'
      },
      {
        name: 'Metrics',
        data: [
          { Metric: 'Total Employees', Value: '20' },
          { Metric: 'Total Payroll', Value: '$1,150,000' },
          { Metric: 'Average Salary', Value: '$57,500' },
          { Metric: 'Departments', Value: '4' }
        ],
        columns: [
          { header: 'Metric', key: 'Metric', width: 25 },
          { header: 'Value', key: 'Value', width: 20 }
        ]
      }
    ];

    await exportMultiSheetExcel(sheets, 'employee-analysis-demo.xlsx', {
      creator: 'HR Department',
      title: 'Employee Analysis Report',
      subject: 'Quarterly HR Analytics',
    });

    setStatus('✓ Advanced export completed!');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Excel Features Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of advanced Excel export capabilities with ExcelJS
        </p>
      </div>

      <Tabs defaultValue="demos" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="demos">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Demo Exports
          </TabsTrigger>
          <TabsTrigger value="features">
            <Layers className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demos" className="space-y-6">
          {/* Basic Multi-Sheet Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Basic Multi-Sheet Export
              </CardTitle>
              <CardDescription>
                Simple example with sales data across two sheets with professional styling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Sheets:</strong> Sales Data, Summary
                </div>
                <div>
                  <strong>Features:</strong> Auto-filter, Freeze panes, Styling
                </div>
              </div>
              <Button onClick={handleBasicExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generate Basic Report
              </Button>
            </CardContent>
          </Card>

          {/* Field Extraction Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Field Extraction Export
              </CardTitle>
              <CardDescription>
                Document field extraction results with metadata sheet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Sheets:</strong> Extracted Data, Metadata
                </div>
                <div>
                  <strong>Data:</strong> Invoice extraction example
                </div>
              </div>
              <Button onClick={handleFieldExtractionExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generate Extraction Report
              </Button>
            </CardContent>
          </Card>

          {/* Advanced Multi-Sheet Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Advanced Multi-Sheet Export
              </CardTitle>
              <CardDescription>
                Complex workbook with employee data, department analysis, and metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Sheets:</strong> Employee Data, Department Summary, Metrics
                </div>
                <div>
                  <strong>Rows:</strong> 20+ employees with full styling
                </div>
              </div>
              <Button onClick={handleAdvancedExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generate Advanced Report
              </Button>
            </CardContent>
          </Card>

          {/* Status Display */}
          {status && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">{status}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Excel Features</CardTitle>
              <CardDescription>
                Professional Excel exports powered by ExcelJS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Badge>Styling</Badge>
                  </h4>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Custom header colors (Honolulu Blue #0B74B0)</li>
                    <li>Alternating row backgrounds</li>
                    <li>Professional fonts and borders</li>
                    <li>Cell alignment and wrapping</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Badge>Auto-Formatting</Badge>
                  </h4>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Numbers: #,##0.00</li>
                    <li>Dates: yyyy-mm-dd</li>
                    <li>Percentages: 0.00%</li>
                    <li>Auto-fit column widths (10-50 chars)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Badge>Features</Badge>
                  </h4>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Multiple worksheets</li>
                    <li>Auto-filtering enabled</li>
                    <li>Freeze panes (headers)</li>
                    <li>Title rows with merged cells</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Badge>Metadata</Badge>
                  </h4>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Document properties (creator, title)</li>
                    <li>Company information</li>
                    <li>Creation timestamps</li>
                    <li>Subject and description</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Batch Processing</CardTitle>
              <CardDescription>
                Process multiple documents and export consolidated results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Badge>Processing</Badge>
                  </h4>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Sequential file processing</li>
                    <li>Real-time progress tracking</li>
                    <li>Individual file status</li>
                    <li>Error handling per file</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Badge>Export</Badge>
                  </h4>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Summary sheet with all files</li>
                    <li>Individual result sheets</li>
                    <li>Success/error statistics</li>
                    <li>Processing time per file</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
