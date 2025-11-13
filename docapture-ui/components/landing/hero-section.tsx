"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, PlayCircle, BadgePercent, KeyRound, ShieldCheck, Server, CheckCircle } from "lucide-react"
import { config } from "@/lib/config"

export function HeroSection() {
  const sellingPoints = [
    {
      icon: <BadgePercent className="h-6 w-6 text-brand-primary" />,
      text: "No Per-Page Pricing",
      description: "Transparent, predictable costs.",
    },
    {
      icon: <KeyRound className="h-6 w-6 text-brand-primary" />,
      text: "Full Data Ownership",
      description: "Your data stays yours, always.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-brand-primary" />,
      text: "GDPR Compliant",
      description: "Built with privacy at its core.",
    },
    {
      icon: <Server className="h-6 w-6 text-brand-primary" />,
      text: "On-Premise Ready",
      description: "Deploy in your own environment.",
    },
  ]

  return (
    <section className="relative bg-gradient-to-br from-brand-primary/10 via-background to-brand-accent/10 py-8 overflow-hidden">
      {/* Animated background elements - kept from original */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-primary/10 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-brand-accent/10 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-80 h-80 rounded-full bg-brand-primary/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="mb-4">
            <span className="text-sm text-muted-foreground">
              A product of{" "}
              <a
                href={config.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline font-medium"
              >
                {config.company.name}
              </a>
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="block">Reimagine</span>
            <motion.span
              className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Document Intelligence
            </motion.span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-md text-muted-foreground mb-8">
          Say goodbye to costly per-page pricing! Our AI-driven document extraction solution offers a one-time setup
          with no usage limits — giving you the freedom to scale without breaking the bank.
          </p>

          {/* <p className="max-w-3xl mx-auto text-xl sm:text-2xl font-semibold text-foreground mb-10">
            Say goodbye to costly per-page pricing! Our AI-driven document extraction solution offers a one-time setup
            with no usage limits — giving you the freedom to scale without breaking the bank.
          </p> */}

          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Button
              asChild
              size="default"
              className="bg-brand-primary hover:bg-brand-primary/90 text-black shadow-lg hover:shadow-brand-primary/50 transition-all duration-300 border-0"
            >
              <Link href="/auth/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="default"
              className="shadow-sm hover:shadow-md transition-shadow duration-300 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-black"
            >
              <Link href="/contact">
                <PlayCircle className="mr-2 h-4 w-4" />
                Get Custom Quote
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {sellingPoints.map((point, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 bg-background/50 backdrop-blur-sm rounded-lg shadow-md border border-border/50"
            >
              {point.icon}
              <h3 className="mt-2 text-md font-semibold text-foreground">{point.text}</h3>
              <p className="text-xs text-muted-foreground">{point.description}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 sm:mt-16 lg:mt-20 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="absolute -inset-0.5  rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          <div className="relative z-10 w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-background rounded-xl shadow-2xl border border-border">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Document Processing Made Simple</h3>
                <p className="text-muted-foreground">
                  Our platform handles complex document workflows with ease, providing:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-cyan-500" />
                    AI-powered data extraction
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-cyan-500" />
                    Multi-format support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-cyan-500" />
                    Real-time processing
                  </li>
                </ul>
              </div>
              <div className="relative">
                <img
                  src="/doc-capture-illustration.png"
                  alt="docapture Platform Interface"
                  className="rounded-lg shadow-md border border-border"
                />
                <div className="absolute -bottom-4 -right-4 bg-background p-2 rounded-lg shadow-md border border-border">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-muted-foreground">Processing...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
