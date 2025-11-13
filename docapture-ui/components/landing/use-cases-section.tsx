import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Landmark, Stethoscope, Gavel, Truck, UsersIcon, Building } from "lucide-react" // Changed Users to UsersIcon

export function UseCasesSection() {
  const useCases = [
    {
      icon: Landmark,
      title: "Finance & Banking",
      description: "Automate invoice processing, loan applications, KYC, and compliance checks.",
    },
    {
      icon: Stethoscope,
      title: "Healthcare",
      description: "Streamline patient intake forms, insurance claims, and medical record management.",
    },
    {
      icon: Gavel,
      title: "Legal",
      description: "Accelerate contract analysis, discovery document review, and case file organization.",
    },
    {
      icon: Truck,
      title: "Logistics & Supply Chain",
      description: "Optimize bills of lading, shipping manifests, customs forms, and proof of delivery.",
    },
    {
      icon: UsersIcon,
      title: "Human Resources",
      description: "Simplify employee onboarding, resume screening, payroll processing, and benefits admin.",
    },
    {
      icon: Building,
      title: "Real Estate",
      description: "Efficiently manage lease agreements, property deeds, and inspection reports.",
    },
  ]

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Powering Industries, One Document at a Time
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            docapture adapts to diverse needs, delivering value across various sectors.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase) => (
            <Card
              key={useCase.title}
              className="bg-card flex flex-col text-center items-center p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-4 bg-brand-primary dark:bg-brand-primary rounded-full mb-4">
                <useCase.icon className="h-8 w-8 text-white dark:text-brand-secondary" />
              </div>
              <CardTitle className="text-lg font-semibold mb-2">{useCase.title}</CardTitle>
              <CardContent className="text-sm text-muted-foreground p-0">{useCase.description}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
