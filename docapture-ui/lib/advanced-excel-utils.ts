// lib/advanced-excel-utils.ts
// Advanced Excel utilities with ExcelJS for multiple sheets, styling, and batch processing

import ExcelJS from 'exceljs';

/**
 * Excel style configurations
 */
export const EXCEL_STYLES = {
  header: {
    font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF0B74B0' } },
    alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
    border: {
      top: { style: 'thin' as const },
      left: { style: 'thin' as const },
      bottom: { style: 'thin' as const },
      right: { style: 'thin' as const }
    }
  },
  subHeader: {
    font: { bold: true, size: 11, color: { argb: 'FF000000' } },
    fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE0E0E0' } },
    alignment: { horizontal: 'left' as const, vertical: 'middle' as const }
  },
  data: {
    font: { size: 10 },
    alignment: { horizontal: 'left' as const, vertical: 'top' as const, wrapText: true },
    border: {
      top: { style: 'thin' as const, color: { argb: 'FFD0D0D0' } },
      left: { style: 'thin' as const, color: { argb: 'FFD0D0D0' } },
      bottom: { style: 'thin' as const, color: { argb: 'FFD0D0D0' } },
      right: { style: 'thin' as const, color: { argb: 'FFD0D0D0' } }
    }
  },
  alternateRow: {
    fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFF8F8F8' } }
  },
  number: {
    numFmt: '#,##0.00'
  },
  date: {
    numFmt: 'yyyy-mm-dd'
  },
  percentage: {
    numFmt: '0.00%'
  }
};

/**
 * Interface for sheet configuration
 */
export interface SheetConfig {
  name: string;
  data: any[];
  columns?: Array<{
    header: string;
    key: string;
    width?: number;
    style?: any;
  }>;
  autoFilter?: boolean;
  freezePane?: { row?: number; column?: number };
  title?: string;
}

/**
 * Interface for batch processing configuration
 */
export interface BatchProcessConfig {
  files: File[];
  serviceId: string;
  options?: Record<string, any>;
  onProgress?: (current: number, total: number, fileName: string) => void;
  onComplete?: (results: any[]) => void;
  onError?: (error: string, fileName: string) => void;
}

/**
 * Create an advanced Excel workbook with multiple sheets and styling
 */
export async function createAdvancedExcelWorkbook(
  sheets: SheetConfig[],
  workbookOptions?: {
    creator?: string;
    title?: string;
    subject?: string;
    company?: string;
  }
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  
  // Set workbook properties
  workbook.creator = workbookOptions?.creator || 'DoCapture Pro';
  workbook.lastModifiedBy = workbookOptions?.creator || 'DoCapture Pro';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Create each sheet
  for (const sheetConfig of sheets) {
    await createStyledSheet(workbook, sheetConfig);
  }

  return workbook;
}

/**
 * Create a styled worksheet in the workbook
 */
async function createStyledSheet(
  workbook: ExcelJS.Workbook,
  config: SheetConfig
): Promise<ExcelJS.Worksheet> {
  const worksheet = workbook.addWorksheet(config.name, {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    }
  });

  // Add title if provided
  if (config.title) {
    worksheet.mergeCells('A1', `${String.fromCharCode(65 + (config.columns?.length || 1) - 1)}1`);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = config.title;
    titleCell.font = { bold: true, size: 16, color: { argb: 'FF0B74B0' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
    worksheet.getRow(1).height = 30;
  }

  const headerRowIndex = config.title ? 2 : 1;

  // Define columns
  if (config.columns && config.columns.length > 0) {
    worksheet.columns = config.columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || calculateColumnWidth(col.header, config.data, col.key)
    }));
  } else if (config.data.length > 0) {
    // Auto-generate columns from first data row
    const firstRow = config.data[0];
    const columns = Object.keys(firstRow).map(key => ({
      header: formatFieldName(key),
      key: key,
      width: calculateColumnWidth(formatFieldName(key), config.data, key)
    }));
    worksheet.columns = columns;
  }

  // Style header row
  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.eachCell((cell) => {
    cell.font = EXCEL_STYLES.header.font;
    cell.fill = EXCEL_STYLES.header.fill;
    cell.alignment = EXCEL_STYLES.header.alignment;
    cell.border = EXCEL_STYLES.header.border;
  });
  headerRow.height = 25;

  // Add data rows with styling
  config.data.forEach((row, index) => {
    const excelRow = worksheet.addRow(row);
    
    // Apply alternating row colors
    if (index % 2 === 1) {
      excelRow.eachCell((cell) => {
        cell.fill = EXCEL_STYLES.alternateRow.fill;
      });
    }
    
    // Apply data styling to all cells
    excelRow.eachCell((cell) => {
      cell.border = EXCEL_STYLES.data.border;
      cell.alignment = EXCEL_STYLES.data.alignment;
      
      // Auto-format based on value type
      if (typeof cell.value === 'number') {
        cell.numFmt = EXCEL_STYLES.number.numFmt;
      } else if (cell.value instanceof Date) {
        cell.numFmt = EXCEL_STYLES.date.numFmt;
      }
    });
  });

  // Add auto filter
  if (config.autoFilter !== false && config.data.length > 0) {
    worksheet.autoFilter = {
      from: { row: headerRowIndex, column: 1 },
      to: { row: headerRowIndex, column: worksheet.columnCount }
    };
  }

  // Freeze panes
  if (config.freezePane) {
    worksheet.views = [{
      state: 'frozen',
      xSplit: config.freezePane.column || 0,
      ySplit: config.freezePane.row || headerRowIndex
    }];
  }

  return worksheet;
}

/**
 * Calculate optimal column width based on content
 */
function calculateColumnWidth(header: string, data: any[], key: string): number {
  const minWidth = 10;
  const maxWidth = 50;
  
  // Start with header length
  let maxLength = header.length;
  
  // Check first 100 rows for max content length
  const sampleSize = Math.min(100, data.length);
  for (let i = 0; i < sampleSize; i++) {
    const value = data[i][key];
    if (value !== null && value !== undefined) {
      const stringValue = String(value);
      maxLength = Math.max(maxLength, stringValue.length);
    }
  }
  
  // Add padding and apply constraints
  const calculatedWidth = Math.min(Math.max(maxLength * 1.2, minWidth), maxWidth);
  return calculatedWidth;
}

/**
 * Format field names to Title Case
 */
function formatFieldName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Download Excel workbook as a file
 */
export async function downloadExcelWorkbook(
  workbook: ExcelJS.Workbook,
  filename: string = 'export.xlsx'
): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create Excel from field extraction results with intelligent multi-sheet handling
 */
export async function createFieldExtractionExcel(
  extractionResult: any,
  metadata?: Record<string, any>
): Promise<ExcelJS.Workbook> {
  const sheets: SheetConfig[] = [];

  // Get the extracted data
  const extractedData = extractionResult.extracted || extractionResult;
  
  // Separate simple fields from complex nested arrays
  const { simpleFields, arrayFields } = separateFieldTypes(extractedData);
  
  // Main data sheet with simple fields
  const mainRows = Object.entries(simpleFields).map(([key, value]) => ({
    Field: formatFieldName(key),
    Value: formatValue(value),
    'Data Type': getDataType(value)
  }));
  
  // Add references to array sheets
  Object.entries(arrayFields).forEach(([key, value]) => {
    mainRows.push({
      Field: formatFieldName(key),
      Value: Array.isArray(value) ? `${value.length} items` : 'See separate sheet',
      'Data Type': `Array/Table → Sheet: "${formatFieldName(key)}"`
    });
  });
  
  sheets.push({
    name: 'Summary',
    data: mainRows,
    title: 'Document Field Extraction Results',
    autoFilter: true,
    freezePane: { row: 2 },
    columns: [
      { header: 'Field', key: 'Field', width: 30 },
      { header: 'Value', key: 'Value', width: 50 },
      { header: 'Data Type', key: 'Data Type', width: 25 }
    ]
  });
  
  // Create separate sheets for array fields
  Object.entries(arrayFields).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      const arrayData = typeof value[0] === 'object'
        ? value.map(item => flattenObject(item))
        : value.map((item, idx) => ({ '#': idx + 1, 'Value': formatValue(item) }));
      
      sheets.push({
        name: sanitizeSheetName(formatFieldName(key)),
        data: arrayData,
        title: `${formatFieldName(key)} Details`,
        autoFilter: true,
        freezePane: { row: 2 }
      });
    }
  });

  // Metadata sheet if available
  if (metadata || extractionResult.templateId) {
    const metadataRows = [
      { Property: 'Template ID', Value: extractionResult.templateId || 'N/A' },
      { Property: 'Template Used', Value: extractionResult.usedTemplate ? 'Yes' : 'No' },
      { Property: 'Confidence Score', Value: extractionResult.confidence ? `${extractionResult.confidence}%` : 'N/A' },
      { Property: 'Processing Time', Value: `${extractionResult.processingTime || 0}ms` },
      { Property: 'Extraction Date', Value: new Date().toLocaleString() },
      { Property: 'Total Sheets', Value: String(sheets.length + 1) }
    ];

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        metadataRows.push({ Property: formatFieldName(key), Value: String(value) });
      });
    }

    sheets.push({
      name: 'Metadata',
      data: metadataRows,
      title: 'Extraction Metadata',
      columns: [
        { header: 'Property', key: 'Property', width: 25 },
        { header: 'Value', key: 'Value', width: 40 }
      ]
    });
  }

  return createAdvancedExcelWorkbook(sheets, {
    title: 'Field Extraction Results',
    subject: 'Document Processing',
    creator: 'DoCapture Pro - Smart Excel Export'
  });
}

/**
 * Get human-readable data type
 */
function getDataType(value: any): string {
  if (value === null || value === undefined) return 'Empty';
  if (typeof value === 'boolean') return 'Yes/No';
  if (typeof value === 'number') return 'Number';
  if (value instanceof Date) return 'Date';
  if (Array.isArray(value)) return `Array (${value.length} items)`;
  if (typeof value === 'object') return `Object (${Object.keys(value).length} fields)`;
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'Date String';
    if (/^[\d,]+$/.test(value)) return 'Number String';
    if (value.length > 100) return 'Long Text';
    return 'Text';
  }
  return 'Unknown';
}

/**
 * Smart conversion of object to Excel rows with intelligent handling of nested structures
 */
function convertObjectToRows(obj: any): any[] {
  if (Array.isArray(obj)) {
    // If it's an array of objects, return as table
    if (obj.length > 0 && typeof obj[0] === 'object') {
      return obj.map(item => flattenObject(item));
    }
    // If it's an array of primitives, create enumerated list
    return obj.map((item, idx) => ({
      '#': idx + 1,
      'Value': formatValue(item)
    }));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    // Check if object has nested arrays that should be separate sheets
    const { simpleFields, arrayFields } = separateFieldTypes(obj);
    
    // Create rows for simple fields
    const rows = Object.entries(simpleFields).map(([key, value]) => ({
      Field: formatFieldName(key),
      Value: formatValue(value)
    }));
    
    // Add array fields with their count
    Object.entries(arrayFields).forEach(([key, value]) => {
      rows.push({
        Field: formatFieldName(key),
        Value: Array.isArray(value) ? `${value.length} items (see separate sheet)` : formatValue(value)
      });
    });
    
    return rows;
  }
  
  return [{ Value: formatValue(obj) }];
}

/**
 * Separate simple fields from complex nested structures
 */
function separateFieldTypes(obj: Record<string, any>): {
  simpleFields: Record<string, any>;
  arrayFields: Record<string, any>;
} {
  const simpleFields: Record<string, any> = {};
  const arrayFields: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      arrayFields[key] = value;
    } else {
      simpleFields[key] = value;
    }
  });
  
  return { simpleFields, arrayFields };
}

/**
 * Flatten nested object with dot notation for keys
 */
function flattenObject(obj: any, parentKey: string = ''): any {
  let flattened: any = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    
    if (value === null || value === undefined) {
      flattened[formatFieldName(newKey)] = '';
    } else if (Array.isArray(value)) {
      // For arrays, join primitives or stringify objects
      if (value.length === 0) {
        flattened[formatFieldName(newKey)] = '';
      } else if (typeof value[0] === 'object') {
        flattened[formatFieldName(newKey)] = `${value.length} items`;
      } else {
        flattened[formatFieldName(newKey)] = value.join(', ');
      }
    } else if (typeof value === 'object' && Object.keys(value).length < 5) {
      // Flatten small nested objects
      Object.assign(flattened, flattenObject(value, newKey));
    } else if (typeof value === 'object') {
      // For large nested objects, show summary
      flattened[formatFieldName(newKey)] = `Object with ${Object.keys(value).length} fields`;
    } else {
      flattened[formatFieldName(newKey)] = value;
    }
  });
  
  return flattened;
}

/**
 * Smart format values for Excel display
 */
function formatValue(value: any): any {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Handle dates
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    if (value.length > 10) return `${value.length} items`;
    if (typeof value[0] === 'object') {
      return `${value.length} items (complex)`;
    }
    return value.join(', ');
  }
  
  // Handle objects
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '';
    if (keys.length > 5) return `Object with ${keys.length} properties`;
    // For small objects, show as key: value pairs
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join('; ');
  }
  
  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  // Handle numbers
  if (typeof value === 'number') {
    return value;
  }
  
  return String(value);
}

/**
 * Create Excel from batch processing results
 */
export async function createBatchProcessingExcel(
  results: Array<{
    fileName: string;
    result: any;
    status: 'success' | 'error';
    error?: string;
  }>
): Promise<ExcelJS.Workbook> {
  const sheets: SheetConfig[] = [];

  // Summary sheet
  const summaryData = results.map((item, index) => ({
    '#': index + 1,
    'File Name': item.fileName,
    'Status': item.status.toUpperCase(),
    'Error': item.error || 'N/A',
    'Processed At': new Date().toLocaleString()
  }));

  sheets.push({
    name: 'Summary',
    data: summaryData,
    title: 'Batch Processing Summary',
    autoFilter: true,
    freezePane: { row: 2 }
  });

  // Individual result sheets
  results.forEach((item, index) => {
    if (item.status === 'success' && item.result) {
      const data = convertObjectToRows(item.result.extracted || item.result);
      sheets.push({
        name: sanitizeSheetName(`Result ${index + 1}`),
        data: data,
        title: `Results: ${item.fileName}`,
        autoFilter: true,
        freezePane: { row: 2 }
      });
    }
  });

  return createAdvancedExcelWorkbook(sheets, {
    title: 'Batch Processing Results',
    subject: 'Multiple Document Processing'
  });
}

/**
 * Sanitize sheet names for Excel compatibility
 */
function sanitizeSheetName(name: string): string {
  return name
    .replace(/[\\\/\*\?\[\]]/g, '_')
    .substring(0, 31);
}

/**
 * Export multiple sheets to a single Excel file
 */
export async function exportMultiSheetExcel(
  sheets: SheetConfig[],
  filename: string = 'multi-sheet-export.xlsx',
  workbookOptions?: {
    creator?: string;
    title?: string;
    subject?: string;
  }
): Promise<void> {
  const workbook = await createAdvancedExcelWorkbook(sheets, workbookOptions);
  await downloadExcelWorkbook(workbook, filename);
}
