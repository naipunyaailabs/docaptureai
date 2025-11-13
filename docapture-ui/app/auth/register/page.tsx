"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, Moon, Sun } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { config } from "@/lib/config"
import { CurrentLogo } from "@/components/CurrentLogo"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context" 
import { useToastContext } from "@/contexts/toast-context"

export default function RegisterPage() {    
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    designation: "",
    companyName: "",
    useCase: "",
  })
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { register, error: authError } = useAuth()
  const { theme, setTheme } = useTheme()
  const { showSuccess, showError } = useToastContext()

  const validateForm = () => {
    console.log('Validating form...');
    const newErrors: Record<string, string> = {}
    let hasErrors = false;

    // Email validation for corporate emails
    const isCorporateEmail = (email: string) => {
      // List of common personal email domains to block
      const personalDomains = [
        'gmail.com',
        'yahoo.com',
        'hotmail.com',
        'outlook.com',
        'aol.com',
        'icloud.com',
        'mail.com',
        'protonmail.com',
        'zoho.com',
        'yandex.com',
        'gmx.com',
        'live.com',
        'me.com',
        'msn.com',
        'inbox.com'
      ];
      
      const domain = email.split('@')[1]?.toLowerCase();
      return domain && !personalDomains.includes(domain);
    };

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required"
      showError("Validation Error", "Full name is required")
      hasErrors = true;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      showError("Validation Error", "Email is required")
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
      showError("Validation Error", "Invalid email format")
      hasErrors = true;
    } else if (!isCorporateEmail(formData.email)) {
      newErrors.email = "Please use a corporate email address"
      showError("Invalid Email", "Personal email addresses are not allowed. Please use your corporate email.")
      hasErrors = true;
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
      showError("Validation Error", "Password is required")
      hasErrors = true;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      showError("Validation Error", "Password must be at least 8 characters")
      hasErrors = true;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      showError("Validation Error", "Passwords do not match")
      hasErrors = true;
    }

    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required"
      showError("Validation Error", "Designation is required")
      hasErrors = true;
    }

    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions"
      showError("Validation Error", "You must agree to the terms and conditions")
      hasErrors = true;
    }

    setErrors(newErrors)
    return !hasErrors;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submission started...')
    
    // Clear any existing errors
    setErrors({})
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors)
      return
    }

    console.log('Form validation passed, starting registration...')
    setIsLoading(true)

    try {
      console.log('Attempting registration with data:', {
        name: formData.name,
        email: formData.email,
        designation: formData.designation,
        companyName: formData.companyName,
        useCase: formData.useCase,
        agreedToTerms: agreeToTerms,
        subscribedToNewsletter: subscribeToNewsletter
      })

      const success = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.designation,
        formData.companyName,
        formData.useCase,
        agreeToTerms,
        subscribeToNewsletter,
      )

      if (success) {
        showSuccess("Success!", "Registration successful. Redirecting to dashboard...")
        router.push("/dashboard")
      } else {
        // Show the error from auth context
        if (authError) {
          console.log('Registration failed with error:', authError)
          showError("Registration Failed", getErrorMessage(authError))
        } else {
          showError("Registration Failed", "Please check your details and try again.")
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      showError("Error", getErrorMessage(err))
    } finally {
      setIsLoading(false)
      console.log('Registration process completed')
    }
  }

  // Helper function to handle error messages
  const getErrorMessage = (error: any): string => {
    // If the error has a message, use it
    if (error.message) {
      return error.message;
    }

    // If the error is a string, use it directly
    if (typeof error === 'string') {
      return error;
    }

    // Default error message
    return 'An unexpected error occurred. Please try again.';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-cyan-500 dark:text-cyan-400">
            <CurrentLogo />
          </Link>
          
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-brand-primary to-yellow-800 bg-clip-text text-transparent">
              Start Your Free Trial
            </h1>
            <p className="text-muted-foreground text-lg">
              Create your account with a corporate email address.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {errors.form && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="font-medium whitespace-pre-wrap">
                  {errors.form}
                </AlertDescription>
              </Alert>
            )}

            {/* Main grid for all sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="bg-card rounded-xl   p-6  border border-yellow-600/80 hover:border-brand-primary/60 transition-colors">
                <h3 className="text-lg font-semibold mb-4 text-yellow-500">Personal Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className={cn(
                        "w-full transition-colors",
                        errors.name && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Corporate Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      required
                      className={cn(
                        "w-full transition-colors",
                        errors.email && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email}</p>}
                    <p className="text-xs text-muted-foreground">
                      Personal email providers (Gmail, Yahoo, etc.) are not allowed. Please use your company email address.
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-card rounded-xl   p-6  border border-yellow-600/80 hover:border-brand-primary/60 transition-colors">
                <h3 className="text-lg font-semibold mb-4 text-yellow-500">Professional Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="designation" className="text-sm font-medium">
                      Designation <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="designation"
                      name="designation"
                      type="text"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="e.g., Software Engineer"
                      required
                      className={cn(
                        "w-full transition-colors",
                        errors.designation && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.designation && <p className="text-sm text-red-500 font-medium">{errors.designation}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Your Company Inc."
                      className={cn(
                        "w-full transition-colors",
                        errors.companyName && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-card rounded-xl   p-6  border border-yellow-600/80 hover:border-brand-primary/60 transition-colors">
                <h3 className="text-lg font-semibold mb-4 text-yellow-500">Additional Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="useCase" className="text-sm font-medium">Primary Use Case (Optional)</Label>
                    <Textarea
                      id="useCase"
                      name="useCase"
                      value={formData.useCase}
                      onChange={handleChange}
                      placeholder="How do you plan to use our service? (e.g., Invoice processing, KYC verification)"
                      className={cn(
                        "w-full min-h-[100px] transition-colors",
                        errors.useCase && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="bg-card rounded-xl   p-6  border border-yellow-600/80 hover:border-brand-primary/60 transition-colors col-span-1 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-4 text-yellow-500">Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        required
                        className={cn(
                          "w-full transition-colors",
                          errors.password && "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-yellow-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      className={cn(
                        "w-full transition-colors",
                        errors.confirmPassword && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-500 font-medium">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-card rounded-xl   p-6  border border-yellow-600/80 hover:border-brand-primary/60 transition-colors col-span-1 md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-4 text-yellow-500">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="agreeToTerms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      className="border-brand-primary data-[state=checked]:bg-brand-primary data-[state=checked]:text-brand-secondary"
                    />
                    <Label
                      htmlFor="agreeToTerms"
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{" "}
                      <Link
                        href="/privacy-policy"
                        className="font-medium text-yellow-500 hover:text-yellow-500"
                        target="_blank"
                      >
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/terms-and-conditions"
                        className="font-medium text-yellow-500 hover:text-yellow-500"
                        target="_blank"
                      >
                        Terms & Conditions
                      </Link>
                      . <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="subscribeToNewsletter"
                      checked={subscribeToNewsletter}
                      onCheckedChange={(checked) => setSubscribeToNewsletter(checked as boolean)}
                      className="border-brand-primary data-[state=checked]:bg-brand-primary data-[state=checked]:text-brand-secondary"
                    />
                    <Label
                      htmlFor="subscribeToNewsletter"
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Subscribe to our newsletter for updates and offers.
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 mt-6">
              <Button
                type="submit"
                className="w-full max-w-md bg-brand-primary hover:bg-brand-primary/90 text-black py-6 text-lg rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                disabled={isLoading || !agreeToTerms}
                aria-disabled={isLoading || !agreeToTerms}
                aria-label={isLoading ? "Processing registration" : "Start your free trial"}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2" role="status">
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span>Starting Trial...</span>
                  </div>
                ) : (
                  "Start Your Free Trial"
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  href="/auth/login" 
                  className="font-medium text-yellow-500 hover:text-yellow-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                  aria-label="Sign in to your account"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}