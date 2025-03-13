"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TravelInterests } from "@/components/onboarding/travel-interests"
import { BudgetDuration } from "@/components/onboarding/budget-duration"
import { DestinationPreferences } from "@/components/onboarding/destination-preferences"
import { TravelDates } from "@/components/onboarding/travel-dates"
import { Companions } from "@/components/onboarding/companions"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const steps = ["Travel Interests", "Budget & Duration", "Destination Preferences", "Travel Dates", "Companions"]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    interests: [],
    budget: 1000,
    duration: 7,
    destinations: [],
    dates: null,
    companions: "",
  })
  const router = useRouter()

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      router.push("/dashboard")
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-muted/50 py-10">
      <div className="container max-w-3xl">
        <Card className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">{steps[currentStep]}</h1>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <TravelInterests value={formData.interests} onChange={(interests) => updateFormData({ interests })} />
              )}
              {currentStep === 1 && (
                <BudgetDuration
                  budget={formData.budget}
                  duration={formData.duration}
                  onChange={(data) => updateFormData(data)}
                />
              )}
              {currentStep === 2 && (
                <DestinationPreferences
                  value={formData.destinations}
                  onChange={(destinations) => updateFormData({ destinations })}
                />
              )}
              {currentStep === 3 && (
                <TravelDates value={formData.dates} onChange={(dates) => updateFormData({ dates })} />
              )}
              {currentStep === 4 && (
                <Companions value={formData.companions} onChange={(companions) => updateFormData({ companions })} />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={previousStep} disabled={currentStep === 0}>
              Previous
            </Button>
            <Button onClick={nextStep}>{currentStep === steps.length - 1 ? "Complete" : "Next"}</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

