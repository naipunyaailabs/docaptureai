// lib/excel-utils.ts
// Utility functions for smart JSON to Excel conversion

/**
 * Converts a JSON object to a format suitable for Excel export
 * @param data - The JSON data to convert
 * @returns Formatted data ready for Excel export
 */
export function convertJsonToExcelFormat(data: any): any[] {
  // Handle null or undefined data
  if (!data) return [];
  
  // If it's already an array, return as is
  if (Array.isArray(data)) {
    return data;
  }
  
  // If it's a simple primitive, wrap it in an array
  if (typeof data !== 'object') {
    return [{ value: data }];
  }
  
  // Handle objects by converting to array of key-value pairs
  if (typeof data === 'object' && data !== null) {
    // Check if it's a structured object that should be flattened
    return flattenObjectForExcel(data);
  }
  
  return [];
}

/**
 * Flattens a nested object into a format suitable for Excel
 * @param obj - The object to flatten
 * @param prefix - Prefix for nested keys
 * @returns Flattened array of objects
 */
function flattenObjectForExcel(obj: any, prefix: string = ''): any[] {
  const result: any[] = [];
  
  // Handle arrays of objects
  if (Array.isArray(obj)) {
    if (obj.length === 0) return [];
    
    // If array contains objects, convert to table format
    if (typeof obj[0] === 'object' && obj[0] !== null) {
      return obj;
    }
    
    // If array contains primitives, create a simple list
    return obj.map((item, index) => ({
      index: index + 1,
      value: item
    }));
  }
  
  // Handle simple objects
  if (typeof obj === 'object' && obj !== null) {
    const flatObj: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}_${key}` : key;
      
      if (value === null || value === undefined) {
        flatObj[fullKey] = '';
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively flatten nested objects
        Object.assign(flatObj, ...flattenObjectForExcel(value, fullKey));
      } else if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings or JSON
        if (value.length > 0 && typeof value[0] === 'object') {
          // For arrays of objects, create a separate entry
          flatObj[fullKey] = JSON.stringify(value);
        } else {
          flatObj[fullKey] = value.join(', ');
        }
      } else {
        flatObj[fullKey] = value;
      }
    }
    
    return [flatObj];
  }
  
  return [{ [prefix || 'value']: obj }];
}

/**
 * Creates a downloadable Excel file from JSON data
 * @param data - The data to convert to Excel
 * @param filename - The name of the Excel file
 */
export function downloadAsExcel(data: any, filename: string = 'data.xlsx'): void {
  // For now, we'll create a simple CSV since we don't have a full Excel library
  // In a real implementation, you would use a library like xlsx or exceljs
  
  const excelData = convertJsonToExcelFormat(data);
  
  // Convert to CSV format as a fallback
  let csvContent = '';
  
  if (excelData.length > 0) {
    // Add headers
    const headers = Object.keys(excelData[0]);
    csvContent += headers.join(',') + '\n';
    
    // Add rows
    excelData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] !== undefined ? String(row[header]) : '';
        // Escape commas and quotes in values
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });
  }
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.replace('.xlsx', '.csv'));
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Processes field extraction results for better Excel formatting
 * Uses smart conversion with nested structure handling
 * @param extractedData - The extracted field data
 * @returns Formatted data for Excel export
 */
export function processFieldExtractionForExcel(extractedData: any): any[] {
  // Handle the case where extractedData is already formatted
  if (Array.isArray(extractedData)) {
    return extractedData;
  }
  
  // Convert object to array format
  if (typeof extractedData === 'object' && extractedData !== null) {
    // If it has a specific structure we recognize
    if (extractedData.extracted) {
      return processFieldExtractionForExcel(extractedData.extracted);
    }
    
    // Use smart conversion for better Excel formatting
    return smartConvertToExcelRows(extractedData);
  }
  
  return [{ value: extractedData }];
}

/**
 * Smart conversion that handles nested structures intelligently
 */
function smartConvertToExcelRows(obj: Record<string, any>): any[] {
  const rows: any[] = [];
  
  Object.entries(obj).forEach(([key, value]) => {
    const formattedKey = formatFieldName(key);
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        rows.push({ Field: formattedKey, Value: '', Type: 'Empty Array' });
      } else if (typeof value[0] === 'object') {
        rows.push({ 
          Field: formattedKey, 
          Value: `${value.length} items (see details)`,
          Type: 'Array of Objects'
        });
        // Add sub-rows for array items
        value.forEach((item, idx) => {
          if (typeof item === 'object') {
            Object.entries(item).forEach(([subKey, subValue]) => {
              rows.push({
                Field: `  └─ ${formattedKey}[${idx + 1}].${formatFieldName(subKey)}`,
                Value: formatFieldValue(subValue),
                Type: getValueType(subValue)
              });
            });
          }
        });
      } else {
        rows.push({ 
          Field: formattedKey, 
          Value: value.join(', '),
          Type: 'Array'
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      // Nested object
      rows.push({ 
        Field: formattedKey, 
        Value: `Object with ${Object.keys(value).length} properties`,
        Type: 'Object'
      });
      // Add sub-rows for object properties
      Object.entries(value).forEach(([subKey, subValue]) => {
        rows.push({
          Field: `  └─ ${formattedKey}.${formatFieldName(subKey)}`,
          Value: formatFieldValue(subValue),
          Type: getValueType(subValue)
        });
      });
    } else {
      rows.push({ 
        Field: formattedKey, 
        Value: formatFieldValue(value),
        Type: getValueType(value)
      });
    }
  });
  
  return rows;
}

/**
 * Get the type of a value for display
 */
function getValueType(value: any): string {
  if (value === null || value === undefined) return 'Empty';
  if (typeof value === 'boolean') return 'Boolean';
  if (typeof value === 'number') return 'Number';
  if (value instanceof Date) return 'Date';
  if (Array.isArray(value)) return 'Array';
  if (typeof value === 'object') return 'Object';
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'Date';
    if (/^\d+$/.test(value)) return 'Number';
    if (value.length > 100) return 'Long Text';
    return 'Text';
  }
  return 'Unknown';
}

/**
 * Formats field names to be more readable
 * @param name - The field name to format
 * @returns Formatted field name
 */
export function formatFieldName(name: string): string {
  // Convert camelCase to Title Case
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Formats field values for better Excel display
 * @param value - The value to format
 * @returns Formatted value
 */
export function formatFieldValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  
  return String(value);
}