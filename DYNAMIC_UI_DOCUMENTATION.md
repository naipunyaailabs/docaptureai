# Dynamic UI Implementation for Docapture

## Overview

This document explains the implementation of a dynamic UI system that adapts to different document processing services based on AG-UI protocol events. The system automatically adjusts its interface and output display based on the service type and result format.

## Components

### 1. DynamicResultViewer (`components/dynamic-result-viewer.tsx`)

A flexible component that renders different types of results based on:
- Service type (field-extractor, document-summarizer, rfp-creator, etc.)
- Result format (JSON, HTML, table data, etc.)
- Processing status (loading, error, completed)

#### Features:
- **JSON Rendering**: For field extraction results with proper formatting and template information display
- **HTML Rendering**: For document summaries with rich formatting
- **Table Rendering**: For tabular data with responsive design
- **RFP Results**: Specialized display for RFP creation results with file information
- **Loading States**: Animated loading indicators
- **Error Handling**: Clear error messages with appropriate styling

### 2. DynamicServicePage (`components/dynamic-service-page.tsx`)

A generic service page component that dynamically generates input fields based on service metadata:
- File upload fields for document processing services
- Format selection dropdowns
- Custom prompt inputs
- Service-specific fields (e.g., RFP title, organization, deadline)

#### Features:
- **Service-Aware Input Generation**: Automatically creates appropriate input fields based on service metadata
- **AG-UI Integration**: Full integration with the AG-UI protocol for real-time updates
- **Progress Tracking**: Visual progress indicators with status messages
- **Event Logging**: Real-time display of processing events
- **Responsive Design**: Adapts to different screen sizes

### 3. Service-Specific Pages

Updated service pages that use the DynamicServicePage component:
- `app/dashboard/services/field-extractor/page.tsx`
- `app/dashboard/services/document-summarizer/page.tsx`
- `app/dashboard/services/rfp-creator/page.tsx`

## How It Works

### 1. Service Detection

The system identifies the service type through:
- Service ID (field-extractor, document-summarizer, etc.)
- Supported file types and formats
- Service metadata from the backend

### 2. Input Field Generation

Based on the service type, the UI dynamically generates:
- File upload components with appropriate accept attributes
- Format selection dropdowns
- Custom input fields for service-specific parameters
- Validation and disabled states during processing

### 3. Result Rendering

The DynamicResultViewer automatically determines how to display results:
- **Field Extractor**: JSON with extracted fields and template metadata
- **Document Summarizer**: HTML content with rich formatting
- **RFP Creator**: File information and download options
- **Generic Services**: Adaptive rendering based on data type

### 4. Real-Time Updates

The AG-UI protocol provides real-time updates through events:
- `run_started`: Initializes processing state
- `progress`: Updates progress bar and status message
- `content_chunk`: Handles streaming content
- `run_finished`: Displays final results
- `run_error`: Shows error messages

## Implementation Details

### Service Metadata Structure

Services are defined with the following properties:
```typescript
interface ServiceInfo {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  supportedFormats: string[];
  supportedFileTypes: string[];
  category: string;
  // ... other properties
}
```

### AG-UI Event Structure

Events follow this structure:
```typescript
interface AGUIEvent {
  type: string; // run_started, progress, run_finished, run_error, content_chunk
  runId: string;
  timestamp: number;
  data?: any;
}
```

### Result Adaptation Logic

The DynamicResultViewer uses the following logic to determine rendering:

1. **RFP Creator Service**: 
   - Displays file name, size, and processing time
   - Shows download options

2. **Document Summarizer Service**:
   - Checks if result contains HTML content
   - Renders HTML directly or falls back to JSON

3. **Field Extractor Service**:
   - Displays extracted fields in formatted JSON
   - Shows template information (ID, confidence, usage)

4. **Generic Services**:
   - HTML content rendering for strings starting with "<"
   - Table rendering for arrays
   - JSON rendering for objects

## Usage Examples

### In Service Pages
```tsx
<DynamicServicePage service={service} />
```

### In Result Display
```tsx
<DynamicResultViewer
  serviceId={currentServiceId}
  result={currentState.result}
  isLoading={currentState.isLoading}
  error={currentState.error}
/>
```

## Benefits

1. **Consistency**: Uniform interface across all services
2. **Maintainability**: Single component handles all service types
3. **Extensibility**: Easy to add new service types
4. **User Experience**: Real-time feedback and appropriate result display
5. **Performance**: Efficient rendering with proper loading states

## Future Enhancements

1. **Custom Renderers**: Allow services to define custom result renderers
2. **Advanced Formatting**: More sophisticated data visualization
3. **Export Options**: Additional export formats for different result types
4. **Interactive Results**: Click-to-edit functionality for extracted fields