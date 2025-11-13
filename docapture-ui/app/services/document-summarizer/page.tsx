"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { aguiClient } from "@/lib/agui-client";
// Removed CopilotKit imports

export default function DocumentSummarizerPage() {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState("pdf"); // Add format state
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Removed CopilotKit hooks - using direct AGUI service calls instead
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentFile) {
      setError("Please select a document file");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await aguiClient.executeAgent('document-summarizer', {
        document: documentFile,
        prompt,
        format
      });
      
      if (response.success) {
        setResult(response.data);
      } else {
        throw new Error(response.error || "Failed to summarize document");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to summarize document");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to download the result
  const downloadResult = () => {
    if (!result || !result.fileName) return;
    
    // In a real implementation, this would download the actual file
    // For now, we'll simulate the download
    const link = document.createElement('a');
    link.href = result.downloadUrl || '#';
    link.download = result.fileName;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Document Summarizer Service</h1>
            <div className="text-sm text-gray-500">
              Powered by AG-UI Protocol
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Create Document Summary</h2>
            <p className="mb-4">
              Upload a document and optionally provide instructions for the type of summary you want. 
              The document summarizer will create a concise summary of the key points.
            </p>
            {/* Removed AI assistant tip */}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Document File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100"
                />
                {documentFile && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected: {documentFile.name} ({(documentFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Output Format
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={format === "pdf"}
                      onChange={(e) => setFormat(e.target.value)}
                      className="text-green-500"
                    />
                    <span className="ml-2">PDF</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="docx"
                      checked={format === "docx"}
                      onChange={(e) => setFormat(e.target.value)}
                      className="text-green-500"
                    />
                    <span className="ml-2">Word (.docx)</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Summary Instructions
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Create a executive summary focusing on key findings and recommendations. Format as bullet points."
                  className="w-full p-3 border border-gray-300 rounded-md"
                  rows={4}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Specify what aspects of the document you want emphasized or what format you prefer.
                </p>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              
              <button
                type="submit"
                disabled={!documentFile || isLoading}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? "Summarizing..." : "Summarize Document"}
              </button>
            </form>
          </div>
          
          {isLoading && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">Processing</h2>
              <p>Creating summary of your document...</p>
            </div>
          )}
          
          {result && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Summary Results</h2>
                <button
                  onClick={downloadResult}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download {format.toUpperCase()}
                </button>
              </div>
              
              {result.summary ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: result.summary }}
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mr-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold">Summary Ready</h3>
                      <p className="text-gray-600">Your document summary has been generated successfully.</p>
                      <p className="text-sm text-gray-500 mt-1">
                        File: {result.fileName || `summary.${format}`} 
                        {result.fileSize && ` (${(result.fileSize / 1024).toFixed(1)} KB)`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}