import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <p className="text-cyan-500 dark:text-cyan-400 text-sm font-medium mb-4">Welcome To docapture</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Every Page Matters—Unleash the Power of{" "}
            <span className="text-cyan-600 dark:text-cyan-400">Intelligent Processing</span>.
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            <span className="text-cyan-600 dark:text-cyan-400 font-medium">Intelligent Document Processing (IDP)</span>{" "}
            uses advanced AI, machine learning, and OCR to extract and process data from various documents. It
            transforms unstructured and semi-structured content into actionable insights, streamlining workflows,
            reducing manual effort, and enhancing efficiency in your business operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Link href="/auth/register">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/docs">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
