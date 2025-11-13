"use client"

import { useEffect, useState, useMemo } from "react"
import { apiService, type ServiceInfo } from "@/lib/api"
import { ServiceCard } from "@/components/dashboard/service-card"
import { Loader2, AlertCircle, Search, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

export default function ServicesPage() {
  const { user } = useAuth()
  const [services, setServices] = useState<ServiceInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [usage, setUsage] = useState<{ [serviceId: string]: number }>({}) // Mock usage

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await apiService.getServices()
        if (response.success && response.data) {
          setServices(response.data)
        } else {
          setError(response.error || "Failed to load services.")
        }
      } catch (err) {
        setError("An error occurred while fetching services.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchServices()
  }, [])

  const filteredServices = useMemo(() => {
    if (!searchTerm) return services
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [services, searchTerm])

  const groupedServices = useMemo(() => {
    return filteredServices.reduce(
      (acc, service) => {
        const category = service.category || "General"
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(service)
        return acc
      },
      {} as Record<string, ServiceInfo[]>,
    )
  }, [filteredServices])

  if (isLoading && services.length === 0) {
    // Show loader only on initial full load
    return (
      <div className="flex h-full flex-1 items-center justify-center p-4 md:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Services</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col  gap-6 p-4 sm:p-6 md:gap-8 md:p-4">
      <header className="mb-2 md:mb-0">
        {" "}
        {/* Reduced mb for closer search bar */}
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Our Services</h1>
        <p className="text-muted-foreground mt-1 md:text-lg">
          Choose from our suite of AI-powered document processing tools.
        </p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search services by name, description, or category..."
          className="w-full rounded-lg bg-background pl-10 pr-4 py-2 h-11 text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading &&
        services.length > 0 && ( // Show subtle loading indicator when filtering/refetching
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Updating services...</span>
          </div>
        )}

      {Object.keys(groupedServices).length === 0 && !isLoading && (
        <div className="text-center py-10">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-xl font-semibold text-muted-foreground">No services found</p>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search term." : "There are currently no services available."}
          </p>
        </div>
      )}

      {Object.entries(groupedServices).map(([category, servicesInCategory]) => (
        <section key={category} className="pt-2">
          {" "}
          {/* Added pt for spacing from search/loader */}
          <h2 className="text-xl font-semibold tracking-tight mb-3 md:text-2xl md:mb-5 border-b pb-2">{category}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {servicesInCategory.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                usageCount={usage[service.id] || 0} // Replace with real usage
                status="available" // Replace with real status
                disabled={false} // Don't disable services based on auth status
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}