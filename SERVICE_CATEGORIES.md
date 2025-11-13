# Document Services Categories - AG-UI Integration

## 📋 **Service Classification**

### **General Document Services** (Any Document Type)
These services work with **any type of document** and can process various file formats including PDFs, Word documents, images, text files, etc.

#### 1. **Field Extraction** (`field-extractor`)
- **Purpose**: Extract structured data from any document
- **Input**: Any document file (PDF, DOCX, images, etc.)
- **Output**: Structured JSON with extracted fields
- **Use Cases**: 
  - Invoice processing
  - Contract analysis
  - Report data extraction
  - Form processing
  - Any document with structured information

#### 2. **Document Summarization** (`document-summarizer`)
- **Purpose**: Generate concise summaries of any document content
- **Input**: Any document file (PDF, DOCX, text files, etc.)
- **Output**: HTML-formatted summary with key points
- **Use Cases**:
  - Research paper summaries
  - Report summaries
  - Meeting notes
  - Legal document overviews
  - Any document requiring summarization

#### 3. **Template Uploader** (`template-uploader`)
- **Purpose**: Upload and manage document templates for any document type
- **Input**: Template files and field definitions
- **Output**: Template configuration for field extraction
- **Use Cases**:
  - Custom form templates
  - Document processing templates
  - Field mapping configurations

### **RFP-Specific Services** (RFP Documents Only)
These services are specifically designed for **Request for Proposal (RFP) documents** and related workflows.

#### 1. **RFP Creation** (`rfp-creator`)
- **Purpose**: Generate new RFP documents from scratch
- **Input**: RFP requirements, sections, and specifications
- **Output**: Complete RFP document (Word/HTML format)
- **Use Cases**:
  - Creating new RFPs for procurement
  - Standardizing RFP formats
  - Generating RFP templates
  - RFP document generation

#### 2. **RFP Summarization** (`rfp-summarizer`)
- **Purpose**: Summarize existing RFP documents
- **Input**: Existing RFP documents (PDF, DOCX, etc.)
- **Output**: Structured summary of RFP content
- **Use Cases**:
  - RFP analysis and review
  - Quick RFP overviews
  - RFP comparison
  - RFP content extraction

## 🔄 **Service Workflow**

### **General Document Processing Flow**
```
Any Document → Field Extraction/Summarization → Structured Output
```

### **RFP-Specific Processing Flow**
```
RFP Requirements → RFP Creation → RFP Document
Existing RFP → RFP Summarization → RFP Summary
```

## 🎯 **When to Use Each Service**

### **Use General Services When:**
- Processing invoices, contracts, reports, or any business document
- Need to extract specific fields from various document types
- Want to summarize any document content
- Working with mixed document types in a workflow

### **Use RFP Services When:**
- Creating new RFP documents for procurement
- Analyzing existing RFP documents
- Working specifically with RFP workflows
- Need RFP-specific formatting and structure

## 🛠 **Technical Implementation**

### **AG-UI Integration**
- **General Services**: Use AG-UI protocol for real-time processing of any document type
- **RFP Services**: Use AG-UI protocol with RFP-specific optimizations and formatting

### **Backend Endpoints**
- **General Services**: `/extract`, `/summarize`, `/process/template-uploader`
- **RFP Services**: `/create-rfp`, `/summarize-rfp`

### **Response Formats**
- **General Services**: Flexible JSON responses for various document types
- **RFP Services**: RFP-specific structured responses with document generation

## 📊 **Service Capabilities**

### **Supported File Types** (General Services)
- PDF documents
- Word documents (.docx, .doc)
- Image files (.jpg, .jpeg, .png, .tiff)
- Text files (.txt)
- Other document formats

### **RFP Document Formats**
- PDF RFPs
- Word RFP documents
- HTML RFP documents
- Text-based RFP content

## 🎨 **UI Indicators**

### **Service Cards**
- **General Services**: Show "AG-UI" badge with "Real-time processing with live updates"
- **RFP Services**: Show "RFP" badge with "RFP-specific processing with live updates"

### **Document Copilot**
- **Field Extraction**: "Any Document" indicator
- **Document Summary**: "Any Document" indicator  
- **RFP Creation**: "RFP Documents" indicator

## 🔍 **Testing**

### **General Document Services**
1. Upload any document (PDF, Word, image, etc.)
2. Test field extraction with various document types
3. Test summarization with different content types
4. Verify real-time progress updates

### **RFP Services**
1. Test RFP creation with different requirements
2. Upload existing RFP documents for summarization
3. Verify RFP-specific formatting and output
4. Test RFP workflow integration

## 📈 **Future Enhancements**

### **General Services**
- Support for more document formats
- Enhanced field extraction accuracy
- Multi-language document processing
- Advanced summarization algorithms

### **RFP Services**
- RFP template library
- RFP comparison tools
- RFP compliance checking
- RFP workflow automation

## 🎯 **Summary**

The AG-UI integration provides two distinct service categories:

1. **General Document Services** - Work with any document type for extraction and summarization
2. **RFP-Specific Services** - Specialized for RFP document creation and analysis

This categorization ensures users understand which services work with their specific document types and use cases, providing clear guidance for optimal service selection.
