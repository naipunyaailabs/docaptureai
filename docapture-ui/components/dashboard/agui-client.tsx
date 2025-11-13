"use client"

import { useState, useEffect, useRef } from 'react'
import { useAuth } from "@/contexts/auth-context"
import { config } from "@/lib/config"

// AG-UI Event Types
export enum AGUIEventType {
  RUN_STARTED = "run_started",
  RUN_FINISHED = "run_finished",
  RUN_ERROR = "run_error",
  TEXT_MESSAGE_START = "text_message_start",
  TEXT_MESSAGE_CONTENT = "text_message_content",
  TEXT_MESSAGE_END = "text_message_end",
  TOOL_CALL_START = "tool_call_start",
  TOOL_CALL_ARGS = "tool_call_args",
  TOOL_CALL_END = "tool_call_end",
  STATE_DELTA = "state_delta"
}

// AG-UI Event Interfaces
interface AGUIBaseEvent {
  type: AGUIEventType
  timestamp?: number
}

interface RunStartedEvent extends AGUIBaseEvent {
  type: AGUIEventType.RUN_STARTED
  threadId: string
  runId: string
}

interface RunFinishedEvent extends AGUIBaseEvent {
  type: AGUIEventType.RUN_FINISHED
  threadId: string
  runId: string
  result?: any
}

interface RunErrorEvent extends AGUIBaseEvent {
  type: AGUIEventType.RUN_ERROR
  message: string
  code?: string
}

interface TextMessageStartEvent extends AGUIBaseEvent {
  type: AGUIEventType.TEXT_MESSAGE_START
  messageId: string
  role: "assistant" | "user" | "system"
}

interface TextMessageContentEvent extends AGUIBaseEvent {
  type: AGUIEventType.TEXT_MESSAGE_CONTENT
  messageId: string
  delta: string
}

interface TextMessageEndEvent extends AGUIBaseEvent {
  type: AGUIEventType.TEXT_MESSAGE_END
  messageId: string
}

interface ToolCallStartEvent extends AGUIBaseEvent {
  type: AGUIEventType.TOOL_CALL_START
  toolCallId: string
  toolName: string
  parentMessageId?: string
}

interface ToolCallArgsEvent extends AGUIBaseEvent {
  type: AGUIEventType.TOOL_CALL_ARGS
  toolCallId: string
  delta: string
}

interface ToolCallEndEvent extends AGUIBaseEvent {
  type: AGUIEventType.TOOL_CALL_END
  toolCallId: string
  result?: any
}

interface StateDeltaEvent extends AGUIBaseEvent {
  type: AGUIEventType.STATE_DELTA
  delta: Record<string, any>
}

type AGUIEvent = 
  | RunStartedEvent
  | RunFinishedEvent
  | RunErrorEvent
  | TextMessageStartEvent
  | TextMessageContentEvent
  | TextMessageEndEvent
  | ToolCallStartEvent
  | ToolCallArgsEvent
  | ToolCallEndEvent
  | StateDeltaEvent

interface AGUIClientProps {
  serviceId: string
  onProcessStart?: () => void
  onProcessEnd?: (result: any) => void
  onProcessError?: (error: string) => void
}

export function AGUIClient({ 
  serviceId, 
  onProcessStart, 
  onProcessEnd, 
  onProcessError 
}: AGUIClientProps) {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [output, setOutput] = useState("")
  const [status, setStatus] = useState("Ready")
  const [error, setError] = useState<string | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  const handleAGUIEvent = (event: AGUIEvent) => {
    try {
      switch (event.type) {
        case AGUIEventType.RUN_STARTED:
          setStatus("Processing started")
          break
          
        case AGUIEventType.TEXT_MESSAGE_START:
          setStatus("Receiving response")
          break
          
        case AGUIEventType.TEXT_MESSAGE_CONTENT:
          setOutput(prev => prev + (event as TextMessageContentEvent).delta)
          break
          
        case AGUIEventType.TEXT_MESSAGE_END:
          setStatus("Response completed")
          break
          
        case AGUIEventType.STATE_DELTA:
          const stateDelta = (event as StateDeltaEvent).delta
          if (stateDelta.status) {
            setStatus(stateDelta.status)
          }
          break
          
        case AGUIEventType.RUN_FINISHED:
          const result = (event as RunFinishedEvent).result
          setStatus("Completed")
          setIsProcessing(false)
          onProcessEnd?.(result)
          break
          
        case AGUIEventType.RUN_ERROR:
          const errorMessage = (event as RunErrorEvent).message
          setError(errorMessage)
          setStatus("Error")
          setIsProcessing(false)
          onProcessError?.(errorMessage)
          break
      }
    } catch (parseError) {
      console.error("Error handling AG-UI event:", parseError)
    }
  }

  const processDocument = async (formData: FormData) => {
    if (isProcessing) return
    
    setIsProcessing(true)
    setOutput("")
    setStatus("Starting...")
    setError(null)
    onProcessStart?.()
    
    try {
      // Get auth token
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      if (!authToken) {
        throw new Error("No authentication token found")
      }
      
      // Create URL for the AG-UI endpoint
      const url = `${config.apiBaseUrl}/agui/${serviceId}`
      
      // Send the form data as a POST request to initiate processing
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Read the response stream directly
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("Response body is not readable")
      }
      
      readerRef.current = reader
      const decoder = new TextDecoder()
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        chunk.split("\n\n").forEach(line => {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6))
              handleAGUIEvent(event)
            } catch (err) {
              console.error("Failed to parse SSE chunk:", err)
            }
          }
        })
      }
    } catch (err) {
      const errorMessage = (err as Error).message || "An unknown error occurred"
      setError(errorMessage)
      setStatus("Error")
      setIsProcessing(false)
      onProcessError?.(errorMessage)
    } finally {
      if (readerRef.current) {
        readerRef.current.releaseLock()
        readerRef.current = null
      }
    }
  }
  
  const cancelProcessing = () => {
    if (readerRef.current) {
      readerRef.current.cancel()
      readerRef.current.releaseLock()
      readerRef.current = null
    }
    setIsProcessing(false)
    setStatus("Cancelled")
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel()
        readerRef.current.releaseLock()
      }
    }
  }, [])
  
  return {
    processDocument,
    cancelProcessing,
    isProcessing,
    output,
    status,
    error
  }
}