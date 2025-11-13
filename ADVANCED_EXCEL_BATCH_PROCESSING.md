# Advanced Excel Features & Batch Processing Implementation

## Overview

This document describes the implementation of advanced Excel export capabilities with multiple sheets, professional styling, and batch document processing for the DoCapture platform.

## Features Implemented

### 1. Advanced Excel Export (ExcelJS Integration)

#### Key Features
- **Multiple Worksheets**: Export data across multiple organized sheets
- **Professional Styling**: 
  - Custom header colors (#0B74B0 - Honolulu Blue)
  - Alternating row colors for readability
  - Auto-fitted column widths (10-50 characters)
  - Professional fonts and borders
- **Auto-filtering**: Enabled on all data tables
- **Freeze Panes**: Headers frozen for scrolling
- **Metadata Sheets**: Additional sheets for extraction metadata
- **Smart Formatting**:
  - Automatic number formatting
  - Date formatting (yyyy-mm-dd)
  - Percentage formatting

#### Components

##### `advanced-excel-utils.ts`
Location: `docapture-ui/lib/advanced-excel-utils.ts`

**Key Functions:**

1. **`createAdvancedExcelWorkbook(sheets, options)`**
   - Creates multi-sheet workbooks with professional formatting
   - Parameters:
     - `sheets`: Array of sheet configurations
     - `options`: Workbook metadata (creator, title, company)
   - Returns: ExcelJS Workbook instance

2. **`createFieldExtractionExcel(extractionResult, metadata)`**
   - Specialized Excel creation for field extraction results
   - Creates two sheets:
     - "Extracted Data" - Main extraction results
     - "Metadata" - Template info, confidence scores, processing time
   - Auto-formats field names (camelCase → Title Case)

3. **`createBatchProcessingExcel(results)`**
   - Creates Excel from batch processing results
   - Generates summary sheet + individual result sheets
   - Shows success/error status for each file

4. **`downloadExcelWorkbook(workbook, filename)`**
   - Downloads workbook as .xlsx file
   - Proper MIME type handling

5. **`exportMultiSheetExcel(sheets, filename, options)`**
   - Convenient all-in-one export function

**Styling Constants:**
```typescript
EXCEL_STYLES = {
  header: { bold, white text, blue background, centered, borders }
  subHeader: { bold, gray background }
  data: { wrapped text, borders, left-aligned }
  alternateRow: { light gray background }
  number: { #,##0.00 format }
  date: { yyyy-mm-dd format }
  percentage: { 0.00% format }
}
```

### 2. Batch Document Processing

#### Key Features
- **Sequential Processing**: Process multiple documents one by one
- **Real-time Progress Tracking**: Visual progress bar with percentages
- **File Management**: Add/remove files before processing
- **Result Tracking**: Individual status for each file (success/error)
- **Excel Export**: Export all results to multi-sheet Excel
- **Processing Stats**: Success count, error count, processing time

#### Components

##### `useBatchProcessing` Hook
Location: `docapture-ui/hooks/useBatchProcessing.ts`

**Features:**
- State management for batch operations
- Progress tracking (current, total, percentage)
- Sequential file processing with AG-UI protocol
- Automatic Excel export generation
- Error handling per file

**API:**
```typescript
const {
  isProcessing,       // Boolean: Processing status
  results,            // Array: Individual file results
  progress,           // Object: Current progress state
  error,              // String: Global error message
  processFiles,       // Function: Start batch processing
  exportResults,      // Function: Export to Excel
  reset,              // Function: Clear state
  hasResults,         // Boolean: Any results available
  successCount,       // Number: Successful files
  errorCount          // Number: Failed files
} = useBatchProcessing(options);
```

##### `BatchProcessor` Component
Location: `docapture-ui/components/batch-processor.tsx`

**Features:**
- Drag & drop file selection (multiple files)
- File list with remove option
- Processing progress card
- Results display with status badges
- Excel export button
- Responsive design

**UI Elements:**
- File selection area
- Selected files scroll area (max 200px)
- Progress card (shown during processing)
- Results card with:
  - Success/Error badges
  - File names and sizes
  - Processing time per file
  - Status indicators (icons)

### 3. Enhanced Service Pages

#### Updates to `DynamicServicePage`
- **Tabs Interface**: Toggle between Single and Batch processing
- **Batch Tab**: Full batch processing UI
- **Seamless Integration**: Uses same service configuration

#### Updates to `DynamicResultViewer`
- **Advanced Excel Export**: Uses multi-sheet export for field extraction
- **Metadata Inclusion**: Template info exported to separate sheet
- **Professional Formatting**: All exports use styled workbooks

## Usage Examples

### 1. Basic Advanced Excel Export

```typescript
import { createAdvancedExcelWorkbook, downloadExcelWorkbook } from '@/lib/advanced-excel-utils';

// Create workbook with multiple sheets
const sheets = [
  {
    name: 'Extracted Data',
    data: extractedFields,
    title: 'Field Extraction Results',
    autoFilter: true,
    freezePane: { row: 2 }
  },
  {
    name: 'Metadata',
    data: metadataRows,
    columns: [
      { header: 'Property', key: 'Property', width: 25 },
      { header: 'Value', key: 'Value', width: 40 }
    ]
  }
];

const workbook = await createAdvancedExcelWorkbook(sheets, {
  creator: 'DoCapture Pro',
  title: 'Processing Results',
  company: 'CognitBotz Solutions'
});

await downloadExcelWorkbook(workbook, 'results.xlsx');
```

### 2. Field Extraction with Excel Export

```typescript
import { createFieldExtractionExcel, downloadExcelWorkbook } from '@/lib/advanced-excel-utils';

const extractionResult = {
  extracted: { /* field data */ },
  templateId: 'template_123',
  confidence: 85,
  usedTemplate: true,
  processingTime: 1234
};

const workbook = await createFieldExtractionExcel(
  extractionResult,
  { serviceId: 'field-extractor', processedAt: new Date().toISOString() }
);

await downloadExcelWorkbook(workbook, 'field-extraction.xlsx');
```

### 3. Batch Processing

```typescript
import { useBatchProcessing } from '@/hooks/useBatchProcessing';

const MyComponent = () => {
  const {
    isProcessing,
    results,
    progress,
    processFiles,
    exportResults
  } = useBatchProcessing({
    onProgress: (progress) => {
      console.log(`Processing ${progress.current}/${progress.total}`);
    },
    onComplete: (results) => {
      console.log('Batch completed:', results);
    }
  });

  const handleProcess = async (files: File[]) => {
    await processFiles(files, 'field-extractor', {
      requiredFields: ['title', 'date', 'amount']
    });
  };

  const handleExport = async () => {
    await exportResults('batch-results.xlsx');
  };

  return (
    <div>
      {/* UI components */}
    </div>
  );
};
```

### 4. Using BatchProcessor Component

```tsx
import { BatchProcessor } from '@/components/batch-processor';
import type { ServiceInfo } from '@/lib/api';

const service: ServiceInfo = {
  id: 'field-extractor',
  name: 'Field Extractor',
  supportedFileTypes: ['.pdf', '.docx', '.jpg'],
  supportedFormats: ['excel']
  // ... other properties
};

<BatchProcessor service={service} />
```

## Technical Details

### Excel Workbook Structure

#### Field Extraction Export
```
Workbook
├── Extracted Data (Sheet)
│   ├── Title Row (merged, large font, colored)
│   ├── Header Row (frozen, blue background, white text)
│   └── Data Rows (alternating colors, auto-fit columns)
└── Metadata (Sheet)
    ├── Template ID
    ├── Confidence Score
    ├── Processing Time
    └── Custom Metadata
```

#### Batch Processing Export
```
Workbook
├── Summary (Sheet)
│   ├── File Index
│   ├── File Name
│   ├── Status (SUCCESS/ERROR)
│   ├── Error Message (if applicable)
│   └── Processed At
├── Result 1 (Sheet)
│   └── Individual file results
├── Result 2 (Sheet)
│   └── Individual file results
└── ... (one sheet per successful file)
```

### Column Width Calculation
- Minimum: 10 characters
- Maximum: 50 characters
- Algorithm: 
  1. Check header length
  2. Sample first 100 data rows
  3. Find maximum content length
  4. Apply 1.2x padding
  5. Constrain to min/max

### Batch Processing Flow
```
1. User selects files
2. Files displayed in scroll area
3. User clicks "Start Batch Processing"
4. For each file:
   a. Update status to "processing"
   b. Call AG-UI agent
   c. Wait for response
   d. Update status to "success" or "error"
   e. Update progress bar
5. All files processed
6. Enable "Export to Excel" button
7. User downloads multi-sheet Excel with all results
```

## Performance Considerations

1. **Column Width Sampling**: Only checks first 100 rows to avoid performance issues
2. **Sequential Processing**: Batch processing is sequential to avoid overwhelming the server
3. **Memory Management**: Large files are processed one at a time
4. **Excel Generation**: Async operations with proper await handling

## Browser Compatibility

- **Modern Browsers**: Full support (Chrome, Firefox, Edge, Safari)
- **Excel Format**: .xlsx (Excel 2007+)
- **File Download**: Uses Blob API and createObjectURL
- **Memory**: Suitable for files up to 10MB each

## Future Enhancements

1. **Parallel Processing**: Option for parallel file processing (configurable)
2. **Custom Styling**: User-defined color schemes
3. **Advanced Filtering**: Excel pivot tables and charts
4. **Template Library**: Pre-built Excel templates
5. **Cloud Export**: Direct export to cloud storage (Google Drive, OneDrive)
6. **Email Integration**: Email results directly from the app
7. **Progress Persistence**: Resume interrupted batch jobs
8. **Retry Logic**: Automatic retry for failed files

## Installation

### Required Dependencies

```bash
npm install exceljs
# or
bun add exceljs
```

Already included in `package.json`:
```json
{
  "dependencies": {
    "exceljs": "^4.4.0"
  }
}
```

## Testing Recommendations

1. **Single File Export**: Test with various data structures
2. **Multi-Sheet Export**: Verify sheet naming and data integrity
3. **Batch Processing**: Test with 1, 5, 10, and 20 files
4. **Large Files**: Test with files up to 10MB
5. **Error Handling**: Test with invalid files
6. **Excel Compatibility**: Open exported files in Microsoft Excel, Google Sheets, LibreOffice

## Troubleshooting

### Common Issues

1. **Export fails with large datasets**
   - Solution: Limit data rows or split into multiple sheets

2. **Column widths not optimal**
   - Solution: Manually specify column widths in sheet config

3. **Batch processing stalls**
   - Solution: Check network connection and server availability

4. **Excel file won't open**
   - Solution: Verify ExcelJS version and MIME type

## Conclusion

The advanced Excel features and batch processing capabilities significantly enhance DoCapture's document processing workflow, providing:
- Professional, multi-sheet Excel exports
- Efficient batch processing for multiple documents
- Real-time progress tracking
- Comprehensive error handling
- User-friendly interface

All implementations follow the project's specification of Excel-only output format and maintain consistency with the AG-UI protocol integration.
