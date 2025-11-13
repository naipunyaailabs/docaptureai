"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Phone, MapPin, Globe, Building2, Users, CheckCircle } from "lucide-react"
import { config } from "@/lib/config"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    industry: "",
    documentVolume: "",
    requirements: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
              <p className="text-muted-foreground mb-6">
                Your inquiry has been received. Our automation experts will contact you within 24 hours to discuss your
                document processing requirements.
              </p>
              <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <a href="/">Return to Home</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-muted/30 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Get Custom {config.appName} Solutions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Partner with {config.company.name} for intelligent document processing automation tailored to your
              business needs
            </p>
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Building2 className="h-5 w-5" />
              <span>{config.company.description}</span>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Request Custom Quote</CardTitle>
                  <CardDescription>
                    Tell us about your document processing needs and we'll create a tailored solution for your
                    organization.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Corporate Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="your.email@company.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name *</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleChange("company", e.target.value)}
                          placeholder="Your company name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry *</Label>
                        <Select value={formData.industry} onValueChange={(value) => handleChange("industry", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {config.company.industries.map((industry) => (
                              <SelectItem key={industry} value={industry.toLowerCase()}>
                                {industry}
                              </SelectItem>
                            ))}
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="documentVolume">Monthly Document Volume</Label>
                        <Select
                          value={formData.documentVolume}
                          onValueChange={(value) => handleChange("documentVolume", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select volume range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-100">1-100 documents</SelectItem>
                            <SelectItem value="101-500">101-500 documents</SelectItem>
                            <SelectItem value="501-1000">501-1,000 documents</SelectItem>
                            <SelectItem value="1001-5000">1,001-5,000 documents</SelectItem>
                            <SelectItem value="5000+">5,000+ documents</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requirements">Specific Requirements</Label>
                      <Textarea
                        id="requirements"
                        value={formData.requirements}
                        onChange={(e) => handleChange("requirements", e.target.value)}
                        placeholder="Document types, integration needs, compliance requirements, etc."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Tell us more about your project or any questions you have..."
                        rows={4}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-blue-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Get Custom Quote"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-yellow-500" />
                    {config.company.name}
                  </CardTitle>
                  <CardDescription>{config.company.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a
                          href={`mailto:${config.company.email}`}
                          className="text-muted-foreground hover:text-yellow-500 transition-colors"
                        >
                          {config.company.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a
                          href={`tel:${config.company.phone}`}
                          className="text-muted-foreground hover:text-yellow-500 transition-colors"
                        >
                          {config.company.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Globe className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a
                          href={config.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-yellow-500 transition-colors"
                        >
                          cognitbotz.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">
                          {config.company.address.street}
                          <br />
                          {config.company.address.city}, {config.company.address.state} {config.company.address.zip}
                          <br />
                          {config.company.address.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-yellow-500" />
                    Our Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Our team of highly skilled experts consists of automation consultants, developers, data scientists,
                    and business analysts with extensive experience in delivering intelligent automation solutions.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Industries We Serve:</h4>
                    <div className="flex flex-wrap gap-2">
                      {config.company.industries.map((industry) => (
                        <span
                          key={industry}
                          className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-sm"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Response Guarantee:</strong> Our automation experts will respond to your inquiry within 24
                  hours with a detailed consultation proposal.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
