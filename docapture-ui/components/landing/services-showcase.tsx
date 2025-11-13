"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  Table,
  FileSearch,
  FileBarChart,
  FileCheck,
  FileCode,
  Brain,
  ListChecks,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { apiService } from "@/lib/api"

export function ServicesShowcase() {
  const [hoveredService, setHoveredService] = useState<string | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiService.getServices()
        if (response.success && response.data) {
          setServices(response.data.slice(0, 6)) // Show only first 6 services
        }
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "FileText":
        return <FileText className="h-8 w-8" />
      case "Table":
        return <Table className="h-8 w-8" />
      case "FileSearch":
        return <FileSearch className="h-8 w-8" />
      case "FileBarChart":
        return <FileBarChart className="h-8 w-8" />
      case "FileCheck":
        return <FileCheck className="h-8 w-8" />
      case "FileCode":
        return <FileCode className="h-8 w-8" />
      case "Brain":
        return <Brain className="h-8 w-8" />
      case "ListChecks":
        return <ListChecks className="h-8 w-8" />
      default:
        return <FileText className="h-8 w-8" />
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-brand-primary to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Intelligent Document Processing Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered extraction services handle a wide range of document types with exceptional accuracy
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <Card key={index} className="h-full overflow-hidden">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-8 w-8 bg-muted rounded mb-4"></div>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-brand-primary to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Intelligent Document Processing Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered extraction services handle a wide range of document types with exceptional accuracy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
            >
              <Card
                className={`h-full overflow-hidden transition-all duration-300 ${
                  hoveredService === service.id
                    ? "shadow-lg border-brand-primary transform -translate-y-1"
                    : "shadow border-border"
                }`}
              >
                <CardContent className="p-0">
                  <div
                    className={`h-3 w-full transition-all duration-300 ${
                      hoveredService === service.id
                        ? "bg-brand-primary"
                        : "bg-primary"
                    }`}
                  ></div>
                  <div className="p-6">
                    <div className="mb-4 relative">
                      <div
                        className={`p-3 rounded-lg inline-flex transition-all duration-300 ${
                          hoveredService === service.id
                            ? "bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20"
                            : "bg-muted"
                        }`}
                      >
                        <div className="text-brand-primary ">{getIconComponent(service.icon)}</div>
                      </div>
                      <motion.div
                        className="absolute -z-10 inset-0 rounded-lg opacity-80 blur-xl"
                        animate={{
                          background:
                            hoveredService === service.id
                              ? [
                                  "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.1) 0%, rgba(59, 130, 246, 0) 70%)",
                                  "radial-gradient(circle at 60% 40%, rgba(34, 211, 238, 0.15) 0%, rgba(59, 130, 246, 0) 70%)",
                                  "radial-gradient(circle at 40% 60%, rgba(34, 211, 238, 0.1) 0%, rgba(59, 130, 246, 0) 70%)",
                                ]
                              : "none",
                        }}
                        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.supportedFileTypes.slice(0, 4).map((type: string) => (
                        <span
                          key={`${service.id}-${type}`}
                          className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                        >
                          {type}
                        </span>
                      ))}
                      {service.supportedFileTypes.length > 4 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          +{service.supportedFileTypes.length - 4} more
                        </span>
                      )}
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      className="p-0 h-auto text-brand-primary hover:bg-transparent hover:text-brand-primary"
                    >
                      <Link href="/auth/register">
                        Try this service <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" className="bg-brand-primary  text-white">
            <Link href="/auth/register">Get Started with All Services</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}