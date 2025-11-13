import { UploadCloud, Cpu, DatabaseZap, ArrowRight } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: UploadCloud,
      title: "Upload Documents",
      description:
        "Securely upload your files in various formats (PDF, JPG, PNG, DOCX, etc.) via our intuitive interface or API.",
    },
    {
      icon: Cpu,
      title: "AI Processing",
      description:
        "Our advanced AI models analyze, classify, and extract relevant data with exceptional accuracy and speed.",
    },
    {
      icon: DatabaseZap,
      title: "Utilize Data",
      description:
        "Access structured data instantly. Export to your preferred format (JSON, Excel, CSV) or integrate with your systems.",
    },
  ]

  return (
    <section className="py-16 sm:py-24 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple Steps to Intelligent Document Processing
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get started in minutes and transform your document handling.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-start">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6">
              <div className="relative mb-6">
                <div className="p-5 bg-card rounded-full shadow-md">
                  <step.icon className="h-10 w-10 text-brand-primary " />
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="absolute left-full top-1/2 -translate-y-1/2 ml-4 h-8 w-8 text-muted-foreground/50 hidden md:block" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
