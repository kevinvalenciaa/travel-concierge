"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Plane, Hotel } from "lucide-react"

const trips = [
  {
    id: 1,
    destination: "Paris, France",
    dates: "Feb 15 - Feb 22, 2024",
    status: "upcoming",
    items: {
      flights: "Booked",
      hotels: "Pending",
      activities: 4,
    },
  },
  {
    id: 2,
    destination: "Tokyo, Japan",
    dates: "Mar 10 - Mar 24, 2024",
    status: "planning",
    items: {
      flights: "Not booked",
      hotels: "Not booked",
      activities: 0,
    },
  },
]

export function TripList() {
  return (
    <div className="grid gap-4">
      {trips.map((trip) => (
        <Card key={trip.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">{trip.destination}</CardTitle>
            <Badge variant={trip.status === "upcoming" ? "default" : "secondary"}>{trip.status}</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  {trip.dates}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  {trip.destination}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{trip.items.flights}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Hotel className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{trip.items.hotels}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{trip.items.activities} Activities</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
                <Button className="w-full">Continue Planning</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

