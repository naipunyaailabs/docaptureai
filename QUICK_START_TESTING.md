# Quick Start: Testing the Integration

## 🚀 Start the Servers

### 1. Start Backend (Terminal 1)
```bash
cd docextract-api
bun run index.ts
```

Expected output:
```
Connected to MongoDB successfully
Server running at http://localhost:3001
```

### 2. Start Frontend (Terminal 2)
```bash
cd docapture-ui
npm run dev
```

Expected output:
```
✓ Ready on http://localhost:3000
```

---

## 🧪 Test Flow

### Step 1: Register a New User
1. Go to http://localhost:3000/auth/register
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com  
   - Password: password123
   - Designation: Developer
   - Company: Test Company
   - ✅ Check "I agree to terms"
3. Click "Create Account"

**Expected:**
- User created
- Trial subscription automatically created (5 documents)
- Redirected to dashboard

### Step 2: Check Subscription
1. Go to http://localhost:3000/dashboard/subscription
2. Should see:
   - Current Plan: **Trial**
   - Documents Used: **0 / 5**
   - Progress bar at 0%

### Step 3: Process a Document
1. Go to http://localhost:3000/dashboard
2. Click on "Invoice Processing" service
3. Upload a sample invoice PDF
4. Select format: **Excel**
5. Click "Process Document"

**Expected:**
- Document processes successfully
- Result displayed
- Can download Excel file

### Step 4: Verify History
1. Go to http://localhost:3000/dashboard/history
2. Should see:
   - 1 processing record
   - File name shown
   - Status: **completed**
   - Processing time displayed

### Step 5: Check Updated Subscription
1. Go back to http://localhost:3000/dashboard/subscription
2. Should now see:
   - Documents Used: **1 / 5**
   - Progress bar at 20%

### Step 6: View Analytics
1. Go to http://localhost:3000/dashboard/analytics
2. Should see:
   - Total Processed: **1**
   - Success Rate: **100%**
   - Documents This Month: **1**
   - Service breakdown showing 1 document for Invoice service

### Step 7: Test Quota Limit
1. Process 4 more documents (any service)
2. Documents Used should reach **5 / 5**
3. Try to process a 6th document

**Expected:**
- Error message: "You've reached your limit of 5 documents"
- Upgrade prompt shown
- Document NOT processed

---

## 🔍 Backend Verification

### Check MongoDB Collections

```bash
# Connect to MongoDB
mongosh

# Use the database
use docapture

# View subscriptions
db.subscriptions.find().pretty()

# Should show:
# - userId: "user_xxx"
# - planId: "trial"
# - documentsLimit: 5
# - documentsUsed: 5 (after testing)
# - status: "trial"

# View processing history
db.processinghistories.find().sort({processedAt: -1}).limit(5).pretty()

# Should show:
# - 5 processing records
# - All with status: "completed"
# - Each with result data
```

### Test API Directly

#### Get Subscription
```bash
curl -X GET http://localhost:3001/subscription/current \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get Usage Status
```bash
curl -X GET http://localhost:3001/subscription/usage \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get History
```bash
curl -X GET http://localhost:3001/history?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get Analytics
```bash
curl -X GET "http://localhost:3001/history/analytics?days=30" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Expected Database State After Testing

### subscriptions collection
```json
{
  "_id": ObjectId("..."),
  "userId": "abc123...",
  "planId": "trial",
  "planName": "Trial",
  "documentsLimit": 5,
  "documentsUsed": 5,
  "currentPeriodStart": ISODate("2025-01-14T..."),
  "currentPeriodEnd": ISODate("2025-02-13T..."),
  "status": "trial",
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### processinghistories collection
```json
{
  "_id": ObjectId("..."),
  "userId": "abc123...",
  "serviceId": "invoice",
  "serviceName": "Invoice Processing",
  "fileName": "invoice_001.pdf",
  "fileSize": 245678,
  "format": "excel",
  "status": "completed",
  "result": { /* extracted data */ },
  "processedAt": ISODate("..."),
  "processingTime": 2340,
  "createdAt": ISODate("...")
}
```

---

## ✅ Success Checklist

- [ ] User registration creates trial subscription
- [ ] Trial subscription has 5 document limit
- [ ] Document processing increments usage count
- [ ] Processing history records are created
- [ ] Analytics show correct statistics
- [ ] Subscription page shows accurate usage
- [ ] History page displays processed documents
- [ ] Quota limit prevents processing when exceeded
- [ ] Excel files can be downloaded
- [ ] All dashboard pages load without errors

---

## 🐛 Troubleshooting

### Issue: "No active subscription found"
**Solution:**
```javascript
// Run in MongoDB shell
use docapture
db.subscriptions.insertOne({
  userId: "YOUR_USER_ID",
  planId: "trial",
  planName: "Trial",
  documentsLimit: 5,
  documentsUsed: 0,
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 30*24*60*60*1000),
  status: "trial",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Issue: "Invalid session"
**Solution:**
1. Clear browser localStorage
2. Log out and log in again
3. Check that token is being sent in Authorization header

### Issue: History not showing
**Solution:**
1. Check browser console for errors
2. Verify token in localStorage
3. Check backend logs for database connection
4. Ensure MongoDB is running

### Issue: Usage not incrementing
**Solution:**
1. Verify using `/process-auth/` endpoint (not `/process/`)
2. Check that user is logged in
3. Verify token is valid
4. Check backend logs for errors

---

## 🎯 Key Endpoints Summary

### Authentication (Public)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Subscription (Requires Auth)
- `GET /subscription/current` - Get subscription
- `GET /subscription/usage` - Check quota
- `POST /subscription/increment` - Increment usage (internal)
- `POST /subscription/upgrade` - Upgrade plan

### History (Requires Auth)
- `GET /history` - Get processing history
- `GET /history/{id}` - Get specific record
- `GET /history/analytics` - Get analytics
- `DELETE /history/{id}` - Delete record

### Processing
- `POST /process-auth/{serviceId}` - Process with auth (tracks usage)
- `POST /process/{serviceId}` - Process with API key (legacy, no tracking)

---

## 📈 Monitoring

### Check Backend Logs
```bash
# In docextract-api directory
tail -f server.log  # If logging to file

# Or watch console output
# Look for:
# - "Connected to MongoDB successfully"
# - Subscription created for user: xxx
# - Processing record created for user: xxx
# - Document usage incremented: xxx
```

### Check Frontend Console
```javascript
// Open browser DevTools Console
// Should see API calls:
// - GET /subscription/usage
// - GET /history
# - POST /process-auth/invoice
```

---

## 🎉 Success!

If all steps complete successfully, your integration is working perfectly!

Next steps:
1. Test with different services
2. Test error scenarios
3. Test edge cases (expired subscription, etc.)
4. Implement payment integration
5. Add email notifications
6. Deploy to production

---

**Status:** Ready for Testing
**Last Updated:** January 14, 2025
