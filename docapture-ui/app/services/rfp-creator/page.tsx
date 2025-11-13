"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { aguiClient } from "@/lib/agui-client";

export default function RFPCreatorPage() {
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [deadline, setDeadline] = useState("");
  const [sections, setSections] = useState<Array<{ title: string; content: string }>>([
    { title: "Project Overview", content: "" },
    { title: "Scope of Work", content: "" },
    { title: "Proposal Requirements", content: "" },
  ]);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSection = () => {
    setSections([...sections, { title: "", content: "" }]);
  };

  const updateSection = (index: number, field: "title" | "content", value: string) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      const newSections = sections.filter((_, i) => i !== index);
      setSections(newSections);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await aguiClient.createRFPDocument({ title, organization, deadline, sections });
      
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error || "Failed to create RFP");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to create RFP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    
    try {
      // Create a download request to the backend
      const downloadResponse = await fetch(`${aguiClient.getBaseUrl()}/download-rfp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aguiClient.getApiKey()}`
        },
        body: JSON.stringify({
          title,
          organization,
          deadline,
          sections
        })
      });
      
      if (downloadResponse.ok) {
        const blob = await downloadResponse.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName || `${title.replace(/\s+/g, '_')}_RFP.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to download file');
      }
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download RFP document");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">RFP Creator Service</h1>
            <div className="text-sm text-gray-500">
              Powered by AG-UI Protocol
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Create Request for Proposal</h2>
            <p className="mb-4">
              Fill in the details below to create a professional RFP document. 
              You can customize the sections to match your specific requirements.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    RFP Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Software Development Services"
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="E.g., Acme Corporation"
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">RFP Sections</h3>
                  <button
                    type="button"
                    onClick={addSection}
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                  >
                    Add Section
                  </button>
                </div>
                
                {sections.map((section, index) => (
                  <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Section {index + 1}</h4>
                      {sections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSection(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(index, "title", e.target.value)}
                        placeholder="E.g., Project Overview"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Section Content
                      </label>
                      <textarea
                        value={section.content}
                        onChange={(e) => updateSection(index, "content", e.target.value)}
                        placeholder="Describe the content for this section..."
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              
              <button
                type="submit"
                disabled={!title || !organization || !deadline || isLoading}
                className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
              >
                {isLoading ? "Creating RFP..." : "Create RFP"}
              </button>
            </form>
          </div>
          
          {isLoading && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">Processing</h2>
              <p>Creating your RFP document...</p>
            </div>
          )}
          
          {result && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">RFP Created Successfully</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Details</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p><strong>Title:</strong> {title}</p>
                    <p><strong>Organization:</strong> {organization}</p>
                    <p><strong>Deadline:</strong> {deadline}</p>
                    <p><strong>Sections:</strong> {sections.length}</p>
                    {result.fileSize && (
                      <p><strong>File Size:</strong> {(result.fileSize / 1024).toFixed(1)} KB</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Download</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p>Your RFP document is ready:</p>
                    <p className="mt-2 font-mono text-sm">{result.fileName}</p>
                    <button 
                      onClick={handleDownload}
                      className="mt-3 inline-block px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                    >
                      Download RFP
                    </button>
                  </div>
                </div>
              </div>
              {result.message && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <p className="text-blue-800">{result.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}