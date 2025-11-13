import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Zap, DollarSign, Server, FileText, Download, Building2, Scale, Lock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import Image from "next/image"

export const metadata: Metadata = {
  title: "About docapture - AI-Powered Document Extraction with No Per-Page Pricing",
  description:
    "Discover how docapture revolutionizes document processing with AI-driven extraction, one-time setup costs, GDPR compliance, and on-premise deployment options. No usage limits, full data ownership.",
  keywords: [
    "AI document extraction",
    "GDPR compliant document processing",
    "on-premise document extraction",
    "no per-page pricing",
    "OCR technology",
    "document automation",
    "data sovereignty",
    "enterprise document processing",
  ],
  openGraph: {
    title: "About docapture - AI Document Extraction Platform",
    description:
      "AI-powered document extraction with no usage limits, GDPR compliance, and on-premise deployment options.",
    type: "website",
    url: "https://docaptureai.com/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About docapture - AI Document Extraction Platform",
    description:
      "AI-powered document extraction with no usage limits, GDPR compliance, and on-premise deployment options.",
  },
  alternates: {
        canonical: "https://docaptureai.com/about",
  },
}

const features = [
  {
    icon: Zap,
    title: "No Usage Limits",
    description:
      "Enjoy unrestricted processing — extract from thousands or millions of documents without any hidden charges.",
  },
  {
    icon: DollarSign,
    title: "One-Time Setup Cost",
    description: "Pay once, own forever. Perfect for organizations that want long-term ROI and predictable budgeting.",
  },
  {
    icon: Server,
    title: "On-Premise or Cloud",
    description:
      "Deploy on your own servers for maximum data privacy, security, and compliance — or use our managed cloud solution.",
  },
  {
    icon: Shield,
    title: "GDPR & Data Ownership",
    description:
      "Your data, your rules. We do not store or access any of your files. Full data sovereignty for regulated industries.",
  },
  {
    icon: FileText,
    title: "Intelligent AI Models",
    description:
      "Use state-of-the-art OCR, natural language processing, and computer vision to extract tables, fields, signatures, and more.",
  },
  {
    icon: Download,
    title: "Output to Any Format",
    description: "Export structured data to Excel, JSON, CSV, or directly to your database or API.",
  },
]

const idealFor = [
  {
    icon: Building2,
    title: "Enterprises",
    description: "High-volume document processing needs",
  },
  {
    icon: Scale,
    title: "Regulated Industries",
    description: "Legal, finance, healthcare, and education sectors",
  },
  {
    icon: Lock,
    title: "Compliance-First",
    description: "Organizations with strict compliance or localization mandates",
  },
  {
    icon: DollarSign,
    title: "Cost-Conscious",
    description: "Businesses seeking to eliminate unpredictable operational costs",
  },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5 z-0"></div>
          <div className="absolute right-0 top-1/4 w-64 h-64 bg-brand-primary/10 rounded-full filter blur-3xl"></div>
          <div className="absolute left-0 bottom-1/4 w-64 h-64 bg-brand-accent/10 rounded-full filter blur-3xl"></div>

          <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
              <Badge
                variant="outline"
                className="mb-6 px-4 py-1.5 text-sm font-medium border-brand-primary/30 bg-brand-primary/5"
              >
                <span className="mr-1">🚀</span> AI-Powered Document Extraction
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                No Per-Page Pricing, <span className="text-brand-primary">Full Ownership</span>
              </h1>

              <div className="inline-flex items-center justify-center gap-2 mb-8 px-4 py-2 rounded-full bg-green-50 border border-green-100">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-base md:text-lg font-medium text-green-700">
                  GDPR Compliant & On-Premise Ready
                </span>
              </div>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Say goodbye to costly per-page pricing! Our AI-driven document extraction solution offers a one-time
                setup with no usage limits — giving you the freedom to scale without breaking the bank.
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-brand-accent/20 rounded-3xl transform rotate-1 scale-[1.03] blur-sm"></div>
              <Card className="relative border border-border/40 shadow-lg rounded-2xl overflow-hidden backdrop-blur-sm bg-card/90">
                <CardContent className="p-6 md:p-8 lg:p-10">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/2">
                      <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
                        Whether you're processing invoices, legal documents, contracts, or academic records, we give you
                        total control of your data with on-premise deployment options that meet even the strictest GDPR
                        compliance requirements.
                      </p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Badge className="bg-brand-primary/10 text-foreground border-brand-primary/20 px-3 py-1">
                          Invoices
                        </Badge>
                        <Badge className="bg-brand-primary/10 text-foreground border-brand-primary/20 px-3 py-1">
                          Contracts
                        </Badge>
                        <Badge className="bg-brand-primary/10 text-foreground border-brand-primary/20 px-3 py-1">
                          Legal Documents
                        </Badge>
                        <Badge className="bg-brand-primary/10 text-foreground border-brand-primary/20 px-3 py-1">
                          Academic Records
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 flex justify-center">
                      <div className="relative w-full max-w-xs mt-20 aspect-square">
                        <Image
                          src="/doc-extraction-illustration.png"
                          alt="Document extraction illustration"
                          width={300}
                          height={500}
                          className="object-cover clip-path-polygon-100%  "
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <Badge
                variant="outline"
                className="mb-4 px-3 py-1 text-sm font-medium border-brand-primary/30 bg-brand-primary/5"
              >
                Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Our Document Extraction Platform?</h2>
              <div className="w-24 h-1 bg-brand-primary mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-border/40 overflow-hidden"
                >
                  <div className="absolute h-1 left-0 right-0 top-0 bg-gradient-to-r from-brand-primary to-brand-accent transform origin-left transition-transform duration-300 group-hover:scale-x-100 scale-x-0"></div>
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center mb-4">
                      <div className="p-2.5 bg-brand-primary text-primary-foreground rounded-lg mr-4 shadow-sm">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Ideal For Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <Badge
                variant="outline"
                className="mb-4 px-3 py-1 text-sm font-medium border-brand-primary/30 bg-brand-primary/5"
              >
                Perfect Match
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ideal For Your Industry</h2>
              <div className="w-24 h-1 bg-brand-primary mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {idealFor.map((item, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-border/40 overflow-hidden"
                >
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex p-3 bg-brand-accent/10 text-brand-accent rounded-full mb-5 group-hover:bg-brand-accent group-hover:text-white transition-colors duration-300">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="text-center p-6 md:p-8 rounded-xl bg-background border border-border/40 shadow-sm">
                <div className="text-4xl md:text-5xl font-bold text-brand-primary mb-2">100%</div>
                <p className="text-lg font-medium">Data Ownership</p>
                <p className="text-sm text-muted-foreground mt-2">Your data never leaves your control</p>
              </div>
              <div className="text-center p-6 md:p-8 rounded-xl bg-background border border-border/40 shadow-sm">
                <div className="text-4xl md:text-5xl font-bold text-brand-primary mb-2">∞</div>
                <p className="text-lg font-medium">Unlimited Processing</p>
                <p className="text-sm text-muted-foreground mt-2">No per-page or volume restrictions</p>
              </div>
              <div className="text-center p-6 md:p-8 rounded-xl bg-background border border-border/40 shadow-sm">
                <div className="text-4xl md:text-5xl font-bold text-brand-primary mb-2">99.9%</div>
                <p className="text-lg font-medium">Extraction Accuracy</p>
                <p className="text-sm text-muted-foreground mt-2">State-of-the-art AI models</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-accent opacity-90 z-0"></div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] opacity-10 mix-blend-overlay"></div>

          <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Let's Transform Your Document Processing
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                Ready to own your document extraction pipeline with zero usage fees and full compliance? Contact us for
                a personalized demo or pricing consultation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-brand-primary hover:bg-white/90 hover:text-brand-primary/90"
                >
                  <Link href="/contact">Get Personalized Demo</Link>
                </Button>
                {/* <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href="/pricing">View Pricing</Link>
                </Button> */}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Trusted by Organizations Worldwide</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of companies that trust our document extraction platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="flex flex-col items-center text-center p-6 rounded-xl border border-border/40 bg-card/50 hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-50 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-3">GDPR Compliant</h3>
                <p className="text-muted-foreground text-sm">
                  Full data sovereignty and privacy protection for your sensitive documents
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-xl border border-border/40 bg-card/50 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 rounded-full mb-4">
                  <Server className="h-8 w-8 text-brand-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-3">On-Premise Ready</h3>
                <p className="text-muted-foreground text-sm">
                  Deploy on your own infrastructure for maximum security and control
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-xl border border-border/40 bg-card/50 hover:shadow-md transition-shadow">
                <div className="p-3 bg-amber-50 rounded-full mb-4">
                  <Zap className="h-8 w-8 text-brand-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">No Usage Limits</h3>
                <p className="text-muted-foreground text-sm">
                  Process unlimited documents without worrying about additional costs
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
