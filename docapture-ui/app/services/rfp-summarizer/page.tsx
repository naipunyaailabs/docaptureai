"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { aguiClient } from "@/lib/agui-client";
// Removed CopilotKit imports

export default function RFPSummarizerPage() {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
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
      setError("Please select an RFP document file");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await aguiClient.summarizeRfp(documentFile);
      if (response.success) {
        setResult(response.data);
      } else {
        throw new Error(response.error || "Failed to summarize RFP");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to summarize RFP");
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
            <h1 className="text-3xl font-bold">RFP Summarizer Service</h1>
            <div className="text-sm text-gray-500">
              Powered by AG-UI Protocol
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Summarize RFP Documents</h2>
            <p className="mb-4">
              Upload an RFP document to get a concise summary of its key elements including 
              executive summary, requirements, timeline, and budget information.
            </p>
            {/* Removed AI assistant tip */}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  RFP Document
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
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              
              <button
                type="submit"
                disabled={!documentFile || isLoading}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? "Summarizing..." : "Summarize RFP"}
              </button>
            </form>
          </div>
          
          {isLoading && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">Processing</h2>
              <p>Analyzing your RFP document...</p>
            </div>
          )}
          
          {result && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">RFP Summary Results</h2>
              <div className="space-y-6">
                {result.result?.html ? (
                  // Handle HTML response from RFP summarizer
                  <div 
                    className="prose max-w-none border rounded-lg p-4"
                    dangerouslySetInnerHTML={{ __html: result.result.html }}
                  />
                ) : result.executiveSummary || result.summary ? (
                  // Handle structured response (fallback)
                  <>
                    <div>
                      <h3 className="font-medium mb-2">Executive Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p>{result.executiveSummary || result.summary}</p>
                      </div>
                    </div>
                    
                    {result.keyRequirements && (
                      <div>
                        <h3 className="font-medium mb-2">Key Requirements</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <ul className="list-disc pl-6 space-y-1">
                            {result.keyRequirements.map((req: string, index: number) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {result.timeline && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-2">Timeline</h3>
                          <div className="bg-gray-50 p-4 rounded-md">
                            <div className="space-y-1">
                              <p><strong>Proposal Submission:</strong> {result.timeline.proposalSubmission}</p>
                              <p><strong>Evaluation Period:</strong> {result.timeline.evaluationPeriod}</p>
                              <p><strong>Project Kickoff:</strong> {result.timeline.projectKickoff}</p>
                              <p><strong>Delivery Deadline:</strong> {result.timeline.deliveryDeadline}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Budget</h3>
                          <div className="bg-gray-50 p-4 rounded-md">
                            <p><strong>Budget Range:</strong> {result.budgetRange}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Fallback for unknown response format
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}