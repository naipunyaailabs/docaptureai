// hooks/useAGUI.ts
// React hooks for AG-UI protocol integration

import { useState, useCallback, useRef, useEffect } from 'react';
import { aguiClient, AGUIEvent, AGUIResponse } from '@/lib/agui-client';

export interface AGUIState {
  isLoading: boolean;
  progress: number;
  message: string;
  result: any;
  error: string | null;
  events: AGUIEvent[];
}

export interface AGUIOptions {
  onProgress?: (progress: number, message: string) => void;
  onEvent?: (event: AGUIEvent) => void;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export function useAGUI(options: AGUIOptions = {}) {
  const [state, setState] = useState<AGUIState>({
    isLoading: false,
    progress: 0,
    message: '',
    result: null,
    error: null,
    events: []
  });

  const runIdRef = useRef<string | null>(null);

  const handleEvent = useCallback((event: AGUIEvent) => {
    setState(prev => ({
      ...prev,
      events: [...prev.events, event]
    }));

    // Handle specific event types
    switch (event.type) {
      case 'run_started':
        setState(prev => ({
          ...prev,
          isLoading: true,
          progress: 0,
          message: 'Starting...',
          error: null
        }));
        break;

      case 'progress':
        if (event.data) {
          setState(prev => ({
            ...prev,
            progress: event.data.progress || prev.progress,
            message: event.data.message || prev.message
          }));
          options.onProgress?.(event.data.progress, event.data.message);
        }
        break;

      case 'run_finished':
        setState(prev => ({
          ...prev,
          isLoading: false,
          progress: 100,
          message: 'Completed',
          result: event.data?.result
        }));
        options.onComplete?.(event.data?.result);
        break;

      case 'run_error':
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: event.data?.error || 'Unknown error occurred'
        }));
        options.onError?.(event.data?.error || 'Unknown error occurred');
        break;

      case 'content_chunk':
        // Handle streaming content
        if (event.data?.chunk) {
          setState(prev => ({
            ...prev,
            message: `Processing content... (${event.data.chunkIndex || 0})`
          }));
        }
        break;
    }

    options.onEvent?.(event);
  }, [options]);

  const executeAgent = useCallback(async (
    agentType: string,
    input: any
  ): Promise<AGUIResponse> => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        progress: 0,
        message: 'Initializing...',
        error: null,
        result: null,
        events: []
      }));

      const response = await aguiClient.executeAgent(agentType, input, handleEvent);
      
      if (!response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Unknown error occurred'
        }));
        options.onError?.(response.error || 'Unknown error occurred');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      options.onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [handleEvent, options]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      message: '',
      result: null,
      error: null,
      events: []
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (runIdRef.current) {
        aguiClient.stopEventStream(runIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    executeAgent,
    reset
  };
}

// Specialized hooks for specific agents
export function useDocumentFieldExtractor(options: AGUIOptions = {}) {
  const agui = useAGUI(options);

  const extractFields = useCallback(async (
    document: File,
    extractOptions: {
      prompt?: string;
      requiredFields?: string[];
    } = {}
  ) => {
    return agui.executeAgent('field-extractor', {
      document,
      ...extractOptions
    });
  }, [agui]);

  return {
    ...agui,
    extractFields
  };
}

export function useDocumentSummarizer(options: AGUIOptions = {}) {
  const agui = useAGUI(options);

  const summarizeDocument = useCallback(async (
    document: File,
    summarizeOptions: {
      prompt?: string;
      format?: 'excel';
    } = {}
  ) => {
    return agui.executeAgent('document-summarizer', {
      document,
      ...summarizeOptions
    });
  }, [agui]);

  return {
    ...agui,
    summarizeDocument
  };
}

export function useRFPCreator(options: AGUIOptions = {}) {
  const agui = useAGUI(options);

  const createRFP = useCallback(async (
    rfpInput: {
      title: string;
      organization: string;
      deadline: string;
      sections?: Array<{ title: string; content: string }>;
      format?: 'excel';
    }
  ) => {
    return agui.executeAgent('rfp-creator', rfpInput);
  }, [agui]);

  return {
    ...agui,
    createRFP
  };
}