"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Check, Plane, Hotel, Calendar, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PreviewDemoProps {
  onComplete: () => void
}

export function PreviewDemo({ onComplete }: PreviewDemoProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = [
    {
      title: "Finding the best flight deals",
      icon: Plane,
      duration: 3000,
    },
    {
      title: "Comparing hotel options",
      icon: Hotel,
      duration: 2500,
    },
    {
      title: "Generating your itinerary",
      icon: Calendar,
      duration: 4000,
    },
    {
      title: "Finalizing your preferences",
      icon: Settings,
      duration: 2000,
    },
  ]

  useEffect(() => {
    startDemo()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startDemo = async () => {
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      const increment = 100 / steps.length
      const duration = steps[i].duration
      const startProgress = (i / steps.length) * 100
      const endProgress = ((i + 1) / steps.length) * 100

      // Animate progress
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        setProgress(startProgress + (endProgress - startProgress) * progress)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)

      await new Promise((resolve) => setTimeout(resolve, duration))
    }

    // Complete the demo
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Preparing Your Travel Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progress} className="h-2" />

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isComplete = index < currentStep

            return (
              <motion.div
                key={index}
                className={`flex items-center space-x-4 p-4 rounded-lg ${isActive ? "bg-muted" : ""}`}
                animate={{
                  opacity: isActive || isComplete ? 1 : 0.5,
                }}
              >
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary-foreground" />
                    </div>
                  ) : isActive ? (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full border flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{step.title}</p>
                  {isActive && (
                    <AnimatePresence>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm text-muted-foreground"
                      >
                        Processing...
                      </motion.p>
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

