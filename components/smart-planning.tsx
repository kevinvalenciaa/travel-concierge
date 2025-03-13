"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useDemo } from "@/contexts/demo-context"

export function SmartPlanning() {
  const { isDemoMode } = useDemo()
  const [date, setDate] = useState<Date>()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!isDemoMode) return

    setIsGenerating(true)
    setGeneratedPlan(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setGeneratedPlan(`Based on your preferences, here's your personalized 3-day Paris itinerary:

Day 1: Cultural Immersion
- Morning: Skip-the-line guided tour of the Louvre
- Afternoon: Seine River cruise
- Evening: Dinner at a Michelin-starred restaurant

Day 2: Local Experience
- Morning: Cooking class in Montmartre
- Afternoon: Walking tour of Le Marais
- Evening: Jazz club in Saint-Germain

Day 3: Art & Leisure
- Morning: Visit to Musée d'Orsay
- Afternoon: Shopping on Champs-Élysées
- Evening: Sunset at Eiffel Tower`)

    setIsGenerating(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Smart Trip Planning</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Destination</Label>
          <Input placeholder="Where do you want to go?" defaultValue={isDemoMode ? "Paris, France" : ""} />
        </div>
        <div className="space-y-2">
          <Label>When do you want to travel?</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <Button className="w-full" onClick={handleGenerate} disabled={isGenerating || !isDemoMode}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating your plan...
            </>
          ) : (
            "Generate AI Travel Plan"
          )}
        </Button>
        {generatedPlan && (
          <Card className="mt-4">
            <CardContent className="pt-4">
              <pre className="whitespace-pre-wrap text-sm">{generatedPlan}</pre>
            </CardContent>
          </Card>
        )}
        {!isDemoMode && (
          <p className="text-sm text-muted-foreground text-center">Enable demo mode to try this feature</p>
        )}
      </CardContent>
    </Card>
  )
}

