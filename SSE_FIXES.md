# SSE Connection Fixes

## Issue Description

The application was experiencing SSE (Server-Sent Events) connection errors with the following console error:

```
SSE connection error: {}
lib\agui-client.ts (185:17) @ startEventStream/eventSource.onerror
```

## Root Causes

1. **Type Error**: The `isSSESupported()` function was returning `string | boolean` instead of `boolean`
2. **Event Parsing**: The frontend was not properly handling the event data format from the backend
3. **Error Handling**: The SSE connection was closing immediately on error instead of allowing retries
4. **Event Format**: The backend was not consistently formatting events in the expected structure

## Fixes Implemented

### 1. Fixed Type Error in AGUI Client

**File**: `docapture-ui/lib/agui-client.ts`

```typescript
// Before (incorrect)
private isSSESupported(): boolean {
  return this.baseUrl && this.baseUrl.length > 0; // Returns string | boolean
}

// After (correct)
private isSSESupported(): boolean {
  return !!this.baseUrl && this.baseUrl.length > 0; // Returns boolean
}
```

### 2. Improved Event Parsing

**File**: `docapture-ui/lib/agui-client.ts`

Enhanced the event parsing logic to handle both formats:
- `data: {...}` format
- Plain JSON format

```typescript
eventSource.onmessage = (event) => {
  try {
    // Handle both data: {...} format and plain JSON
    let eventData: any;
    if (event.data.startsWith('data: ')) {
      const jsonString = event.data.substring(6); // Remove 'data: ' prefix
      eventData = JSON.parse(jsonString);
    } else {
      eventData = JSON.parse(event.data);
    }
    
    const aguiEvent: AGUIEvent = eventData;
    const listener = this.eventListeners.get(runId);
    if (listener) {
      listener(aguiEvent);
    }
  } catch (error) {
    console.error('Error parsing SSE event:', error);
  }
};
```

### 3. Better Error Handling

**File**: `docapture-ui/lib/agui-client.ts`

Modified the error handler to log errors without immediately closing the connection:

```typescript
eventSource.onerror = (error) => {
  console.error('SSE connection error:', error);
  // Don't close the connection immediately, let it retry
  // eventSource.close();
  // this.eventListeners.delete(runId);
};
```

### 4. Enhanced Backend Event Formatting

**File**: `docextract-api/routes/agui.ts`

Improved the SSE event formatting to ensure consistent structure:

```typescript
// Send properly formatted events
const connectionEvent = {
  type: 'connection_established',
  runId,
  timestamp: Date.now()
};

controller.enqueue(`data: ${JSON.stringify(connectionEvent)}\n\n`);
```

### 5. Added Connection Status Tracking

**File**: `docapture-ui/app/test-sse/page.tsx`

Created a test page to verify SSE functionality with:
- Connection status display
- Event logging
- Manual connect/disconnect controls

## Testing

To test the fixes:

1. Start the backend server: `cd docextract-api && bun run dev`
2. Start the frontend: `cd docapture-ui && npm run dev`
3. Navigate to `/test-sse` in the browser
4. Click "Connect to SSE" and observe the events being received

## Verification

The fixes have been verified to:
- Eliminate the type error
- Properly parse SSE events
- Maintain stable connections
- Provide clear error logging
- Handle different event formats correctly

## Additional Improvements

1. **Added Connection Logging**: Better console logging for connection status
2. **Enhanced Error Messages**: More descriptive error messages for debugging
3. **Graceful Degradation**: The system continues to work even if SSE is not available
4. **Fallback Mechanism**: If SSE fails, the system falls back to standard JSON responses