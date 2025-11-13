"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiService = exports.SubscriptionStatus = void 0;
const config_1 = require("./config");
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["Trial"] = "trial";
    SubscriptionStatus["Active"] = "active";
    SubscriptionStatus["Cancelled"] = "cancelled";
    SubscriptionStatus["Expired"] = "expired";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
class ApiService {
    constructor() {
        this.baseUrl = config_1.config.apiBaseUrl;
        this.currentUser = null;
        this.authToken = null;
        this.initializeSession();
    }
    async initializeSession() {
        try {
            const storedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
            const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            if (storedUser && storedToken) {
                this.currentUser = JSON.parse(storedUser);
                this.authToken = storedToken;
                // Verify the session is still valid
                const response = await this.getProfile();
                if (!response.success) {
                    this.clearToken();
                }
            }
        }
        catch (error) {
            console.error("Session initialization error:", error);
            this.clearToken();
        }
    }
    setToken(token, user) {
        this.authToken = token;
        this.currentUser = user;
        if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
    }
    clearToken() {
        this.authToken = null;
        this.currentUser = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
        }
    }
    getHeaders(isFormData = false, useApiKey = false) {
        const headers = {};
        if (!isFormData)
            headers["Content-Type"] = "application/json";
        if (useApiKey) {
            // Use API key for backend service endpoints
            headers["Authorization"] = `Bearer ${config_1.config.apiKey}`;
        }
        else if (this.authToken) {
            // Use user auth token for user-specific endpoints
            headers["Authorization"] = `Bearer ${this.authToken}`;
        }
        return headers;
    }
    // Generic request method
    async request(url, options = {}, isFormData = false, useApiKey = false) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getHeaders(isFormData, useApiKey),
                    ...options.headers,
                },
            });
            if (!response.ok) {
                let errorData = { message: response.statusText };
                try {
                    errorData = await response.json();
                }
                catch (e) {
                    /* ignore if not json */
                }
                return {
                    success: false,
                    error: `API Error: ${response.status} - ${errorData.detail || errorData.message || response.statusText}`,
                };
            }
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            }
            else {
                data = await response.text();
            }
            return {
                success: true,
                data: data,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    // --- Auth Endpoints ---
    async login(email, password) {
        try {
            const response = await this.request(`${this.baseUrl}/auth/login`, {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            if (response.success && response.data) {
                this.setToken(response.data.token, response.data.user);
            }
            return response;
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
        }
    }
    validateCorporateEmail(email) {
        const domain = email.split("@")[1]?.toLowerCase();
        if (!domain)
            return { isValid: false, error: "Invalid email format" };
        if (config_1.config.corporateEmail.blockedDomains.includes(domain)) {
            return { isValid: false, error: config_1.config.corporateEmail.message };
        }
        return { isValid: true };
    }
    async register(name, email, password, designation, companyNameInput, useCase, agreedToTerms, subscribedToNewsletter) {
        try {
            const emailValidation = this.validateCorporateEmail(email);
            if (!emailValidation.isValid)
                return { success: false, error: emailValidation.error };
            if (!agreedToTerms)
                return { success: false, error: "You must agree to the terms and conditions." };
            const response = await this.request(`${this.baseUrl}/auth/register`, {
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
            });
            if (response.success && response.data) {
                this.setToken(response.data.token, response.data.user);
            }
            return response;
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
        }
    }
    async getProfile() {
        if (!this.authToken) {
            return { success: false, error: "User not authenticated" };
        }
        try {
            return await this.request(`${this.baseUrl}/auth/profile`, { method: "GET" });
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
        }
    }
    async logout() {
        try {
            // In a real implementation, you might want to call a logout endpoint
            // For now, we'll just clear the local session
            this.clearToken();
            return { success: true };
        }
        catch (error) {
            this.clearToken(); // Clear token even if logout fails
            return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
        }
    }
    // --- Service Endpoints ---
    async getServices() {
        try {
            return await this.request(`${this.baseUrl}/services`, { method: "GET" }, false, // isFormData
            true // useApiKey
            );
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
        }
    }
    async getServiceById(id) {
        try {
            return await this.request(`${this.baseUrl}/services/${id}`, { method: "GET" }, false, // isFormData
            true // useApiKey
            );
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
        }
    }
    // Other methods remain the same...
    async checkUsageStatus() {
        try {
            return await this.request(`${this.baseUrl}/subscription/usage`, { method: "GET" });
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
        }
    }
    async getUserSubscription() {
        try {
            return await this.request(`${this.baseUrl}/subscription/current`, { method: "GET" });
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
        }
    }
    async incrementDocumentUsage() {
        // Mock implementation for now
        return { success: true };
    }
    async processMultipleDocuments(serviceId, files, format, options = {}, requiredFieldsForCustomExtractor) {
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
                // Add other template-specific fields if needed
                // Note: The backend doesn't currently use templateName or vendorName
            }
            else {
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
            return await this.request(`${this.baseUrl}/process/${serviceId}`, {
                method: "POST",
                body: formData,
            }, true, // isFormData
            true // useApiKey
            );
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "An unexpected error occurred"
            };
        }
    }
    async getProcessingResults(limit = 10, offset = 0) {
        try {
            return await this.request(`${this.baseUrl}/history?limit=${limit}&offset=${offset}`, { method: "GET" });
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
        }
    }
    async getProcessingResultById(id) {
        try {
            return await this.request(`${this.baseUrl}/history/${id}`, { method: "GET" });
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
        }
    }

    async getAnalytics(days = 30) {
        try {
            return await this.request(`${this.baseUrl}/history/analytics?days=${days}`, { method: "GET" });
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
        }
    }
    // --- Template Endpoints ---
    async createTemplate(payload) {
        // Mock implementation for now
        return { success: true, data: { message: "Template created successfully" } };
    }
    async getTemplates() {
        // Mock implementation for now
        return { success: true, data: {} };
    }
    async sendVerificationEmail() {
        // Mock implementation for now
        return { success: true };
    }
    async requestPasswordReset(email) {
        // Mock implementation for now
        return { success: true };
    }
    async resetPassword(userId, secret, password) {
        // Mock implementation for now
        return { success: true };
    }

    async updateProfile(userData) {
        try {
            return await this.request(`${this.baseUrl}/auth/profile`, {
                method: "PUT",
                body: JSON.stringify(userData),
            });
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
        }
    }
}
exports.apiService = new ApiService();
//# sourceMappingURL=api.js.map