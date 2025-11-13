"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from "next/navigation"
import { DynamicServicePage } from "@/components/dynamic-service-page"
import { apiService, type ServiceInfo } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function ServicePage({ params }: { params: { serviceId: string } }) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [service, setService] = useState<ServiceInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch service details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      setIsLoading(true)
      try {
        const response = await apiService.getServiceById(params.serviceId)
        if (response.success && response.data) {
          setService(response.data)
        } else {
          setError("Service not found")
        }
      } catch (err) {
        setError("An error occurred while fetching service details")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (isAuthenticated && params.serviceId) {
      fetchServiceDetails()
    }
  }, [isAuthenticated, params.serviceId])

  // Handle loading state
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
      </div>
    )
  }
  
  // Handle initial loading
  if (isLoading && !service) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
        </main>
      </div>
    )
  }
  
  // Handle error state
  if (error && !service) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
            <h2 className="text-xl font-semibold text-destructive mb-2">Service not found</h2>
            <p className="text-destructive">{error}</p>
            <button 
              onClick={() => router.push("/dashboard/services")}
              className="mt-4 px-4 py-2 bg-destructive text-white rounded hover:bg-destructive/90"
            >
              Back to Services
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Render the dynamic service page
  return service ? <DynamicServicePage service={service} /> : null
}
