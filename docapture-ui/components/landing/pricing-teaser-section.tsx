import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Users, Zap, Shield, HeadphonesIcon } from "lucide-react"

export function PricingTeaserSection() {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-primary p-8 sm:p-12 lg:p-16 rounded-xl shadow-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-secondary mb-4">
            Custom Solutions for Every Business
          </h2>
              <p className="text-lg text-brand-secondary/90 max-w-2xl mx-auto mb-8">
            We understand that every business has unique document processing needs. That's why we offer tailored
            solutions with custom pricing that scales with your requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-brand-secondary/90 mb-10">
            <span className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-brand-secondary" /> Tailored Solutions
            </span>
            <span className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-brand-secondary" /> Dedicated Support
            </span>
            <span className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-brand-secondary" /> Scalable Processing
            </span>
            <span className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-brand-secondary" /> Enterprise Security
            </span>
            <span className="flex items-center">
              <HeadphonesIcon className="h-5 w-5 mr-2 text-brand-secondary" /> Priority Support
            </span>
          </div>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-white text-brand-primary hover:bg-gray-100 border-white hover:border-gray-100 font-semibold px-8 py-3"
          >
            <Link href="/contact">Get Custom Quote</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
