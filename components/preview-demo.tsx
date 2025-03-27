"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Check, Plane, Hotel, Calendar, Settings, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface PreviewDemoProps {
  onComplete: (itineraryData?: any) => void
  formData: {
    destination: string
    dates: {
      start: Date | null
      end: Date | null
    }
    budget: number[]
    travelers: string
    tripType?: string
    interests?: string[]
  }
}

export function PreviewDemo({ onComplete, formData }: PreviewDemoProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [itineraryData, setItineraryData] = useState<any>(null)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 2

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

  const generateItinerary = async () => {
    try {
      // Make sure we have all necessary data
      if (!formData.destination || !formData.dates.start || !formData.dates.end || 
          !formData.budget || !formData.travelers) {
        throw new Error("Missing required trip information");
      }

      // Get trip type and interests if available
      const tripType = formData.tripType || "general";
      const interests = formData.interests || [];
      
      // Generate traveler demographics string
      const travelerDemographics = getTravelerDemographics(formData);

      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: formData.destination,
          startDate: formData.dates.start.toISOString(),
          endDate: formData.dates.end.toISOString(),
          budget: formData.budget[0],
          travelers: parseInt(formData.travelers),
          travelerDemographics: travelerDemographics,
          tripType: tripType,
          interests: interests
        }),
      });

      const data = await response.json();
      
      // Check if the response contains an error
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Check if the response contains a valid itinerary structure
      if (!data.itinerary || !Array.isArray(data.itinerary) || data.itinerary.length === 0) {
        throw new Error("Received invalid itinerary data");
      }

      console.log("Received itinerary data:", data);
      setItineraryData(data);
      return data;
    } catch (error) {
      console.error("Error generating itinerary:", error);
      
      // If we haven't reached max retries yet, don't set the error state
      // so the generation process can continue
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        return null;
      }
      
      setError(error instanceof Error ? error.message : "Failed to generate itinerary");
      return null;
    }
  }

  // Helper function to generate traveler demographics description
  const getTravelerDemographics = (data: any) => {
    const { travelers, tripType, interests } = data;
    
    let demographicInfo = "";
    
    // Trip type information
    if (tripType === "family") {
      demographicInfo += "Family vacation with children";
    } else if (tripType === "couple") {
      demographicInfo += "Romantic couple's getaway";
    } else if (tripType === "friends") {
      demographicInfo += `Group of ${travelers} friends traveling together`;
    } else if (tripType === "solo") {
      demographicInfo += "Solo traveler";
    } else if (tripType === "business") {
      demographicInfo += "Business trip";
    } else {
      demographicInfo += `Group of ${travelers} general travelers`;
    }
    
    // Add interests if they exist
    if (interests && interests.length > 0) {
      demographicInfo += ` interested in ${interests.join(', ')}`;
    }
    
    return demographicInfo;
  };

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

      // When we reach the itinerary generation step
      if (i === 2) {
        let itineraryResult = null;
        let attempt = 0;
        
        // Try up to MAX_RETRIES times to generate the itinerary
        while (attempt <= retryCount && !itineraryResult) {
          try {
            // Add a bit more duration for retries
            if (attempt > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            itineraryResult = await generateItinerary();
            
            // If success, break out of the retry loop
            if (itineraryResult) break;
            
          } catch (genError) {
            console.error(`Generation attempt ${attempt + 1} failed:`, genError);
          }
          
          attempt++;
        }
        
        // If we have an error by this point, stop
        if (error) return;
      }

      await new Promise((resolve) => setTimeout(resolve, duration))
    }

    // Complete the demo
    setTimeout(() => {
      onComplete(itineraryData)
    }, 1000)
  }

  const retryGeneration = () => {
    setError(null);
    setProgress(0);
    setCurrentStep(0);
    setRetryCount(0);
    startDemo();
  }

  if (error) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Error Generating Itinerary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => onComplete()}>
                Continue Anyway
              </Button>
              <Button onClick={retryGeneration}>
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
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
                        {retryCount > 0 && index === 2 
                          ? `Processing... (Attempt ${retryCount + 1})`
                          : "Processing..."}
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

