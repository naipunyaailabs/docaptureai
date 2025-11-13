"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToastContext } from "@/contexts/toast-context"
import { config } from "@/lib/config"
import Image from "next/image"
import { CurrentLogo } from "@/components/CurrentLogo"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, requestPasswordReset } = useAuth()
  const { showSuccess, showError } = useToastContext()

  useEffect(() => {
    // In a real implementation, you would check if the user is already authenticated
    // For now, we'll just set it to false
    setIsAuthenticated(false)
  }, [router])

  // Form validation
  const validateForm = () => {
    if (!formData.email.trim()) {
      showError("Validation Error", "Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showError("Validation Error", "Invalid email format")
      return false
    }
    if (!formData.password) {
      showError("Validation Error", "Password is required")
      return false
    }
    return true
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        showSuccess("Success!", "Login successful. Redirecting to dashboard...")
        // Check if there's a redirect parameter
        const redirect = searchParams.get('redirect')
        if (redirect) {
          router.push(redirect)
        } else {
          router.push("/dashboard")
        }
      } else {
        showError("Login Failed", "Invalid email or password")
      }
    } catch (err) {
      // More specific error handling
      let errorMessage = "An unexpected error occurred. Please try again."
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      
      showError("Login Error", errorMessage)
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      showError("Validation Error", "Please enter your email address")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showError("Validation Error", "Invalid email format")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const success = await requestPasswordReset(formData.email)
      if (success) {
        showSuccess("Success!", "Password reset instructions have been sent to your email address.")
        setResetEmailSent(true)
      } else {
        showError("Reset Failed", "Failed to send reset email. Please try again.")
      }
    } catch (err) {
      let errorMessage = "Failed to send reset email. Please try again."
      
      if (err instanceof Error) {
        errorMessage = err.message
      }
      
      showError("Reset Error", errorMessage)
      console.error("Password reset error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center mb-4">
            <CurrentLogo />
          </Link>
          <CardTitle>{showForgotPassword ? "Reset Password" : "Welcome back"}</CardTitle>
          <CardDescription>
            {showForgotPassword 
              ? "Enter your email to receive a password reset link"
              : "Sign in with your corporate email to continue"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetEmailSent ? (
            <Alert className="bg-green-500/10 border-green-500">
              <AlertDescription className="text-green-600 dark:text-green-400">
                Password reset instructions have been sent to your email address.
              </AlertDescription>
            </Alert>
          ) : showForgotPassword ? (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-500 bg-red-500/10">
                  <AlertDescription className="text-red-500 dark:text-red-400">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Login
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-brand-secondary"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-500 bg-red-500/10">
                  <AlertDescription className="text-red-500 dark:text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your corporate email"
                  required
                  aria-invalid={!!error}
                  aria-describedby={error ? "email-error" : undefined}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="pr-10"
                    aria-invalid={!!error}
                    aria-describedby={error ? "password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="text-brand-primary hover:text-brand-primary/90"
                  onClick={() => setShowForgotPassword(true)}
                  disabled={isLoading}
                >
                  Forgot password?
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-brand-secondary" 
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/auth/register" className="text-brand-primary dark:text-brand-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}