"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { format, isAfter } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { PreviewDemo } from "@/components/preview-demo"
import { PreviewResults } from "@/components/preview-results"
import { useToast } from "@/components/ui/use-toast"
import { useProfile } from "@/contexts/profile-context"

export default function NewTripPage() {
  const [step, setStep] = useState<"form" | "loading" | "preview">("form")
  const router = useRouter()
  const { toast } = useToast()
  const { profile } = useProfile()
  const [generatedItinerary, setGeneratedItinerary] = useState<any>(null)

  const [formData, setFormData] = useState({
    destination: "",
    dates: {
      start: null as Date | null,
      end: null as Date | null,
    },
    budget: [1000],
    travelers: "", // New field for number of travelers
    tripType: "general", // Type of trip (family, couple, business, etc.)
    interests: [] as string[], // Interests for personalized activities
  })

  const [errors, setErrors] = useState({
    destination: "",
    dates: "",
    travelers: "", // New error field
  })

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      destination: "",
      dates: "",
      travelers: "",
    }

    if (!formData.destination.trim()) {
      newErrors.destination = "Destination is required"
      isValid = false
    }

    if (!formData.dates.start || !formData.dates.end) {
      newErrors.dates = "Both start and end dates are required"
      isValid = false
    } else if (!isAfter(formData.dates.end, formData.dates.start)) {
      newErrors.dates = "End date must be after start date"
      isValid = false
    }

    // Validate number of travelers
    if (!formData.travelers) {
      newErrors.travelers = "Number of travelers is required"
      isValid = false
    } else {
      const numTravelers = Number.parseInt(formData.travelers)
      if (isNaN(numTravelers) || numTravelers < 1) {
        newErrors.travelers = "Please enter a valid number of travelers"
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = () => {
    if (validateForm()) {
      setStep("loading")
    } else {
      toast({
        title: "Invalid Form",
        description: "Please fix the errors before continuing.",
        variant: "destructive",
      })
    }
  }

  const handlePreviewComplete = (itineraryData?: any) => {
    if (itineraryData) {
      setGeneratedItinerary(itineraryData);
    }
    setStep("preview")
  }

  const handleConfirmBooking = () => {
    router.push("/dashboard/trips")
  }

  if (step === "loading") {
    return <PreviewDemo 
      onComplete={handlePreviewComplete} 
      formData={formData}
    />
  }

  if (step === "preview") {
    return (
      <PreviewResults
        onConfirm={handleConfirmBooking}
        budget={formData.budget[0]}
        startDate={formData.dates.start}
        endDate={formData.dates.end}
        destination={formData.destination}
        travelers={Number.parseInt(formData.travelers)}
        generatedItinerary={generatedItinerary}
      />
    )
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Plan Your New Trip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Where would you like to go?</Label>
              <Input
                placeholder="Enter destination"
                value={formData.destination}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, destination: e.target.value }))
                  if (errors.destination) {
                    setErrors((prev) => ({ ...prev, destination: "" }))
                  }
                }}
              />
              {errors.destination && <p className="text-sm text-destructive">{errors.destination}</p>}
            </div>

            <div className="space-y-2">
              <Label>Number of Travelers</Label>
              <Input
                type="number"
                min="1"
                placeholder="Enter number of travelers"
                value={formData.travelers}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, travelers: e.target.value }))
                  if (errors.travelers) {
                    setErrors((prev) => ({ ...prev, travelers: "" }))
                  }
                }}
              />
              {errors.travelers && <p className="text-sm text-destructive">{errors.travelers}</p>}
            </div>

            <div className="space-y-2">
              <Label>When do you want to travel?</Label>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dates.start && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dates.start ? format(formData.dates.start, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dates.start || undefined}
                      onSelect={(date) => {
                        setFormData((prev) => ({
                          ...prev,
                          dates: { ...prev.dates, start: date as Date | null },
                        }))
                        if (errors.dates) {
                          setErrors((prev) => ({ ...prev, dates: "" }))
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dates.end && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dates.end ? format(formData.dates.end, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dates.end || undefined}
                      onSelect={(date) => {
                        setFormData((prev) => ({
                          ...prev,
                          dates: { ...prev.dates, end: date as Date | null },
                        }))
                        if (errors.dates) {
                          setErrors((prev) => ({ ...prev, dates: "" }))
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {errors.dates && <p className="text-sm text-destructive">{errors.dates}</p>}
            </div>

            <div className="space-y-2">
              <Label>What's your budget per day? ({profile.currency})</Label>
              <Slider
                value={formData.budget}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, budget: value }))}
                max={2000}
                min={100}
                step={100}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{profile.currency} 100</span>
                <span>
                  {profile.currency} {formData.budget}
                </span>
                <span>{profile.currency} 2000+</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type of Trip</Label>
              <div className="grid grid-cols-3 gap-2">
                {["general", "family", "couple", "friends", "solo", "business"].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.tripType === type ? "default" : "outline"}
                    className="capitalize"
                    onClick={() => setFormData((prev) => ({ ...prev, tripType: type }))}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Interests (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {["history", "food", "adventure", "culture", "nature", "shopping", "relaxation", "nightlife"].map((interest) => (
                  <Button
                    key={interest}
                    type="button"
                    variant={formData.interests.includes(interest) ? "default" : "outline"}
                    className="capitalize"
                    onClick={() => {
                      setFormData((prev) => {
                        if (prev.interests.includes(interest)) {
                          return { ...prev, interests: prev.interests.filter(i => i !== interest) };
                        } else {
                          return { ...prev, interests: [...prev.interests, interest] };
                        }
                      });
                    }}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button className="w-full" onClick={handleSubmit}>
              Find Travel Options
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

