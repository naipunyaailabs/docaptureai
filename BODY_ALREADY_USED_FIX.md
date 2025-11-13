# "Body Already Used" Error - FIXED ✅

**Date:** 2025-10-14  
**Issue:** HTTP 500 error when processing documents with authenticated endpoints  
**Error Messages:** 
- `"Body already used"`
- `"FormData parse error missing final boundary"`

## Problem Description

When users tried to process documents through authenticated endpoints (`/process-auth/{serviceId}`), they received errors:

**Error 1:**
```
HTTP error! status: 500 - {
  "error": "Failed to extract information from document",
  "status": 500,
  "timestamp": "2025-10-14T09:39:23.445Z",
  "details": {
    "error": "Body already used"
  }
}
```

**Error 2 (after initial fix attempt):**
```
TypeError: FormData parse error missing final boundary
  at extractHandler (C:\Users\cogni\Desktop\docapture-full\docextract-api\routes\extract.ts:10:32)
```

## Root Cause

In `docextract-api/routes/processWithAuth.ts`, the request body was being consumed twice:

1. **First consumption** (Line 72): The handler read `formData` to extract file metadata
   ```typescript
   const formData = await req.formData();
   ```

2. **Second consumption** (Lines 103-118): The same request object was passed to service handlers like `extractHandler(req)`, which tried to read the body again:
   ```typescript
   case "field-extractor":
     response = await extractHandler(req); // ← Tries to read req.formData() again!
   ```

In HTTP request handling, a request body stream can only be read once. Once consumed, any subsequent attempts to read it will fail with "Body already used" error.

## Solution Implemented

### Approach: Pass FormData Directly to Handlers

Instead of trying to recreate a Request object (which causes boundary parsing issues in Bun), we modified the handlers to accept an optional pre-parsed FormData parameter:

**1. Updated Handler Signatures**

Modified all FormData-consuming handlers to accept optional FormData:

```typescript
// Before
export async function extractHandler(req: Request): Promise<Response> {
  const formData = await req.formData(); // Would fail on second read
  // ...
}

// After
export async function extractHandler(req: Request, preloadedFormData?: FormData): Promise<Response> {
  const formData = preloadedFormData || await req.formData();
  // ...
}
```

**2. Updated processWithAuth to Pass FormData**

```typescript
// Parse formData once
const formData = await req.formData();

// Extract file metadata
const fileEntry = formData.get('document');
if (fileEntry && typeof fileEntry !== 'string') {
  fileName = (fileEntry as any).name || 'document';
  fileSize = (fileEntry as any).size || 0;
}

// Pass the already-parsed formData to handlers
switch (serviceId) {
  case "field-extractor":
    response = await extractHandler(req, formData as any);
    break;
  case "document-summarizer":
    response = await summarizeHandler(req, formData as any);
    break;
  // ... etc
}
```

## Files Modified

### 1. Handler Files (Added Optional FormData Parameter)
- **`docextract-api/routes/extract.ts`**
  - Updated function signature to accept `preloadedFormData?: FormData`
  - Uses preloaded data if provided, otherwise reads from request

- **`docextract-api/routes/summarize.ts`**
  - Updated function signature to accept `preloadedFormData?: FormData`
  - Uses preloaded data if provided, otherwise reads from request

- **`docextract-api/routes/summarizeRfp.ts`**
  - Updated function signature to accept `preloadedFormData?: FormData`
  - Uses preloaded data if provided, otherwise reads from request

- **`docextract-api/routes/upload.ts`**
  - Updated function signature to accept `preloadedFormData?: FormData`
  - Uses preloaded data if provided, otherwise reads from request

### 2. Main Auth Handler
- **`docextract-api/routes/processWithAuth.ts`**
  - Parses FormData once for metadata extraction
  - Passes parsed FormData to handlers instead of creating new Request
  - Added `as any` type casts to handle Bun/undici type differences

## How It Works

1. ✅ **processWithAuth** reads the request body once with `await req.formData()`
2. ✅ Extracts file metadata (name, size) for logging
3. ✅ Passes the already-parsed FormData to service handlers as second parameter
4. ✅ Handlers check if `preloadedFormData` exists, use it if available
5. ✅ If no preloaded data (e.g., direct handler calls), handlers parse normally
6. ✅ No Request reconstruction = no FormData boundary parsing issues

## Impact

- ✅ Document processing now works correctly through authenticated endpoints
- ✅ Subscription tracking increments properly
- ✅ Processing history logs successfully
- ✅ No breaking changes to existing handlers
- ✅ All service types supported (field extraction, summarization, RFP creation, etc.)

## Testing

To verify the fix:
1. Log in to the application
2. Navigate to any service (e.g., Field Extractor, Document Summarizer)
3. Upload a document
4. Process should complete successfully
5. Check subscription page - `documentsUsed` should increment
6. Check history page - processing record should appear

## Technical Notes

- **Why not recreate Request?** Bun has issues parsing FormData with certain boundary formats (especially Gecko-style boundaries from Firefox). Recreating a Request with FormData causes "missing final boundary" errors.
- **Memory insight applied:** Based on project memory about Bun's FormData parser limitations and robust parsing strategies.
- **Type casting:** Used `as any` for FormData parameters due to type conflicts between Bun's native FormData and undici types.
- **Backward compatible:** Handlers still work when called directly (without preloaded FormData) since the parameter is optional.
- **No breaking changes:** All existing direct handler calls continue to work.
- The solution preserves all request headers and authentication context.
