"use client";

import { useState } from "react";
import { Header } from "@/components/header";
// Removed CopilotKit imports
import { aguiClient } from "@/lib/agui-client";

export default function FieldExtractorPage() {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
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
      const response = await aguiClient.extractDocumentFields(documentFile, { prompt });
      setResult(response);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to extract fields from document");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Field Extractor Service</h1>
            <div className="text-sm text-gray-500">
              Powered by AG-UI Protocol
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Extract Structured Information</h2>
            <p className="mb-4">
              Upload a document and specify what information you want to extract. The field extractor 
              will identify and extract structured data from your document.
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
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {documentFile && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected: {documentFile.name} ({(documentFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Extraction Instructions
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Extract the invoice number, total amount, and due date. For contracts, extract parties involved, effective date, and termination clause."
                  className="w-full p-3 border border-gray-300 rounded-md"
                  rows={4}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Be specific about what information you need to extract.
                </p>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              
              <button
                type="submit"
                disabled={!documentFile || isLoading}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? "Extracting..." : "Extract Fields"}
              </button>
            </form>
          </div>
          
          {isLoading && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">Processing</h2>
              <p>Extracting fields from your document...</p>
            </div>
          )}
          
          {result && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Extraction Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Extracted Fields</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(result.extracted || result, null, 2)}
                    </pre>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Metadata</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {result.templateId && <p><strong>Template ID:</strong> {result.templateId}</p>}
                    {result.confidence && <p><strong>Confidence:</strong> {result.confidence}%</p>}
                    {result.usedTemplate !== undefined && <p><strong>Template Used:</strong> {result.usedTemplate ? "Yes" : "No"}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}