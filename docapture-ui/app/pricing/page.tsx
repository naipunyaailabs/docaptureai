import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Mail, Phone, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const features = [
    "Unlimited document processing",
    "All AI extraction services",
    "Custom field extraction",
    "Template management",
    "Priority support",
    "Advanced security",
    "Custom integrations",
    "Dedicated account manager",
    "SLA guarantees",
    "On-premise deployment options",
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get a detailed quote via email",
      action: "sales@docapture.com",
      href: "mailto:sales@docapture.com",
    },
    {
      icon: Phone,
      title: "Schedule a Call",
      description: "Book a consultation with our team",
      action: "Schedule Demo",
      href: "/contact",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our sales team",
      action: "Start Chat",
      href: "/contact",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Custom Pricing for Your Business</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every business has unique document processing needs. We create tailored solutions with pricing that fits
            your requirements and scale.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl">Enterprise Solution</CardTitle>
              <CardDescription className="text-lg mt-2">
                Tailored to your business requirements
              </CardDescription>
              <div className="mt-6">
                <span className="text-4xl font-bold">Custom Pricing</span>
                <p className="mt-2">Based on your volume and requirements</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">What's Included:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 mr-3 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold mb-6 text-center">Get Your Custom Quote</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {contactMethods.map((method, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6 text-center">
                        <method.icon className="h-8 w-8 mx-auto mb-3" />
                        <h4 className="font-semibold mb-2">{method.title}</h4>
                        <p className="text-sm mb-4">{method.description}</p>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full"
                        >
                          <Link href={method.href}>{method.action}</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="bg-secondary rounded-lg p-6 border">
                <h4 className="font-semibold mb-2">Why Custom Pricing?</h4>
                <ul className="text-sm space-y-1">
                  <li>• Document volume varies significantly between businesses</li>
                  <li>• Different industries require specialized processing capabilities</li>
                  <li>• Integration complexity and support needs differ</li>
                  <li>• We ensure you only pay for what you actually need</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="mb-6">
              Contact our sales team to discuss your requirements and get a personalized quote.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">Contact Sales Team</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
