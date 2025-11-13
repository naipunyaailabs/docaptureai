import { Zap, CheckCircle, Users, FileText } from "lucide-react"

export function StatsSection() {
  const stats = [
    { value: "99.5%", label: "Extraction Accuracy", icon: CheckCircle },
    { value: "10x Faster", label: "Processing Speed", icon: Zap },
    { value: "10K+", label: "Documents Processed Monthly", icon: FileText },
    { value: "50+", label: "Happy Customers", icon: Users },
  ]

  return (
    <section className="py-16 sm:py-24 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6 bg-card rounded-xl shadow-sm">
              <stat.icon className="h-10 w-10 text-brand-primary  mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
