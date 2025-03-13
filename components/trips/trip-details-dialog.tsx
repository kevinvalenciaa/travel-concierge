"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, MapPin, Star, Clock, ExternalLink, Building, Bus } from "lucide-react"
import Image from "next/image"
import { InteractiveItinerary } from "@/components/itinerary/interactive-itinerary"
import { useState } from "react"
import { ViewIcon, CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { flightReviews, hotelReviews } from "@/data/reviews"
import { hotelLocations } from "@/data/locations"

interface TripDetailsDialogProps {
  trip: {
    id: number
    destination: string
    image: string
    dates: string
    status: string
    activities: number
    bookings: {
      flight: string
      hotel: string
    }
    itinerary: any
    flight: {
      departure: string
      arrival: string
      from: string
      to: string
      duration: string
    }
  }
}

export function TripDetailsDialog({ trip }: TripDetailsDialogProps) {
  const [view, setView] = useState<"list" | "calendar">("list")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const getTripDates = () => {
    const [startStr, endStr] = trip.dates.split(" - ")
    const startDate = new Date(startStr + ", " + endStr.split(", ")[1])
    return {
      start: startDate,
      end: new Date(endStr),
    }
  }

  const getItineraryForDate = (date: Date) => {
    const { start } = getTripDates()
    const dayDiff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return trip.itinerary[dayDiff]
  }

  // Extract airline and hotel names
  const airlineName = trip.bookings.flight.replace("Booked - ", "").replace("Not Booked - ", "")
  const hotelName = trip.bookings.hotel.replace("Booked - ", "").replace("Not Booked - ", "")

  return (
    <>
      <svg width="0" height="0">
        <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8c52ff" />
          <stop offset="100%" stopColor="#5ce1e6" />
        </linearGradient>
      </svg>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1">
            View Details
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{trip.destination}</DialogTitle>
            <DialogDescription>Trip details and itinerary</DialogDescription>
          </DialogHeader>
          <div className="relative h-[200px] w-full">
            <Image
              src={trip.image || "/placeholder.svg"}
              alt={trip.destination}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-sm">{trip.dates}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">{trip.destination}</span>
            </div>
          </div>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4">
                  <div className="rounded-lg border p-3">
                    <h4 className="font-medium">Trip Status</h4>
                    <p className="text-sm text-muted-foreground">{trip.status}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <h4 className="font-medium">Activities Planned</h4>
                    <p className="text-sm text-muted-foreground">{trip.activities} activities</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="itinerary" className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm" onClick={() => setView(view === "list" ? "calendar" : "list")}>
                    {view === "list" ? (
                      <>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Calendar View
                      </>
                    ) : (
                      <>
                        <ViewIcon className="mr-2 h-4 w-4" />
                        List View
                      </>
                    )}
                  </Button>
                </div>

                {view === "list" ? (
                  <InteractiveItinerary tripId={trip.id} initialItinerary={trip.itinerary} readOnly={true} />
                ) : (
                  <div className="grid md:grid-cols-[300px_1fr] gap-4">
                    <Card>
                      <CardContent className="p-2">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          defaultMonth={getTripDates().start}
                          disabled={(date) => {
                            const { start, end } = getTripDates()
                            return date < start || date > end
                          }}
                        />
                      </CardContent>
                    </Card>

                    {selectedDate && getItineraryForDate(selectedDate) ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Day {getItineraryForDate(selectedDate).day}</CardTitle>
                          <CardDescription>{format(selectedDate, "MMMM d, yyyy")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {getItineraryForDate(selectedDate).activities.map((activity: any, index: number) => (
                              <div key={index} className="flex items-start gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                  <Clock className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{activity.title}</p>
                                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                          Select a date to view the itinerary
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                <div className="grid gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Flight</h4>
                        <p className="text-sm text-muted-foreground">{trip.bookings.flight}</p>
                      </div>
                      {trip.bookings.flight.startsWith("Booked") && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{airlineName}</DialogTitle>
                              <DialogDescription>Flight Details and Reviews</DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="details">
                              <TabsList>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                              </TabsList>
                              <TabsContent value="details">
                                <div className="space-y-4">
                                  <div className="rounded-lg border p-4">
                                    <h4 className="font-medium mb-2">Flight Information</h4>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                      <p>
                                        Departure: {trip.flight?.departure || "10:30 PM"} -{" "}
                                        {trip.flight?.from || "New York (JFK)"}
                                      </p>
                                      <p>
                                        Arrival: {trip.flight?.arrival || "11:45 AM"} -{" "}
                                        {trip.flight?.to || "Paris (CDG)"}
                                      </p>
                                      <p>Flight Duration: {trip.flight?.duration || "7h 15m"}</p>
                                      <p>Airline: {airlineName}</p>
                                      <p>Class: Economy</p>
                                    </div>
                                  </div>
                                  <Button asChild className="w-full">
                                    <a
                                      href="#"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center"
                                    >
                                      View Boarding Pass
                                      <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                  </Button>
                                </div>
                              </TabsContent>
                              <TabsContent value="reviews" className="h-[400px] overflow-auto">
                                <div className="space-y-4">
                                  {flightReviews[airlineName]?.map((review) => (
                                    <div key={review.id} className="space-y-2 border-b pb-4 last:border-0">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="flex">
                                            {Array.from({ length: review.rating }).map((_, i) => (
                                              <Star
                                                key={i}
                                                className="h-4 w-4 text-[#8c52ff]"
                                                style={{ fill: "url(#star-gradient)" }}
                                              />
                                            ))}
                                          </div>
                                          <span className="font-medium">{review.title}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{review.date}</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{review.content}</p>
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">{review.author}</span>
                                        {review.verified && (
                                          <Badge variant="secondary" className="text-xs">
                                            Verified Traveler
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Hotel</h4>
                        <p className="text-sm text-muted-foreground">{trip.bookings.hotel}</p>
                      </div>
                      {trip.bookings.hotel.startsWith("Booked") && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{hotelName}</DialogTitle>
                              <DialogDescription>Hotel Details and Information</DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="details">
                              <TabsList>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="location">Location</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                              </TabsList>
                              <TabsContent value="details">
                                <div className="space-y-4">
                                  <div className="rounded-lg border p-4">
                                    <h4 className="font-medium mb-2">Hotel Overview</h4>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                      <p>
                                        Experience luxury and comfort at {hotelName}. Our elegant rooms offer stunning
                                        views and modern amenities.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg border p-4">
                                      <h4 className="font-medium mb-2">Amenities</h4>
                                      <div className="space-y-1 text-sm text-muted-foreground">
                                        <p>• 24/7 Room Service</p>
                                        <p>• Spa & Wellness Center</p>
                                        <p>• Fine Dining Restaurant</p>
                                        <p>• Fitness Center</p>
                                      </div>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                      <h4 className="font-medium mb-2">Room Features</h4>
                                      <div className="space-y-1 text-sm text-muted-foreground">
                                        <p>• King-size Bed</p>
                                        <p>• City View</p>
                                        <p>• Mini Bar</p>
                                        <p>• Free Wi-Fi</p>
                                      </div>
                                    </div>
                                  </div>
                                  <Button asChild className="w-full">
                                    <a
                                      href="#"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center"
                                    >
                                      View Reservation Details
                                      <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                  </Button>
                                </div>
                              </TabsContent>
                              <TabsContent value="location">
                                <ScrollArea className="h-[400px]">
                                  <div className="space-y-4 p-1">
                                    <div className="relative aspect-[3/2] w-[95%] mx-auto overflow-hidden rounded-lg border bg-muted">
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
                                      <p className="text-sm">123 Example Street, City, Country</p>
                                    </div>

                                    <div className="space-y-3">
                                      <h4 className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Nearby Attractions
                                      </h4>
                                      <div className="grid gap-2">
                                        {[
                                          { name: "City Center", distance: "0.5 km", time: "6 min", type: "landmark" },
                                          { name: "Central Park", distance: "0.8 km", time: "10 min", type: "park" },
                                          {
                                            name: "Shopping Mall",
                                            distance: "1.2 km",
                                            time: "15 min",
                                            type: "shopping",
                                          },
                                        ].map((attraction) => (
                                          <Card key={attraction.name} className="overflow-hidden">
                                            <CardContent className="p-3">
                                              <div className="flex items-start justify-between">
                                                <div className="space-y-1.5">
                                                  <div className="flex items-center gap-2">
                                                    <span role="img" aria-label={attraction.type} className="text-lg">
                                                      {attraction.type === "landmark"
                                                        ? "🏛️"
                                                        : attraction.type === "park"
                                                          ? "🌳"
                                                          : "🛍️"}
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
                                                      <span>{attraction.time} walk</span>
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

                                    {/* After the existing attractions section */}
                                    <div className="space-y-3 mt-4">
                                      <h4 className="text-sm font-medium flex items-center gap-2">
                                        <Bus className="h-4 w-4" />
                                        Public Transportation
                                      </h4>
                                      <div className="grid gap-2">
                                        {hotelLocations[hotelName]?.transportRoutes.map((route) => (
                                          <Card key={route.number} className="overflow-hidden">
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
                              </TabsContent>
                              <TabsContent value="reviews" className="h-[400px] overflow-auto">
                                <div className="space-y-4">
                                  {hotelReviews[hotelName]?.map((review) => (
                                    <div key={review.id} className="space-y-2 border-b pb-4 last:border-0">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="flex">
                                            {Array.from({ length: review.rating }).map((_, i) => (
                                              <Star
                                                key={i}
                                                className="h-4 w-4 text-[#8c52ff]"
                                                style={{ fill: "url(#star-gradient)" }}
                                              />
                                            ))}
                                          </div>
                                          <span className="font-medium">{review.title}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{review.date}</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{review.content}</p>
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">{review.author}</span>
                                        <span className="text-muted-foreground">·</span>
                                        <span className="text-muted-foreground">{review.stayDate}</span>
                                        <span className="text-muted-foreground">·</span>
                                        <span className="text-muted-foreground">{review.tripType}</span>
                                        {review.verified && (
                                          <Badge variant="secondary" className="text-xs">
                                            Verified Guest
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}

