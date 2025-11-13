import Link from "next/link"
import { config } from "@/lib/config"
import { CurrentLogo } from "./CurrentLogo"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Link href="/" className="inline-block">
               <CurrentLogo />
              </Link>
              <p className="text-sm text-muted-foreground mt-2">
                A product of{" "}
                <a
                  href={config.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-secondary hover:underline"
                >
                  {config.company.name}
                </a>
              </p>
              <p className="text-xs text-muted-foreground">{config.company.tagline}</p>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Transform your document processing with intelligent AI-powered extraction and analysis.
            </p>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-muted-foreground hover:text-brand-secondary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-brand-secondary transition-colors">
                  Custom Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-brand-secondary transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-brand-secondary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-brand-secondary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href={config.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-brand-secondary transition-colors"
                >
                  CognitBotz.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} {config.company.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
