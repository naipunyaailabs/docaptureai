"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiService, type UserProfile } from "@/lib/api"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (
    name: string,
    email: string,
    password: string,
    designation: string,
    companyName?: string,
    useCase?: string,
    agreedToTerms?: boolean,
    subscribedToNewsletter?: boolean,
  ) => Promise<boolean>
  logout: () => Promise<void>
  error: string | null
  sendVerificationEmail: () => Promise<boolean>
  resetPassword: (userId: string, secret: string, password: string) => Promise<boolean>
  requestPasswordReset: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  error: null,
  sendVerificationEmail: async () => false,
  resetPassword: async () => false,
  requestPasswordReset: async () => false,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      try {
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null
        
        if (storedUser) {
          const response = await apiService.getProfile()
          if (response.success && response.data) {
            setUser(response.data)
            apiService.setToken(localStorage.getItem('authToken') || '', response.data)
          } else {
            localStorage.removeItem('currentUser')
            localStorage.removeItem('authToken')
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (err: any) {
        localStorage.removeItem('currentUser')
        localStorage.removeItem('authToken')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const response = await apiService.login(email, password)
      if (response.success && response.data) {
        setUser(response.data.user)
        return true
      } else {
        setError(response.error || "Login failed")
        return false
      }
    } catch (err: any) {
      setError("An unexpected error occurred")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    designation: string,
    companyName?: string,
    useCase?: string,
    agreedToTerms?: boolean,
    subscribedToNewsletter?: boolean,
  ) => {
    setError(null)
    setIsLoading(true)
    try {
      const response = await apiService.register(
        name,
        email,
        password,
        designation,
        companyName,
        useCase,
        agreedToTerms,
        subscribedToNewsletter,
      )
      
      if (response.success && response.data) {
        setUser(response.data.user)
        return true
      } else {
        // Handle specific error cases
        let errorMessage = response.error || "Registration failed"
        
        // Map common error messages to user-friendly messages
        if (errorMessage.includes("user_already_exists")) {
          errorMessage = "An account with this email already exists"
        } else if (errorMessage.includes("invalid_credentials")) {
          errorMessage = "Invalid email or password"
        } else if (errorMessage.includes("user_invalid_email")) {
          errorMessage = "Invalid email format"
        } else if (errorMessage.includes("user_invalid_password")) {
          errorMessage = "Password must be at least 8 characters long"
        }
        
        setError(errorMessage)
        return false
      }
    } catch (err: any) {
      if (err?.message) {
        setError(err.message)
      } else if (err?.error) {
        setError(err.error)
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await apiService.logout()
    } catch (err: any) {
      // Error handling
    } finally {
      setUser(null)
      router.push("/")
      setIsLoading(false)
    }
  }

  const sendVerificationEmail = async () => {
    setError(null)
    try {
      const response = await apiService.sendVerificationEmail()
      if (response.success) {
        return true
      } else {
        setError(response.error || "Failed to send verification email.")
        return false
      }
    } catch (err: any) {
      setError("An unexpected error occurred.")
      return false
    }
  }

  const requestPasswordReset = async (email: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const response = await apiService.requestPasswordReset(email)
      if (response.success) {
        return true
      } else {
        setError(response.error || "Failed to send reset email")
        return false
      }
    } catch (err: any) {
      setError("An unexpected error occurred")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (userId: string, secret: string, password: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const response = await apiService.resetPassword(userId, secret, password)
      if (response.success) {
        return true
      } else {
        setError(response.error || "Failed to reset password")
        return false
      }
    } catch (err: any) {
      setError("An unexpected error occurred")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        error,
        sendVerificationEmail,
        resetPassword,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}