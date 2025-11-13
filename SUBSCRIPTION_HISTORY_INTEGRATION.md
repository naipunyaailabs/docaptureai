# Subscription & History Integration - Complete Guide

## 🎯 Overview

This document explains the complete integration between document processing services, user subscriptions, and processing history in DoCapture Pro.

---

## 🏗️ Architecture

### Backend Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Document Processing Flow                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    User Authentication
                    (sessionService)
                              │
                              ▼
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
    Subscription Check              Processing History
    (subscriptionService)           (processingHistoryService)
              │                               │
              ▼                               ▼
    ┌─────────────────┐           ┌──────────────────┐
    │ Check Quota     │           │ Log Start        │
    │ - Documents Used│           │ - Service ID     │
    │ - Documents Limit│          │ - File Name      │
    │ - Plan Status   │           │ - User ID        │
    └─────────────────┘           └──────────────────┘
              │                               │
              ▼                               ▼
    ┌─────────────────┐           ┌──────────────────┐
    │ Process Document│           │ Log Result       │
    │ - Invoke Handler│───────────▶│ - Status         │
    │ - Get Result    │           │ - Processing Time│
    └─────────────────┘           │ - Result Data    │
              │                   └──────────────────┘
              ▼
    ┌─────────────────┐
    │ Increment Usage │
    │ (if successful) │
    └─────────────────┘
```

---

## 📦 Database Models

### 1. Subscription Model
**File:** `docextract-api/models/Subscription.ts`

```typescript
interface ISubscription {
  userId: string;              // Reference to user
  planId: string;              // 'trial', 'basic', 'pro', 'enterprise'
  planName: string;            // Display name
  documentsLimit: number;      // Monthly quota
  documentsUsed: number;       // Current period usage
  currentPeriodStart: Date;    // Billing period start
  currentPeriodEnd: Date;      // Billing period end
  status: SubscriptionStatus;  // 'trial', 'active', 'cancelled', 'expired'
  paymentCustomerId?: string;  // Stripe customer ID (future)
  paymentSubscriptionId?: string; // Stripe subscription ID (future)
  createdAt: Date;
  updatedAt: Date;
}
```

**Subscription Plans:**

| Plan | Price/Month | Documents Limit | Status |
|------|-------------|-----------------|--------|
| Trial | $0 | 5 | Default for new users |
| Basic | $29 | 100 | Paid |
| Pro | $99 | 500 | Paid |
| Enterprise | Custom | Unlimited | Paid |

### 2. Processing History Model
**File:** `docextract-api/models/ProcessingHistory.ts`

```typescript
interface IProcessingHistory {
  userId: string;              // Reference to user
  serviceId: string;           // 'invoice', 'receipt', 'id-verification', etc.
  serviceName: string;         // Display name
  fileName: string;            // Original file name
  fileSize: number;            // File size in bytes
  format: string;              // Output format ('json', 'excel')
  status: 'completed' | 'failed' | 'processing';
  result: any;                 // Extracted data
  error?: string;              // Error message if failed
  logs?: string[];             // Processing logs
  processedAt: Date;           // Timestamp
  processingTime?: number;     // Duration in milliseconds
  createdAt: Date;
}
```

---

## 🔌 Backend API Endpoints

### Authentication Endpoints

#### `POST /auth/register`
- Creates new user
- **Automatically creates trial subscription** (5 documents/month)
- Returns auth token

```typescript
// Response includes user and token
{
  token: "jwt_token_here",
  user: { ... },
  message: "User registered successfully"
}
```

#### `POST /auth/login`
- Authenticates user
- Returns auth token

### Subscription Endpoints

#### `GET /subscription/current`
**Authentication:** Required (User Token)

Get user's current active subscription.

```typescript
// Response
{
  id: "sub_123",
  userId: "user_456",
  planId: "trial",
  planName: "Trial",
  documentsLimit: 5,
  documentsUsed: 2,
  currentPeriodStart: "2025-01-01T00:00:00Z",
  currentPeriodEnd: "2025-01-31T23:59:59Z",
  status: "trial"
}
```

#### `GET /subscription/usage`
**Authentication:** Required (User Token)

Check if user can process documents and get usage stats.

```typescript
// Response
{
  canProcess: true,
  documentsUsed: 2,
  documentsLimit: 5,
  planId: "trial",
  planName: "Trial",
  message: "You have 3 documents remaining."
}
```

#### `POST /subscription/increment`
**Authentication:** Required (User Token)

Manually increment document usage (called after successful processing).

```typescript
// Response
{
  documentsUsed: 3,
  documentsLimit: 5,
  remaining: 2
}
```

#### `POST /subscription/upgrade`
**Authentication:** Required (User Token)

Upgrade user's subscription plan.

```json
// Request Body
{
  "planId": "basic",
  "planName": "Basic",
  "documentsLimit": 100,
  "paymentCustomerId": "cus_xxx",  // Optional
  "paymentSubscriptionId": "sub_xxx"  // Optional
}
```

### History Endpoints

#### `GET /history?limit=50&offset=0&serviceId=invoice`
**Authentication:** Required (User Token)

Get user's processing history.

**Query Parameters:**
- `limit` (default: 50) - Number of records to return
- `offset` (default: 0) - Pagination offset
- `serviceId` (optional) - Filter by specific service

```typescript
// Response: Array of processing records
[
  {
    id: "hist_123",
    serviceId: "invoice",
    serviceName: "Invoice Processing",
    fileName: "invoice_001.pdf",
    fileSize: 245678,
    format: "excel",
    status: "completed",
    result: { ... },
    processedAt: "2025-01-14T10:30:00Z",
    processingTime: 2340
  },
  ...
]
```

#### `GET /history/{id}`
**Authentication:** Required (User Token)

Get specific processing record by ID.

#### `GET /history/analytics?days=30`
**Authentication:** Required (User Token)

Get analytics data for dashboard.

**Query Parameters:**
- `days` (default: 30) - Time range for analytics

```typescript
// Response
{
  totalProcessed: 245,
  successRate: 94.3,
  avgProcessingTime: 2.4,  // in seconds
  documentsThisMonth: 87,
  serviceBreakdown: [
    {
      serviceId: "invoice",
      serviceName: "Invoice Processing",
      count: 87,
      successRate: 96.5
    },
    ...
  ]
}
```

#### `POST /history`
**Authentication:** Required (User Token)

Create a new processing history record (typically called internally).

#### `DELETE /history/{id}`
**Authentication:** Required (User Token)

Delete a processing history record.

### Document Processing Endpoints

#### `POST /process-auth/{serviceId}`
**Authentication:** Required (User Token)

Process document with subscription checking and history logging.

**Flow:**
1. Verify user authentication
2. Check subscription quota
3. Process document
4. Log history
5. Increment usage count (if successful)
6. Return result

```typescript
// Request: FormData
{
  document: File,
  format: 'json' | 'excel',
  // ... service-specific options
}

// Response: Processing result
{
  fields: { ... },  // Extracted data
  excel_url: "...", // Excel file URL (if format=excel)
  ...
}
```

**Services:**
- `invoice` - Invoice field extraction
- `receipt` - Receipt processing
- `id-verification` - ID card verification
- `bank-statement` - Bank statement analysis
- `field-extractor` - Custom field extraction
- `document-summarizer` - Document summarization

#### `POST /process/{serviceId}`
**Authentication:** API Key Only (No user auth)

Legacy endpoint for API key authentication (bypasses subscription).

---

## 💻 Frontend Integration

### API Service
**File:** `docapture-ui/lib/api.ts`

The ApiService class handles all API communication with automatic authentication.

#### Key Methods

```typescript
// Check user's subscription status
await apiService.checkUsageStatus()
// Returns: { canProcess, documentsUsed, documentsLimit, ... }

// Get current subscription
await apiService.getUserSubscription()
// Returns: { id, planId, planName, documentsLimit, ... }

// Get processing history
await apiService.getProcessingResults(limit, offset)
// Returns: Array of processing records

// Get analytics
await apiService.getAnalytics(days)
// Returns: { totalProcessed, successRate, avgProcessingTime, ... }

// Process document (automatically uses /process-auth if logged in)
await apiService.processMultipleDocuments(serviceId, files, format)
```

### Authentication Flow

1. **User logs in** → Receives JWT token
2. **Token stored** in localStorage and ApiService instance
3. **All requests** include `Authorization: Bearer <token>` header
4. **Document processing** automatically uses authenticated endpoint

### Usage Example

```typescript
// In a React component
import { apiService } from '@/lib/api'

// Check if user can process document
const usageCheck = await apiService.checkUsageStatus()

if (!usageCheck.success || !usageCheck.data?.canProcess) {
  alert(usageCheck.data?.message || 'Cannot process document')
  return
}

// Process document
const result = await apiService.processMultipleDocuments(
  'invoice',
  [file],
  'excel'
)

if (result.success) {
  // Document processed successfully
  // Usage automatically incremented
  // History automatically logged
}
```

---

## 📊 Dashboard Pages Integration

### 1. Analytics Page
**File:** `docapture-ui/app/dashboard/analytics/page.tsx`

**Features:**
- Fetch analytics from `/history/analytics`
- Display key metrics (total processed, success rate, etc.)
- Service breakdown with progress bars
- Time range selector (7d, 30d, 90d, all)

**Code Example:**
```typescript
const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

useEffect(() => {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
  
  apiService.getAnalytics(days).then(response => {
    if (response.success && response.data) {
      setAnalytics(response.data)
    }
  })
}, [timeRange])
```

### 2. History Page
**File:** `docapture-ui/app/dashboard/history/page.tsx`

**Features:**
- Fetch processing results from `/history`
- Display in table format
- Download results (Excel/JSON)
- Preview Excel files
- Real-time status updates

**Code Example:**
```typescript
useEffect(() => {
  apiService.getProcessingResults(50, 0).then(response => {
    if (response.success && response.data) {
      setResults(response.data)
    }
  })
}, [])
```

### 3. Subscription Page
**File:** `docapture-ui/app/dashboard/subscription/page.tsx`

**Features:**
- Fetch current subscription from `/subscription/current`
- Display usage with progress bar
- Show upgrade options
- Billing history
- Usage alerts (>80%)

**Code Example:**
```typescript
useEffect(() => {
  apiService.getUserSubscription().then(response => {
    if (response.success && response.data) {
      setSubscription(response.data)
    }
  })
}, [])

// Usage alert
{usagePercentage >= 80 && (
  <Alert>
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      You've used {documentsUsed} of {documentsLimit} documents
    </AlertDescription>
  </Alert>
)}
```

---

## 🔒 Security

### Authentication
- JWT tokens for user authentication
- API keys for service-level authentication
- Session validation on every request

### Authorization
- User can only access their own data
- Subscription checks prevent quota abuse
- Processing history filtered by userId

### Data Privacy
- All endpoints require authentication
- User data isolated by userId
- No cross-user data access

---

## 🚀 Deployment Checklist

### Backend
- [x] MongoDB connection configured
- [x] Subscription models created
- [x] Processing history models created
- [x] Services implemented
- [x] Routes implemented and integrated
- [x] Auto-create trial subscription on registration
- [x] Subscription checking in document processing
- [x] History logging in document processing

### Frontend
- [x] API service updated with new endpoints
- [x] Analytics page integrated
- [x] History page integrated
- [x] Subscription page integrated
- [x] Authentication flow complete
- [x] Error handling for quota exceeded
- [x] Usage alerts implemented

### Testing
- [ ] Test user registration creates trial subscription
- [ ] Test document processing decrements quota
- [ ] Test quota exceeded prevents processing
- [ ] Test history logging works correctly
- [ ] Test analytics calculations are accurate
- [ ] Test subscription upgrade flow
- [ ] Test pagination in history

---

## 📝 Example User Flow

### New User Registration
```
1. User registers → POST /auth/register
2. Backend creates user
3. Backend auto-creates trial subscription (5 documents)
4. User receives auth token
5. Frontend stores token
6. User redirected to dashboard
```

### Document Processing
```
1. User selects service and uploads file
2. Frontend checks usage → GET /subscription/usage
3. If quota available:
   a. Frontend calls → POST /process-auth/invoice
   b. Backend checks subscription
   c. Backend processes document
   d. Backend logs history
   e. Backend increments usage count
   f. Frontend displays result
4. If quota exceeded:
   a. Frontend shows upgrade prompt
   b. User can upgrade plan
```

### Viewing Analytics
```
1. User opens Analytics page
2. Frontend calls → GET /history/analytics?days=30
3. Backend calculates:
   - Total processed documents
   - Success rate
   - Average processing time
   - Service breakdown
4. Frontend displays charts and stats
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/docapture

# JWT Secret
JWT_SECRET=your_secret_key_here

# API Key (for non-user endpoints)
API_KEY=your_api_key_here

# Port
PORT=3001
```

### Frontend Config
**File:** `docapture-ui/lib/config.ts`

```typescript
export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
  // ...
}
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** "No active subscription found"
- **Cause:** User registered before subscription integration
- **Fix:** Manually create trial subscription or run migration script

**Issue:** Document usage not incrementing
- **Cause:** Using `/process/` instead of `/process-auth/`
- **Fix:** Ensure frontend uses authenticated endpoint when user is logged in

**Issue:** History not showing
- **Cause:** Missing authentication token
- **Fix:** Check localStorage for authToken, re-login if needed

**Issue:** Analytics showing 0 data
- **Cause:** No processing history records
- **Fix:** Process some documents first, then check analytics

---

## ✅ Success Metrics

After integration, you should see:

1. ✅ New users automatically get trial subscription (5 docs)
2. ✅ Document processing decrements quota
3. ✅ Processing history logged for every document
4. ✅ Analytics page shows real-time stats
5. ✅ History page displays all processed documents
6. ✅ Subscription page shows accurate usage
7. ✅ Quota exceeded prevents processing
8. ✅ Usage alerts shown at 80%+ usage

---

## 🎯 Next Steps

### Immediate
1. Test end-to-end flow with real user
2. Verify MongoDB indexes are created
3. Test error scenarios (quota exceeded, failed processing)

### Future Enhancements
1. Integrate Stripe payment processing
2. Add plan upgrade/downgrade flows
3. Implement usage-based billing
4. Add email notifications for quota alerts
5. Create admin dashboard for user management
6. Add analytics export to CSV/PDF
7. Implement scheduled reports
8. Add batch processing for multiple files

---

## 📚 Related Documentation

- [Dashboard Pages Complete Guide](./DASHBOARD_PAGES_COMPLETE.md)
- [Smart JSON to Excel Guide](./SMART_JSON_TO_EXCEL_GUIDE.md)
- [AG-UI Protocol Integration](./README.md)

---

**Status:** ✅ Complete and Ready for Testing

**Last Updated:** January 14, 2025

**Version:** 1.0
