import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { StatsSection } from "@/components/landing/stats-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { ServicesShowcase } from "@/components/landing/services-showcase"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { UseCasesSection } from "@/components/landing/use-cases-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingTeaserSection } from "@/components/landing/pricing-teaser-section"
import { CtaSection } from "@/components/landing/cta-section"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <ServicesShowcase />
        <HowItWorksSection />
        <UseCasesSection />
        <TestimonialsSection />
        <PricingTeaserSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}