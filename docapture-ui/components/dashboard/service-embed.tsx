"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { config } from "@/lib/config"

interface ServiceEmbedProps {
  serviceId: string
  useAGUI?: boolean
}

export function ServiceEmbed({ serviceId, useAGUI = false }: ServiceEmbedProps) {
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous content
    containerRef.current.innerHTML = ''

    // Create iframe to embed the service
    const iframe = document.createElement('iframe')
    iframe.src = useAGUI 
      ? `${config.apiBaseUrl}/agui-demo` 
      : `${config.apiBaseUrl}/`
    iframe.style.width = '100%'
    iframe.style.height = '800px'
    iframe.style.border = 'none'
    iframe.style.backgroundColor = 'white'
    iframe.referrerPolicy = 'no-referrer'
    
    // Add custom styles to match the dashboard theme
    const style = document.createElement('style')
    style.textContent = `
      body {
        background: transparent !important;
      }
      .glass-effect {
        background: white !important;
        border: 1px solid #e5e7eb !important;
      }
      .dark-mode {
        background: white !important;
      }
      .text-gray-400 {
        color: #9ca3af !important;
      }
      .text-gray-300 {
        color: #d1d5db !important;
      }
      .text-gray-100 {
        color: #f3f4f6 !important;
      }
      .bg-gray-800 {
        background: #f9fafb !important;
      }
      .bg-gray-900 {
        background: white !important;
      }
      .border-gray-700 {
        border-color: #e5e7eb !important;
      }
      .border-gray-800 {
        border-color: #e5e7eb !important;
      }
      .action-btn {
        background: white !important;
        color: #374151 !important;
        border: 1px solid #e5e7eb !important;
      }
      .action-btn.active {
        background: linear-gradient(45deg, #fbbf24, #374151) !important;
        color: white !important;
        border: none !important;
      }
      input, textarea {
        background: white !important;
        border: 1px solid #e5e7eb !important;
        color: #374151 !important;
      }
      input:focus, textarea:focus {
        border-color: #fbbf24 !important;
        box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2) !important;
      }
      .result-card {
        background: white !important;
        border: 1px solid #e5e7eb !important;
      }
      th {
        background: #f9fafb !important;
        color: #374151 !important;
      }
      td {
        color: #374151 !important;
      }
      .rfp-section {
        background: #f9fafb !important;
      }
      .rfp-section input,
      .rfp-section textarea {
        background: white !important;
      }
    `
    
    // Inject the iframe and styles
    containerRef.current.appendChild(iframe)
    containerRef.current.appendChild(style)
    
    // Send auth token to iframe when it loads
    const sendAuthToken = () => {
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      if (authToken && iframe.contentWindow) {
        // Send message to iframe with auth token
        iframe.contentWindow.postMessage({
          type: 'SET_AUTH_TOKEN',
          token: authToken
        }, config.apiBaseUrl)
      }
    }
    
    iframe.addEventListener('load', sendAuthToken)
    
    // Add message listener to communicate with iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== config.apiBaseUrl) return
      
      // Handle messages from the iframe if needed
      console.log('Message from iframe:', event.data)
    }
    
    window.addEventListener('message', handleMessage)
    
    return () => {
      iframe.removeEventListener('load', sendAuthToken)
      window.removeEventListener('message', handleMessage)
    }
  }, [serviceId, user, useAGUI])

  return (
    <div ref={containerRef} className="w-full h-full min-h-[800px]">
      {/* The iframe and styles will be injected here by the useEffect */}
    </div>
  )
}