import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Brain, Zap, Shield, BarChart3, Users } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: FileText,
      title: "Document Processing",
      description: "Extract data from PDFs, images, and various document formats with high accuracy.",
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms understand context and extract meaningful insights.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process thousands of documents in minutes, not hours or days.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption and compliance certifications.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics and reporting to track processing performance.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Manage workspaces and collaborate with team members seamlessly.",
    },
  ]

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Modern Businesses
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to transform your document processing workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card hover:border-cyan-500/50 transition-colors">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-cyan-500 dark:text-cyan-400 mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
