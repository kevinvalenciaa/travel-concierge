import { Building, Clock, MapPin, Bus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { hotelLocations } from "@/data/locations"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LocationMapProps {
  hotelName: string
}

export function LocationMap({ hotelName }: LocationMapProps) {
  const location = hotelLocations[hotelName]

  if (!location) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        Location information not available for this hotel
      </div>
    )
  }

  const getAttractionIcon = (type: string) => {
    switch (type) {
      case "landmark":
        return "🏛️"
      case "shopping":
        return "🛍️"
      case "museum":
        return "🏛️"
      case "park":
        return "🌳"
      case "restaurant":
        return "🍽️"
      default:
        return "📍"
    }
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 p-1">
        <div className="relative aspect-[3/2] w-[95%] mx-auto overflow-hidden rounded-lg border bg-muted">
          {/* Map placeholder - in a real app, this would be replaced with an actual map component */}
          <div className="absolute inset-0 bg-muted">
            <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),rgba(0,0,0,0.2))]">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute -left-3 -top-3 h-6 w-6 animate-ping rounded-full bg-primary/50" />
                  <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-primary" />
                  <MapPin className="h-8 w-8 text-primary-foreground drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border p-3 bg-muted/50">
          <Building className="h-4 w-4 mt-1 text-muted-foreground" />
          <p className="text-sm">{location.address}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Nearby Attractions
          </h4>
          <div className="grid gap-2">
            {location?.nearbyAttractions?.map((attraction) => (
              <Card key={attraction.name} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span role="img" aria-label={attraction.type} className="text-lg">
                          {getAttractionIcon(attraction.type)}
                        </span>
                        <span className="font-medium text-sm">{attraction.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{attraction.distance}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{attraction.walkingTime} walk</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {attraction.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Bus className="h-4 w-4" />
            Public Transportation
          </h4>
          <div className="grid gap-2">
            {location?.transportRoutes?.map((route) => (
              <Card key={`${route.type}-${route.number}`} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-bold">
                          {route.type} {route.number}
                        </Badge>
                        <span className="text-sm">{route.direction}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {route.frequency}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {route.stops.map((stop) => (
                        <Badge key={stop} variant="secondary" className="text-xs">
                          {stop}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

