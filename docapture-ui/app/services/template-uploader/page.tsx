"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { aguiClient } from "@/lib/agui-client";
// Removed CopilotKit imports

export default function TemplateUploaderPage() {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [fields, setFields] = useState<string[]>([""]);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]); // Add events state

  // Removed CopilotKit hooks - using direct AGUI service calls instead
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
      setError(null);
    }
  };

  const addField = () => {
    setFields([...fields, ""]);
  };

  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = value;
    setFields(newFields);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      const newFields = fields.filter((_, i) => i !== index);
      setFields(newFields);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentFile) {
      setError("Please select a template document");
      return;
    }
    
    // Filter out empty fields
    const nonEmptyFields = fields.filter(f => f.trim() !== "");
    if (nonEmptyFields.length === 0) {
      setError("Please specify at least one field to extract");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setEvents([{ type: "info", message: "Starting template upload...", timestamp: Date.now() }]); // Add initial event
    
    try {
      setEvents(prev => [...prev, { type: "info", message: "Uploading template...", timestamp: Date.now() }]);
      
      const response = await aguiClient.executeAgent('template-uploader', { 
        document: documentFile, 
        requiredFields: nonEmptyFields 
      });
      
      if (response.success) {
        setEvents(prev => [...prev, { type: "success", message: "Template uploaded successfully", timestamp: Date.now() }]);
        setResult(response.data);
      } else {
        throw new Error(response.error || "Failed to upload template");
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMessage = "Failed to upload template";
      setEvents(prev => [...prev, { type: "error", message: errorMessage, timestamp: Date.now() }]);
      setError(errorMessage);
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
            <h1 className="text-3xl font-bold">Template Uploader Service</h1>
            <div className="text-sm text-gray-500">
              Powered by AG-UI Protocol
            </div>
          </div>
          
          <div className="flex flex-col gap-8">
            {/* Input Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Upload Document Template</h2>
              <p className="mb-4">
                Upload a document template and specify the fields that should be extracted 
                from documents that match this template. This will improve the accuracy of 
                field extraction for similar documents.
              </p>
              {/* Removed AI assistant tip */}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Template Document
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-orange-50 file:text-orange-700
                      hover:file:bg-orange-100"
                    disabled={isLoading}
                  />
                  {documentFile && (
                    <p className="mt-2 text-sm text-gray-500">
                      Selected: {documentFile.name} ({(documentFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Template Fields</h3>
                    <button
                      type="button"
                      onClick={addField}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Add Field
                    </button>
                  </div>
                  
                  {fields.map((field, index) => (
                    <div key={index} className="flex items-center mb-3">
                      <input
                        type="text"
                        value={field}
                        onChange={(e) => updateField(index, e.target.value)}
                        placeholder="E.g., Invoice Number, Total Amount, Due Date"
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        disabled={isLoading}
                      />
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          className="ml-2 px-3 py-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <p className="mt-1 text-sm text-gray-500">
                    Specify the key fields that should be extracted from documents using this template.
                  </p>
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                
                <button
                  type="submit"
                  disabled={!documentFile || isLoading}
                  className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                >
                  {isLoading ? "Uploading..." : "Upload Template"}
                </button>
              </form>
            </div>
            
            {/* Processing Events */}
            {events.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Processing Events</h2>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {[...events].reverse().map((event, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                      <div className="flex justify-between">
                        <span className={`font-medium ${
                          event.type === "error" ? "text-red-500" : 
                          event.type === "success" ? "text-green-500" : "text-blue-500"
                        }`}>
                          {event.type}
                        </span>
                        <span className="text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{event.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Output Panel */}
            {result && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Template Uploaded Successfully</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Details</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p><strong>File Name:</strong> {result.fileName}</p>
                      <p><strong>Fields Defined:</strong> {result.fieldsCount}</p>
                      <p><strong>Template ID:</strong> {result.templateId}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Next Steps</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p>Your template is now available for use with the field extractor service.</p>
                      <p className="mt-2">Documents similar to this template will have improved extraction accuracy.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}