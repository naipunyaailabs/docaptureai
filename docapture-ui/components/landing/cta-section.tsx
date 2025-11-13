import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { config } from "@/lib/config"

export function CtaSection() {
  return (
    <section className="py-16 sm:py-24 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
          Ready to Transform Your Document Processing?
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Partner with {config.company.name} for intelligent automation solutions. Get a custom quote tailored to your
          specific needs and document volume.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-brand-primary hover:bg-brand-primary/90 text-brand-secondary shadow-lg hover:shadow-brand-primary/50 transition-shadow duration-300 px-8 py-3"
          >
            <Link href="/contact">
              Get Custom Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="px-8 py-3 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-brand-secondary"
          >
            <Link href="/auth/register">Start Free Trial</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
