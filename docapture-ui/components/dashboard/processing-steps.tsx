import type React from "react"
import { CheckCircle } from "lucide-react"

interface Step {
  id: string
  label: string
  icon: React.ElementType
}

interface ProcessingStepsProps {
  steps: Step[]
  currentStep: string
}

export function ProcessingSteps({ steps, currentStep }: ProcessingStepsProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = steps.findIndex((s) => s.id === currentStep) > steps.findIndex((s) => s.id === step.id)

          return (
            <div key={step.id} className="flex flex-col items-center relative flex-1">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    isCompleted ? "bg-brand-accent dark:bg-brand-accent" : "bg-muted"
                  }`}
                ></div>
              )}

              {/* Step circle */}
              <div
                className={`z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive
                    ? "border-brand-accent bg-brand-accent/10 dark:border-brand-accent dark:bg-brand-accent/20"
                    : isCompleted
                      ? "border-brand-accent bg-brand-accent dark:border-brand-accent dark:bg-brand-accent"
                      : "border-muted bg-background"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <StepIcon
                    className={`h-5 w-5 ${isActive ? "text-brand-accent dark:text-brand-accent" : "text-muted-foreground"}`}
                  />
                )}
              </div>

              {/* Step label */}
              <span
                className={`mt-2 text-sm font-medium ${
                  isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
