"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDemo } from "@/contexts/demo-context"
import { Loader2, Star } from "lucide-react"
import Image from "next/image"

interface Hotel {
  name: string
  location: string
  price: number
  rating: number
  image: string
  amenities: string[]
}

const DEMO_HOTELS: Hotel[] = [
  {
    name: "The Ritz Paris",
    location: "Place Vendôme, Paris",
    price: 1200,
    rating: 5,
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["Spa", "Pool", "Fine Dining", "Butler Service"],
  },
  {
    name: "Four Seasons George V",
    location: "Champs-Élysées, Paris",
    price: 1100,
    rating: 5,
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["3 Restaurants", "Luxury Spa", "Wine Cellar"],
  },
  {
    name: "Le Bristol Paris",
    location: "Rue du Faubourg Saint-Honoré, Paris",
    price: 950,
    rating: 5,
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["Rooftop Pool", "Michelin Restaurant", "Garden"],
  },
]

export function HotelRecommendations() {
  const { isDemoMode } = useDemo()
  const [isLoading, setIsLoading] = useState(false)
  const [hotels, setHotels] = useState<Hotel[]>([])

  const loadHotels = async () => {
    if (!isDemoMode) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setHotels(DEMO_HOTELS)
    setIsLoading(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top Hotels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" onClick={loadHotels} disabled={isLoading || !isDemoMode}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding best hotels...
            </>
          ) : (
            "Find Hotels"
          )}
        </Button>
        {hotels.map((hotel, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <Image
                  src={hotel.image || "/placeholder.svg"}
                  alt={hotel.name}
                  width={300}
                  height={200}
                  className="w-full rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold">{hotel.name}</h3>
                  <p className="text-sm text-muted-foreground">{hotel.location}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: hotel.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm space-x-2">
                    {hotel.amenities.map((amenity, i) => (
                      <span key={i} className="inline-block bg-secondary px-2 py-1 rounded-md">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${hotel.price}</div>
                    <div className="text-sm text-muted-foreground">per night</div>
                  </div>
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

