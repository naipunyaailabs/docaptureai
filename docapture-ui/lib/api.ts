import { config } from "./config"
import { aguiClient } from "./agui-client"

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

export enum SubscriptionStatus {
  Trial = "trial",
  Active = "active",
  Cancelled = "cancelled",
  Expired = "expired",
}

export type ServiceInfo = {
  id: string
  name: string
  description: string
  longDescription: string
  endpoint: string
  supportedFormats: string[]
  supportedFileTypes: string[]
  icon: string
  fileFieldName?: string
  category: string
}

export type UserProfile = {
  userId: string
  name: string
  email: string
  role: "user" | "admin" | "moderator"
  lastLoginAt: string
  preferences: string
  emailVerified: boolean,
  createdAt: string
  designation?: string
  companyName?: string
  useCase?: string
  subscribedToNewsletter?: boolean
  agreedToTermsAt?: string
}

export type ProcessingResult = {
  id: string
  serviceId: string
  fileName: string
  processedAt: string
  format: string
  status: "completed" | "failed" | "processing"
  result: any
  error?: string
  logs?: string[]

}

export type TemplateData = {
  required_fields: string[]
  vendor_name: string
}

export type TemplateListResponse = Record<string, TemplateData>

export type CreateTemplatePayload = {
  template_name: string
  required_fields: string[]
  vendor_name: string
}

export type SubscriptionPlan = {
  id: string
  name: string
  price: number
  documentsPerMonth: number
  features: string[]
  isActive: boolean
}

export type UserSubscription = {
  id: string
  userId: string
  planId: string
  documentsUsed: number
  currentPeriodStart: string
  paymentCustomerId?: string
  paymentSubscriptionId?: string
  status: SubscriptionStatus
}

export type UsageStatusData = {
  canProcess: boolean
  documentsUsed: number
  documentsLimit: number
  planId: string
  planName: string
  message?: string
}

class ApiService {
  private baseUrl: string = config.apiBaseUrl
  private currentUser: UserProfile | null = null
  private authToken: string | null = null

  constructor() {
    this.initializeSession()
  }

  private async initializeSession() {
    try {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      
      if (storedUser && storedToken) {
        this.currentUser = JSON.parse(storedUser)
        this.authToken = storedToken
        
        // Sync token with AGUI client
        aguiClient.setAuthToken(storedToken)
        
        // Verify the session is still valid
        const response = await this.getProfile()
        if (!response.success) {
          this.clearToken()
        }
      }
    } catch (error) {
      console.error("Session initialization error:", error)
      this.clearToken()
    }
  }

  setToken(token: string, user: UserProfile) {
    this.authToken = token
    this.currentUser = user
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token)
      localStorage.setItem('currentUser', JSON.stringify(user))
    }
    // Sync token with AGUI client
    aguiClient.setAuthToken(token)
  }

  clearToken() {
    this.authToken = null
    this.currentUser = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
    }
    // Clear token from AGUI client
    aguiClient.setAuthToken(null)
  }

  private getHeaders(isFormData = false, useApiKey = false): HeadersInit {
    const headers: HeadersInit = {}
    if (!isFormData) headers["Content-Type"] = "application/json"

    if (useApiKey) {
      // Use API key for backend service endpoints
      headers["Authorization"] = `Bearer ${config.apiKey}`
    } else if (this.authToken) {
      // Use user auth token for user-specific endpoints
      headers["Authorization"] = `Bearer ${this.authToken}`
    }
    
    return headers
  }

  // Generic request method
  async request<T>(
    url: string,
    options: RequestInit = {},
    isFormData = false,
    useApiKey = false, // Add parameter to specify if we should use API key
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(isFormData, useApiKey),
          ...options.headers,
        },
      })

      if (!response.ok) {
        let errorData: any = { message: response.statusText }
        try {
          errorData = await response.json()
        } catch (e) {
          /* ignore if not json */
        }
        return {
          success: false,
          error: `API Error: ${response.status} - ${errorData.detail || errorData.message || response.statusText}`,
        }
      }

      const contentType = response.headers.get("content-type")
      let data
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      return {
        success: true,
        data: data,
      }
    } catch (error) {
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: UserProfile }>> {
    try {
      const response = await this.request<{ token: string; user: UserProfile }>(
        `${this.baseUrl}/auth/login`,
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      )

      if (response.success && response.data) {
        this.setToken(response.data.token, response.data.user)
      }

      return response
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
    }
  }

  private validateCorporateEmail(email: string): { isValid: boolean; error?: string } {
    const domain = email.split("@")[1]?.toLowerCase()
    if (!domain) return { isValid: false, error: "Invalid email format" }
    if (config.corporateEmail.blockedDomains.includes(domain)) {
      return { isValid: false, error: config.corporateEmail.message }
    }
    return { isValid: true }
  }

  async register(
    name: string,
    email: string,
    password: string,
    designation: string,
    companyNameInput?: string,
    useCase?: string,
    agreedToTerms?: boolean,
    subscribedToNewsletter?: boolean,
  ): Promise<ApiResponse<{ token: string; user: UserProfile }>> {
    try {
      const emailValidation = this.validateCorporateEmail(email)
      if (!emailValidation.isValid) return { success: false, error: emailValidation.error }
      if (!agreedToTerms) return { success: false, error: "You must agree to the terms and conditions." }

      const response = await this.request<{ token: string; user: UserProfile }>(
        `${this.baseUrl}/auth/register`,
        {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            password,
            designation,
            companyName: companyNameInput,
            useCase,
            agreedToTerms,
            subscribedToNewsletter,
          }),
        }
      )

      if (response.success && response.data) {
        this.setToken(response.data.token, response.data.user)
      }

      return response
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
    }
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    if (!this.authToken) {
      return { success: false, error: "User not authenticated" }
    }

    try {
      return await this.request<UserProfile>(
        `${this.baseUrl}/auth/profile`,
        { method: "GET" }
      )
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      // In a real implementation, you might want to call a logout endpoint
      // For now, we'll just clear the local session
      this.clearToken()
      return { success: true }
    } catch (error) {
      this.clearToken() // Clear token even if logout fails
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
    }
  }

  // --- Service Endpoints ---
  async getServices(): Promise<ApiResponse<ServiceInfo[]>> {
    try {
      return await this.request<ServiceInfo[]>(
        `${this.baseUrl}/services`,
        { method: "GET" },
        false, // isFormData
        true   // useApiKey
      )
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
    }
  }

  async getServiceById(id: string): Promise<ApiResponse<ServiceInfo>> {
    try {
      return await this.request<ServiceInfo>(
        `${this.baseUrl}/services/${id}`,
        { method: "GET" },
        false, // isFormData
        true   // useApiKey
      )
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
    }
  }

  // Other methods remain the same...
  async checkUsageStatus(): Promise<ApiResponse<UsageStatusData>> {
    if (!this.authToken) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      return await this.request<UsageStatusData>(
        `${this.baseUrl}/subscription/usage`,
        { method: "GET" }
      );
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
  }

  async getUserSubscription(): Promise<ApiResponse<UserSubscription>> {
    if (!this.authToken) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      return await this.request<UserSubscription>(
        `${this.baseUrl}/subscription/current`,
        { method: "GET" }
      );
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
  }

  async incrementDocumentUsage(): Promise<ApiResponse<void>> {
    if (!this.authToken) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      return await this.request<void>(
        `${this.baseUrl}/subscription/increment`,
        { method: "POST" }
      );
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
  }

  async processMultipleDocuments(
    serviceId: string,
    files: File[],
    format: string,
    options: Record<string, any> = {},
    requiredFieldsForCustomExtractor?: string[],
  ): Promise<ApiResponse<ProcessingResult>> {
    try {
      const formData = new FormData();
      
      // Add the first file to form data (backend handlers expect single file)
      if (files.length > 0) {
        formData.append('document', files[0]);
      }
      
      // Handle service-specific data
      if (serviceId === 'template-uploader') {
        // For template uploader, we need to send fields as a JSON string
        if (options.requiredFields) {
          formData.append('fields', JSON.stringify(options.requiredFields));
        }
      } else {
        // For other services, add format and options normally
        formData.append('format', format);
        
        // Add options
        Object.keys(options).forEach(key => {
          formData.append(key, options[key]);
        });
        
        // Add required fields for custom extractor if provided
        if (requiredFieldsForCustomExtractor) {
          formData.append('requiredFields', JSON.stringify(requiredFieldsForCustomExtractor));
        }
      }
      
      // Use authenticated processing endpoint if user is logged in
      const endpoint = this.authToken 
        ? `${this.baseUrl}/process-auth/${serviceId}`
        : `${this.baseUrl}/process/${serviceId}`;
      
      const useApiKey = !this.authToken; // Use API key only if not logged in
      
      return await this.request<ProcessingResult>(
        endpoint,
        {
          method: "POST",
          body: formData,
        },
        true, // isFormData
        useApiKey
      );
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      };
    }
  }

  async getProcessingResults(limit = 50, offset = 0): Promise<ApiResponse<ProcessingResult[]>> {
    if (!this.authToken) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      return await this.request<ProcessingResult[]>(
        `${this.baseUrl}/history?limit=${limit}&offset=${offset}`,
        { method: "GET" }
      );
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
  }

  async getProcessingResultById(id: string): Promise<ApiResponse<ProcessingResult>> {
    if (!this.authToken) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      return await this.request<ProcessingResult>(
        `${this.baseUrl}/history/${id}`,
        { method: "GET" }
      );
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
  }

  // --- Template Endpoints ---
  async createTemplate(payload: CreateTemplatePayload): Promise<ApiResponse<any>> {
    // Mock implementation for now
    return { success: true, data: { message: "Template created successfully" } }
  }

  async getTemplates(): Promise<ApiResponse<TemplateListResponse>> {
    // Mock implementation for now
    return { success: true, data: {} }
  }

  async sendVerificationEmail(): Promise<ApiResponse<void>> {
    // Mock implementation for now
    return { success: true }
  }

  async getAnalytics(days: number = 30): Promise<ApiResponse<any>> {
    if (!this.authToken) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      return await this.request<any>(
        `${this.baseUrl}/history/analytics?days=${days}`,
        { method: "GET" }
      );
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
  }

  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    // Mock implementation for now
    return { success: true }
  }

  async resetPassword(userId: string, secret: string, password: string): Promise<ApiResponse<void>> {
    // Mock implementation for now
    return { success: true }
  }
}

export const apiService = new ApiService()