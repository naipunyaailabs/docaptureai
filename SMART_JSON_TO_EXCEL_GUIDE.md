# Smart JSON to Excel Conversion Guide

## Overview

The enhanced JSON to Excel converter intelligently handles complex nested structures, creating organized, meaningful Excel workbooks that are easy to read and analyze.

---

## 🎯 Key Features

### 1. **Intelligent Structure Detection**
- Automatically separates simple fields from complex nested arrays
- Creates multiple sheets for better organization
- Detects data types and formats accordingly

### 2. **Multi-Sheet Organization**
```
Workbook Structure:
├── Summary Sheet (Main fields)
├── Array Sheet 1 (e.g., "Line Items")
├── Array Sheet 2 (e.g., "Contact Details")
└── Metadata Sheet (Processing info)
```

### 3. **Smart Field Formatting**
- **camelCase** → **Title Case** (e.g., `invoiceNumber` → `Invoice Number`)
- **Nested paths** → **Dot notation** (e.g., `customer.address.city`)
- **Array indices** → **Bracketed** (e.g., `items[1].description`)

### 4. **Data Type Recognition**
- Numbers: Formatted with thousand separators
- Dates: ISO format (yyyy-mm-dd)
- Booleans: "Yes" / "No"
- Arrays: Smart joining or separate sheets
- Objects: Flattened or referenced

---

## 📊 Examples

### Example 1: Simple Invoice (Before vs After)

#### Input JSON:
```json
{
  "invoiceNumber": "INV-2025-001",
  "invoiceDate": "2025-01-15",
  "customerName": "John Smith",
  "totalAmount": 15750.50,
  "isPaid": false,
  "items": [
    { "description": "Software License", "quantity": 1, "price": 10000 },
    { "description": "Support Services", "quantity": 12, "price": 5000 },
    { "description": "Training", "quantity": 1, "price": 750.50 }
  ]
}
```

#### Output Excel (Multi-Sheet):

**Sheet 1: "Summary"**
| Field | Value | Data Type |
|-------|-------|-----------|
| Invoice Number | INV-2025-001 | Text |
| Invoice Date | 2025-01-15 | Date |
| Customer Name | John Smith | Text |
| Total Amount | 15,750.50 | Number |
| Is Paid | No | Boolean |
| Items | 3 items | Array/Table → Sheet: "Items" |

**Sheet 2: "Items"**
| Description | Quantity | Price |
|-------------|----------|-------|
| Software License | 1 | 10,000.00 |
| Support Services | 12 | 5,000.00 |
| Training | 1 | 750.50 |

**Sheet 3: "Metadata"**
| Property | Value |
|----------|-------|
| Template ID | invoice_template_v2 |
| Confidence Score | 92% |
| Processing Time | 1847ms |
| Extraction Date | 2025-01-15 10:30:45 |

---

### Example 2: Complex Nested Structure

#### Input JSON:
```json
{
  "companyName": "Acme Corp",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "contacts": [
    { "name": "Alice", "role": "CEO", "email": "alice@acme.com" },
    { "name": "Bob", "role": "CTO", "email": "bob@acme.com" }
  ],
  "projects": [
    { 
      "name": "Project Alpha",
      "budget": 100000,
      "team": ["Alice", "Bob", "Charlie"]
    }
  ]
}
```

#### Output Excel:

**Sheet 1: "Summary"**
| Field | Value | Data Type |
|-------|-------|-----------|
| Company Name | Acme Corp | Text |
| Address.Street | 123 Main St | Text |
| Address.City | New York | Text |
| Address.State | NY | Text |
| Address.Zip | 10001 | Text |
| Contacts | 2 items | Array/Table → Sheet: "Contacts" |
| Projects | 1 items | Array/Table → Sheet: "Projects" |

**Sheet 2: "Contacts"**
| Name | Role | Email |
|------|------|-------|
| Alice | CEO | alice@acme.com |
| Bob | CTO | bob@acme.com |

**Sheet 3: "Projects"**
| Name | Budget | Team |
|------|--------|------|
| Project Alpha | 100,000.00 | Alice, Bob, Charlie |

---

## 🔧 Smart Conversion Rules

### Rule 1: Simple Fields
**Input:** `{ "firstName": "John", "age": 30 }`

**Output:**
| Field | Value |
|-------|-------|
| First Name | John |
| Age | 30 |

### Rule 2: Nested Objects (Small)
**Input:** `{ "customer": { "name": "John", "email": "john@example.com" } }`

**Output:**
| Field | Value |
|-------|-------|
| Customer.Name | John |
| Customer.Email | john@example.com |

### Rule 3: Nested Objects (Large)
**Input:** `{ "details": { /* 10+ fields */ } }`

**Output:**
| Field | Value |
|-------|-------|
| Details | Object with 10 fields |

### Rule 4: Arrays of Primitives
**Input:** `{ "tags": ["important", "urgent", "client"] }`

**Output:**
| Field | Value |
|-------|-------|
| Tags | important, urgent, client |

### Rule 5: Arrays of Objects
**Input:** `{ "items": [{ "name": "A" }, { "name": "B" }] }`

**Output:** Separate sheet named "Items"

### Rule 6: Deeply Nested
**Input:**
```json
{
  "order": {
    "customer": {
      "address": {
        "city": "NYC"
      }
    }
  }
}
```

**Output:**
| Field | Value |
|-------|-------|
| Order.Customer.Address.City | NYC |

---

## 💡 Best Practices

### 1. **Field Naming**
```javascript
// ✅ Good - Will become "Invoice Number"
{ invoiceNumber: "INV-001" }

// ✅ Good - Will become "Customer Name"
{ customer_name: "John" }

// ❌ Avoid - Hard to read
{ in_no: "INV-001" }
```

### 2. **Array Handling**
```javascript
// ✅ Good - Gets own sheet
{
  lineItems: [
    { product: "A", qty: 1, price: 100 },
    { product: "B", qty: 2, price: 50 }
  ]
}

// ✅ Good - Joined in single cell
{ tags: ["tag1", "tag2", "tag3"] }

// ⚠️ Caution - May be truncated if >10 items
{ longList: [1, 2, 3, ... 100] } // Shows "100 items"
```

### 3. **Data Types**
```javascript
// ✅ Numbers - Properly formatted
{ amount: 1500.50 } // → "1,500.50"

// ✅ Dates - ISO format
{ date: "2025-01-15" } // → "2025-01-15"

// ✅ Booleans - Yes/No
{ isActive: true } // → "Yes"

// ✅ Null/Undefined - Empty cell
{ optional: null } // → ""
```

---

## 🎨 Visual Hierarchy

### Tree Structure in Excel:
```
Main Fields
├─ Simple Field 1
├─ Simple Field 2
└─ Nested Object
   ├─ └─ Nested.Field1
   └─ └─ Nested.Field2

Arrays (Separate Sheets)
└─ Array Sheet 1
   └─ Item 1
   └─ Item 2
```

### Example Output:
```
Field                           | Value
─────────────────────────────────────────
Company Name                    | Acme Corp
Address                         | Object with 4 properties
  └─ Address.Street             | 123 Main St
  └─ Address.City               | New York
  └─ Address.State              | NY
  └─ Address.Zip                | 10001
Contacts                        | 2 items → Sheet: "Contacts"
```

---

## 🚀 Advanced Features

### 1. **Automatic Type Detection**
The converter automatically detects and formats:
- **Currency**: Numbers with 2 decimal places
- **Percentages**: Displayed as "XX%"
- **Dates**: ISO format (yyyy-mm-dd)
- **Phone Numbers**: Preserved as text
- **Email Addresses**: Clickable links (in some viewers)

### 2. **Smart Truncation**
Large data is intelligently summarized:
```javascript
// Long text → Truncated with indicator
{ description: "Very long text..." } // Shows in cell

// Large array → Count shown
{ items: [/* 50 items */] } // Shows "50 items (see sheet)"

// Deep object → Summary
{ config: { /* 20 fields */ } } // Shows "Object with 20 properties"
```

### 3. **Column Width Optimization**
- **Minimum**: 10 characters
- **Maximum**: 50 characters
- **Auto-calculated** based on content
- **Headers**: Always fit completely

---

## 📈 Performance Tips

### 1. **Large Datasets**
- Arrays with >1000 items: Sampled for width calculation
- Objects with >100 fields: May create multiple sheets
- Deep nesting (>5 levels): Flattened progressively

### 2. **Memory Management**
- Batch processing: One file at a time
- Large files: Progressive parsing
- Excel generation: Async operations

---

## 🔍 Troubleshooting

### Issue: "Fields are missing in Excel"
**Solution:** Check if field has null/undefined value - these become empty cells

### Issue: "Array data not showing properly"
**Solution:** Arrays of objects get separate sheets - check all sheets in workbook

### Issue: "Numbers showing as text"
**Solution:** Ensure numbers are actual number types, not strings with numbers

### Issue: "Nested data looks messy"
**Solution:** Objects with >5 fields automatically get flattened or referenced

---

## 📚 Code Examples

### Example 1: Basic Export
```typescript
import { createFieldExtractionExcel, downloadExcelWorkbook } from '@/lib/advanced-excel-utils';

const result = {
  extracted: { /* your JSON data */ },
  templateId: 'template_123',
  confidence: 85
};

const workbook = await createFieldExtractionExcel(result);
await downloadExcelWorkbook(workbook, 'results.xlsx');
```

### Example 2: Custom Processing
```typescript
import { processFieldExtractionForExcel } from '@/lib/excel-utils';

const data = { /* complex nested JSON */ };
const formattedRows = processFieldExtractionForExcel(data);

// formattedRows contains:
// [
//   { Field: "Customer Name", Value: "John", Type: "Text" },
//   { Field: "Items", Value: "3 items", Type: "Array" }
// ]
```

---

## ✅ Summary

The smart JSON to Excel converter provides:

✅ **Automatic structure detection** - Separates simple from complex fields  
✅ **Multi-sheet organization** - Arrays get dedicated sheets  
✅ **Smart formatting** - camelCase → Title Case, proper data types  
✅ **Visual hierarchy** - Tree structure with indentation  
✅ **Type recognition** - Numbers, dates, booleans formatted correctly  
✅ **Performance optimized** - Handles large datasets efficiently  
✅ **Professional output** - Styled, filterable, frozen headers  

Your JSON data is now transformed into organized, meaningful Excel workbooks! 🎉
