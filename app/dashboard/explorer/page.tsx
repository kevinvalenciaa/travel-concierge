import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, DollarSign } from "lucide-react"
import Image from "next/image"

const destinations = [
  {
    name: "Barcelona, Spain",
    image: "/placeholder.svg?height=200&width=300",
    description: "A city of art, architecture, and vibrant culture",
    matchScore: 95,
    highlights: ["Sagrada Familia", "Gothic Quarter", "La Rambla"],
    bestTime: "Apr-Jun",
    budget: "$150/day",
  },
  {
    name: "Kyoto, Japan",
    image: "/placeholder.svg?height=200&width=300",
    description: "Traditional Japanese culture meets modern convenience",
    matchScore: 92,
    highlights: ["Fushimi Inari", "Kinkaku-ji", "Arashiyama"],
    bestTime: "Mar-May",
    budget: "$200/day",
  },
]

export default function ExplorerPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Explorer</h2>
        <p className="text-muted-foreground">Discover personalized destination recommendations</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>What kind of trip are you looking for?</Label>
              <Input placeholder="e.g., Beach vacation, cultural experience, adventure..." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>When do you want to travel?</Label>
                <Input type="month" />
              </div>
              <div className="space-y-2">
                <Label>Budget per day</Label>
                <Input type="number" placeholder="Enter amount in USD" />
              </div>
            </div>
            <Button className="w-full">Get AI Recommendations</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Recommended Destinations</h3>
        <div className="grid gap-6">
          {destinations.map((destination, index) => (
            <Card key={index}>
              <CardContent className="p-0">
                <div className="grid md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr]">
                  <div className="relative h-[200px] md:h-full">
                    <Image
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute right-2 top-2 rounded-full bg-primary px-2 py-1 text-sm font-semibold text-primary-foreground">
                      {destination.matchScore}% Match
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold">{destination.name}</h3>
                    <p className="mt-2 text-muted-foreground">{destination.description}</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm">Best time: {destination.bestTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm">Budget: {destination.budget}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm">{destination.highlights.length} Highlights</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium">Highlights</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {destination.highlights.map((highlight) => (
                          <span key={highlight} className="rounded-full bg-secondary px-3 py-1 text-sm">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 flex space-x-4">
                      <Button className="flex-1">Plan Trip</Button>
                      <Button variant="outline" className="flex-1">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

