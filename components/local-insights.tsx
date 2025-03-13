"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDemo } from "@/contexts/demo-context"
import { Loader2, MapPin, Star, Clock } from "lucide-react"

interface LocalPlace {
  name: string
  type: string
  description: string
  rating: number
  price: string
  hours: string
  location: string
}

const DEMO_PLACES: LocalPlace[] = [
  {
    name: "Le Chateaubriand",
    type: "Restaurant",
    description: "Innovative French cuisine in a casual bistro setting",
    rating: 4.8,
    price: "€€€",
    hours: "7:30 PM - 10:30 PM",
    location: "129 Avenue Parmentier",
  },
  {
    name: "Le Marais Food Tour",
    type: "Experience",
    description: "Guided food tour through historic Le Marais district",
    rating: 4.9,
    price: "€€",
    hours: "10:00 AM - 1:00 PM",
    location: "Le Marais",
  },
  {
    name: "Hidden Paris Photography",
    type: "Activity",
    description: "Photography tour of hidden Parisian spots",
    rating: 4.7,
    price: "€€",
    hours: "Sunrise & Sunset",
    location: "Various Locations",
  },
]

export function LocalInsights() {
  const { isDemoMode } = useDemo()
  const [isLoading, setIsLoading] = useState(false)
  const [places, setPlaces] = useState<LocalPlace[]>([])

  const loadInsights = async () => {
    if (!isDemoMode) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setPlaces(DEMO_PLACES)
    setIsLoading(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Local Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" onClick={loadInsights} disabled={isLoading || !isDemoMode}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding local experiences...
            </>
          ) : (
            "Discover Local Experiences"
          )}
        </Button>
        {places.map((place, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{place.name}</h3>
                  <span className="text-sm font-medium">{place.price}</span>
                </div>
                <p className="text-sm text-muted-foreground">{place.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{place.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{place.hours}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{place.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isDemoMode && (
          <p className="text-sm text-muted-foreground text-center">Enable demo mode to try this feature</p>
        )}
      </CardContent>
    </Card>
  )
}

