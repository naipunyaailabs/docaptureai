"use client";

import Link from "next/link";
import { Header } from "@/components/header";

export default function ServicesPage() {
  const services = [
    {
      id: "field-extractor",
      title: "Field Extractor",
      description: "Extract structured information from documents",
      icon: "🔍",
      color: "bg-blue-500",
    },
    {
      id: "document-summarizer",
      title: "Document Summarizer",
      description: "Create concise summaries of document content",
      icon: "📝",
      color: "bg-green-500",
    },
    {
      id: "rfp-creator",
      title: "RFP Creator",
      description: "Generate professional Request for Proposal documents",
      icon: "📄",
      color: "bg-purple-500",
    },
    {
      id: "rfp-summarizer",
      title: "RFP Summarizer",
      description: "Extract key information from RFP documents",
      icon: "📊",
      color: "bg-indigo-500",
    },
    {
      id: "template-uploader",
      title: "Template Uploader",
      description: "Upload document templates to improve extraction accuracy",
      icon: "📤",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Document Processing Services</h1>
            <div className="text-sm text-gray-500">
              Powered by AG-UI Protocol
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">AI-Powered Document Processing</h2>
            <p className="mb-4">
              Select a service below to process your documents using our AI-powered tools.
            </p>
            {/* Removed AI Assistant section */}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link 
                key={service.id}
                href={`/services/${service.id}`}
                className="block group"
              >
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow h-full border border-gray-200">
                  <div className={`w-12 h-12 rounded-full ${service.color} flex items-center justify-center text-white text-xl mb-4`}>
                    {service.icon}
                  </div>
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  <div className="flex items-center text-sm text-blue-500 font-medium group-hover:text-blue-700 transition-colors">
                    <span>Use Service</span>
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">About AG-UI Integration</h2>
            <p className="mb-4">
              All services are powered by the AG-UI protocol for real-time document processing.
              This integration provides:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Real-time streaming of processing results</li>
              <li>Seamless integration between frontend and backend services</li>
              <li>Efficient document processing with minimal latency</li>
            </ul>
            <div className="mt-4 p-4 bg-white rounded-md">
              <h3 className="font-medium mb-2">How It Works</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>You upload documents and specify processing requirements</li>
                <li>Requests are forwarded to our backend services via AG-UI protocol</li>
                <li>Results are streamed back in real-time and displayed in the UI</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}