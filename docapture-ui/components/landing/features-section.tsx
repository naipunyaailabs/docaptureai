"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Workflow, FileStack, ShieldCheck, BarChartBig, Code2, BrainCircuit } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: BrainCircuit,
      title: "Intelligent OCR & AI",
      description: "Context-aware AI goes beyond simple text recognition for superior data extraction.",
      gradient: "from-brand-primary to-brand-secondary",
    },
    {
      icon: Workflow,
      title: "Automated Workflows",
      description: "Set up seamless document processing pipelines tailored to your business needs.",
      gradient: "from-brand-primary to-brand-secondary",
    },
    {
      icon: FileStack,
      title: "Multi-Format Support",
      description: "Effortlessly process PDFs, images (JPG, PNG, TIFF), Word docs, and more.",
      gradient: "from-brand-primary to-brand-secondary",
    },
    {
      icon: ShieldCheck,
      title: "Enterprise-Grade Security",
      description: "Your data is protected with robust security measures and compliance standards.",
      gradient: "from-brand-primary to-brand-secondary",
    },
    {
      icon: BarChartBig,
      title: "Actionable Insights",
      description: "Transform raw document data into structured, meaningful analytics and reports.",
      gradient: "from-brand-primary to-brand-secondary",
    },
    {
      icon: Code2,
      title: "Developer-Friendly API",
      description: "Easily integrate docapture's power into your existing systems and applications.",
        gradient: "from-brand-primary to-brand-secondary",
    },
  ]

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why docapture is Your Ultimate Document Solution
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience a comprehensive suite of features designed to tackle your toughest document challenges.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-card h-full hover:shadow-lg transition-shadow duration-300 group overflow-hidden border-border">
                <CardHeader className="flex flex-row items-center gap-4 pb-2 relative">
                  <div className="relative">
                    <div className="p-3 rounded-lg bg-gradient-to-br bg-opacity-10 dark:bg-opacity-20">
                      <feature.icon className="h-6 w-6 text-foreground" />
                    </div>
                    <motion.div
                      className={`absolute -z-10 inset-0 rounded-lg opacity-80 blur-xl bg-gradient-to-r ${feature.gradient}`}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                    />
                  </div>
                  <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
