// lib/agui-client.ts
// AG-UI protocol compliant client for frontend

import { config } from "./config";

export interface AGUIEvent {
  type: string;
  runId: string;
  timestamp: number;
  data?: any;
}

export interface AGUIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  events?: AGUIEvent[];
}

export class AGUIClient {
  private baseUrl: string;
  private apiKey: string;
  private authToken: string | null = null;
  private eventListeners: Map<string, (event: AGUIEvent) => void> = new Map();

  constructor() {
    this.baseUrl = config.apiBaseUrl;
    this.apiKey = config.apiKey;
    // Initialize auth token from localStorage if available
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('authToken');
    }
  }

  /**
   * Set user authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  // Public getters for baseUrl and apiKey
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Execute an agent with streaming events
   */
  async executeAgent<T = any>(
    agentType: string,
    input: any,
    onEvent?: (event: AGUIEvent) => void
  ): Promise<AGUIResponse<T>> {
    try {
      const runId = this.generateRunId();
      
      // Set up event listener if provided
      if (onEvent) {
        this.eventListeners.set(runId, onEvent);
        // Only start event stream if SSE endpoint is available
        if (this.isSSESupported()) {
          this.startEventStream(runId);
        }
      }

      // Map AG-UI agent types to existing backend endpoints
      const endpointMap: Record<string, string> = {
        'field-extractor': '/extract',
        'document-summarizer': '/summarize',
        'rfp-creator': '/create-rfp',
        'rfp-summarizer': '/summarize-rfp',
        'template-uploader': '/upload',
        'invoice': '/extract',
        'receipt': '/extract',
        'id-verification': '/extract',
        'bank-statement': '/extract',
        'custom-field-extractor': '/process-auth/custom-field-extractor',
        'college-id': '/process-auth/college-id',
        'driving-license': '/process-auth/driving-license',
        'table-extraction': '/process-auth/table-extraction',
        'aadhaar': '/process-auth/aadhaar',
        'pan-card': '/process-auth/pan-card',
        'voter-id': '/process-auth/voter-id',
        'generic-extractor': '/process-auth/generic-extractor',
        'groq-extraction': '/process-auth/groq-extraction'
      };

      // Use /process-auth/ if user is authenticated, otherwise use direct endpoint or /process/
      let endpoint: string;
      if (this.authToken) {
        // Authenticated user - use process-auth endpoint
        endpoint = `/process-auth/${agentType}`;
      } else {
        // No auth - use direct endpoint or legacy process endpoint
        endpoint = endpointMap[agentType] || `/process/${agentType}`;
      }

      // Prepare request based on agent type
      let requestBody: FormData | string;
      let headers: Record<string, string> = {};
      
      // Set authentication header
      if (this.authToken) {
        // Use user auth token if available
        headers['Authorization'] = `Bearer ${this.authToken}`;
      } else {
        // Fall back to API key
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      if (agentType === 'field-extractor' || agentType === 'document-summarizer' || agentType === 'rfp-summarizer' || agentType === 'template-uploader') {
        // Form data for file uploads
        requestBody = new FormData();
        if (input.document) {
          requestBody.append('document', input.document);
        }
        if (input.prompt) {
          requestBody.append('prompt', input.prompt);
        }
        if (input.format) {
          requestBody.append('format', input.format);
        }
        if (input.requiredFields) {
          requestBody.append('requiredFields', JSON.stringify(input.requiredFields));
        }
        // Note: We don't set Content-Type for FormData, browser will set it with correct boundary
      } else {
        // JSON for other agents
        requestBody = JSON.stringify(input);
        headers['Content-Type'] = 'application/json';
      }

      // Emit start event
      if (onEvent) {
        onEvent({
          type: 'run_started',
          runId,
          timestamp: Date.now(),
          data: { runId, startTime: Date.now() }
        });
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: requestBody
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          errorMessage += ` - ${errorText}`;
        } catch (e) {
          // If we can't read the error text, just use the status
        }
        throw new Error(errorMessage);
      }

      // Emit progress event
      if (onEvent) {
        onEvent({
          type: 'progress',
          runId,
          timestamp: Date.now(),
          data: { progress: 50, message: 'Processing response...' }
        });
      }

      const result = await response.json();

      // Emit completion event
      if (onEvent) {
        onEvent({
          type: 'run_finished',
          runId,
          timestamp: Date.now(),
          data: { runId, result: result.data, duration: Date.now() }
        });
      }

      // Clean up event listener
      if (onEvent) {
        this.eventListeners.delete(runId);
      }

      return {
        success: true,
        data: result.data || result,
        events: []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Emit error event
      if (onEvent) {
        onEvent({
          type: 'run_error',
          runId: this.generateRunId(),
          timestamp: Date.now(),
          data: { error: errorMessage, duration: 0 }
        });
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Check if SSE is supported and endpoint is available
   */
  private isSSESupported(): boolean {
    // Check if EventSource is available in the browser
    if (typeof EventSource === 'undefined') {
      console.warn('EventSource not supported in this browser');
      return false;
    }
    
    // Check if SSE endpoint is configured
    return !!this.baseUrl && this.baseUrl.length > 0;
  }

  /**
   * Start event stream for a specific run
   */
  private async startEventStream(runId: string): Promise<void> {
    try {
      // Validate that we have a base URL
      if (!this.baseUrl) {
        console.warn('No base URL configured for SSE connection');
        return;
      }
      
      const eventSourceUrl = `${this.baseUrl}/agui-sse?runId=${runId}`;
      console.log(`Attempting to connect to SSE endpoint: ${eventSourceUrl}`);
      
      const eventSource = new EventSource(eventSourceUrl);
      
      eventSource.onmessage = (event) => {
        try {
          // Handle both data: {...} format and plain JSON
          let eventData: any;
          if (event.data.startsWith('data: ')) {
            const jsonString = event.data.substring(6); // Remove 'data: ' prefix
            eventData = JSON.parse(jsonString);
          } else {
            eventData = JSON.parse(event.data);
          }
          
          const aguiEvent: AGUIEvent = eventData;
          const listener = this.eventListeners.get(runId);
          if (listener) {
            listener(aguiEvent);
          }
        } catch (error) {
          console.error('Error parsing SSE event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        // Don't close the connection immediately, let it retry
        // eventSource.close();
        // this.eventListeners.delete(runId);
      };

      eventSource.onopen = () => {
        console.log('SSE connection established successfully');
      };

      // Store event source for cleanup
      (this as any).eventSources = (this as any).eventSources || new Map();
      (this as any).eventSources.set(runId, eventSource);
    } catch (error) {
      console.error('Error starting event stream:', error);
    }
  }

  /**
   * Stop event stream for a specific run
   */
  stopEventStream(runId: string): void {
    const eventSource = (this as any).eventSources?.get(runId);
    if (eventSource) {
      eventSource.close();
      (this as any).eventSources.delete(runId);
    }
    this.eventListeners.delete(runId);
  }

  /**
   * Extract document fields using AG-UI protocol
   */
  async extractDocumentFields(
    document: File,
    options: {
      prompt?: string;
      requiredFields?: string[];
      onEvent?: (event: AGUIEvent) => void;
    } = {}
  ): Promise<AGUIResponse> {
    return this.executeAgent('field-extractor', {
      document,
      prompt: options.prompt,
      requiredFields: options.requiredFields
    }, options.onEvent);
  }

  /**
   * Extract document fields using custom field extractor
   */
  async extractCustomFields(
    document: File,
    options: {
      prompt?: string;
      requiredFields?: string[];
      onEvent?: (event: AGUIEvent) => void;
    } = {}
  ): Promise<AGUIResponse> {
    return this.executeAgent('custom-field-extractor', {
      document,
      prompt: options.prompt,
      requiredFields: options.requiredFields
    }, options.onEvent);
  }

  /**
   * Extract college ID information
   */
  async extractCollegeId(
    document: File,
    onEvent?: (event: AGUIEvent) => void
  ): Promise<AGUIResponse> {
    return this.executeAgent('college-id', {
      document
    }, onEvent);
  }

  /**
   * Extract driving license information
   */
  async extractDrivingLicense(
    document: File,
    onEvent?: (event: AGUIEvent) => void
  ): Promise<AGUIResponse> {
    return this.executeAgent('driving-license', {
      document
    }, onEvent);
  }

  /**
   * Extract table information
   */
  async extractTable(
    document: File,
    onEvent?: (event: AGUIEvent) => void
  ): Promise<AGUIResponse> {
    return this.executeAgent('table-extraction', {
      document
    }, onEvent);
  }

  /**
   * Extract Aadhaar information
   */
  async extractAadhaar(
    document: File,
    onEvent?: (event: AGUIEvent) => void
  ): Promise<AGUIResponse> {
    return this.executeAgent('aadhaar', {
      document
    }, onEvent);
  }

  /**
   * Extract PAN card information
   */
  async extractPanCard(
    document: File,
    onEvent?: (event: AGUIEvent) => void
  ): Promise<AGUIResponse> {
    return this.executeAgent('pan-card', {
      document
    }, onEvent);
  }

  /**
   * Extract voter ID information
   */
  async extractVoterId(
    document: File,
    onEvent?: (event: AGUIEvent) => void
  ): Promise<AGUIResponse> {
    return this.executeAgent('voter-id', {
      document
    }, onEvent);
  }

  /**
   * Extract generic information
   */
  async extractGeneric(
    document: File,
    onEvent?: (event: AGUIEvent) => void
  ): Promise<AGUIResponse> {
    return this.executeAgent('generic-extractor', {
      document
    }, onEvent);
  }

  /**
   * Extract information using Groq
   */
  async extractWithGroq(
    document: File,
    onEvent?: (event: AGUIEvent) => void
  ): Promise<AGUIResponse> {
    return this.executeAgent('groq-extraction', {
      document
    }, onEvent);
  }

  /**
   * Summarize document using AG-UI protocol
   */
  async summarizeDocument(
    document: File,
    options: {
      prompt?: string;
      format?: 'pdf' | 'docx';
      onEvent?: (event: AGUIEvent) => void;
    } = {}
  ): Promise<AGUIResponse> {
    return this.executeAgent('document-summarizer', {
      document,
      prompt: options.prompt,
      format: options.format || 'pdf'
    }, options.onEvent);
  }

  /**
   * Summarize RFP document using AG-UI protocol
   */
  async summarizeRfp(
    document: File,
    onEvent?: (event: AGUIEvent) => void
  ): Promise<AGUIResponse> {
    return this.executeAgent('rfp-summarizer', {
      document
    }, onEvent);
  }

  /**
   * Create RFP using AG-UI protocol
   */
  async createRFP(
    input: {
      title: string;
      organization: string;
      deadline: string;
      sections?: Array<{ title: string; content: string }>;
      format?: 'docx';
    },
    onEvent?: (event: AGUIEvent) => void
  ): Promise<AGUIResponse> {
    return this.executeAgent('rfp-creator', input, onEvent);
  }

  /**
   * Create RFP and get the generated document
   */
  async createRFPDocument(
    input: {
      title: string;
      organization: string;
      deadline: string;
      sections?: Array<{ title: string; content: string }>;
    }
  ): Promise<AGUIResponse<{ fileName: string; fileSize: number; message: string }>> {
    try {
      const response = await this.executeAgent('rfp-creator', input);
      
      if (!response.success) {
        return response as AGUIResponse<{ fileName: string; fileSize: number; message: string }>;
      }
      
      // Extract the result data from the response
      const resultData = response.data?.result || response.data;
      
      return {
        success: true,
        data: {
          fileName: resultData.fileName || `${input.title.replace(/\s+/g, '_')}_RFP.docx`,
          fileSize: resultData.fileSize || 0,
          message: resultData.message || "RFP document created successfully"
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Generate a unique run ID
   */
  private generateRunId(): string {
    return `run_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Clean up all event streams
   */
  cleanup(): void {
    const eventSources = (this as any).eventSources;
    if (eventSources) {
      eventSources.forEach((eventSource: EventSource) => {
        eventSource.close();
      });
      eventSources.clear();
    }
    this.eventListeners.clear();
  }
}

// Export singleton instance
export const aguiClient = new AGUIClient();