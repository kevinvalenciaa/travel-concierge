"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const recommendations = [
  {
    id: 1,
    destination: "Barcelona, Spain",
    image: "/placeholder.svg?height=200&width=300",
    description: "Based on your interest in cultural experiences and food",
    price: "From $1,200",
  },
  {
    id: 2,
    destination: "Kyoto, Japan",
    image: "/placeholder.svg?height=200&width=300",
    description: "Matches your preference for historical sites and local cuisine",
    price: "From $2,500",
  },
  {
    id: 3,
    destination: "Amsterdam, Netherlands",
    image: "/placeholder.svg?height=200&width=300",
    description: "Perfect for your interest in city exploration and art",
    price: "From $1,500",
  },
]

export function RecommendedTrips() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {recommendations.map((rec) => (
          <Card key={rec.id}>
            <CardHeader className="p-0">
              <div className="relative h-48">
                <Image
                  src={rec.image || "/placeholder.svg"}
                  alt={rec.destination}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2">{rec.destination}</CardTitle>
              <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{rec.price}</span>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

