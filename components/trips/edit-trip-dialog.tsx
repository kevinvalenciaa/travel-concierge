"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, Star, ArrowRight, MapPin, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { InteractiveItinerary } from "@/components/itinerary/interactive-itinerary"
import { useTrips } from "@/contexts/trips-context"
import { useToast } from "@/components/ui/use-toast"
import { UnsavedChangesDialog } from "./unsaved-changes-dialog"
import Image from "next/image"
import type { Trip } from "@/contexts/trips-context"
import type React from "react"
import { flightReviews } from "@/data/reviews"
import { Card, CardContent } from "@/components/ui/card"
import { hotelReviews } from "@/data/reviews"
import { LocationMap } from "@/components/location-map"
import { hotels } from "@/data/hotels"

// Sample data (in real app, this would come from an API)
const flights = [
  {
    airline: "Air France",
    from: "New York (JFK)",
    to: "Paris (CDG)",
    departure: "10:30 PM",
    arrival: "11:45 AM",
    price: 449,
    originalPrice: 649,
    duration: "7h 15m",
    stops: 0,
    alliance: "SkyTeam",
  },
  {
    airline: "Delta",
    from: "New York (JFK)",
    to: "Paris (CDG)",
    departure: "9:15 PM",
    arrival: "10:30 AM",
    price: 479,
    originalPrice: 699,
    duration: "7h 15m",
    stops: 0,
    alliance: "SkyTeam",
  },
  {
    airline: "United",
    from: "New York (JFK)",
    to: "Paris (CDG)",
    departure: "4:30 PM",
    arrival: "7:45 AM",
    price: 399,
    originalPrice: 599,
    duration: "9h 15m",
    stops: 1,
    alliance: "Star Alliance",
  },
  {
    airline: "British Airways",
    from: "New York (JFK)",
    to: "Paris (CDG)",
    departure: "8:30 PM",
    arrival: "10:45 AM",
    price: 529,
    originalPrice: 729,
    duration: "8h 15m",
    stops: 1,
    alliance: "Oneworld",
  },
]

interface EditTripDialogProps {
  trip: Trip
  trigger?: React.ReactNode
}

export function EditTripDialog({ trip, trigger }: EditTripDialogProps) {
  // Main dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [isDiscarding, setIsDiscarding] = useState(false)

  // Form state
  const [formState, setFormState] = useState(() => {
    // Parse the dates string (format: "Feb 15 - Feb 22, 2024")
    const [startStr, endStr] = trip.dates.split(" - ")
    const startDate = new Date(`${startStr}, ${endStr.split(", ")[1]}`)
    const endDate = new Date(endStr)

    // Find the previously booked flight and hotel
    const bookedFlight = trip.bookings.flight.startsWith("Booked")
      ? flights.find((f) => trip.bookings.flight.includes(f.airline))
      : null
    const bookedHotel = trip.bookings.hotel.startsWith("Booked")
      ? hotels.find((h) => trip.bookings.hotel.includes(h.name))
      : null

    return {
      destination: trip.destination,
      startDate,
      endDate,
      currentItinerary: trip.itinerary,
      selectedFlight: bookedFlight,
      selectedHotel: bookedHotel,
    }
  })

  // Add new state for booking status
  const [bookingStatus, setBookingStatus] = useState({
    flight: formState.selectedFlight !== null,
    hotel: formState.selectedHotel !== null,
  })

  // Track changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const { updateTrip } = useTrips()
  const { toast } = useToast()

  // Reset form state when dialog opens or trip changes
  const resetFormState = useCallback(() => {
    const [startStr, endStr] = trip.dates.split(" - ")
    const startDate = new Date(`${startStr}, ${endStr.split(", ")[1]}`)
    const endDate = new Date(endStr)

    const bookedFlight = trip.bookings.flight.startsWith("Booked")
      ? flights.find((f) => trip.bookings.flight.includes(f.airline))
      : null
    const bookedHotel = trip.bookings.hotel.startsWith("Booked")
      ? hotels.find((h) => trip.bookings.hotel.includes(h.name))
      : null

    setFormState({
      destination: trip.destination,
      startDate,
      endDate,
      currentItinerary: trip.itinerary,
      selectedFlight: bookedFlight,
      selectedHotel: bookedHotel,
    })
    setHasUnsavedChanges(false)
    setShowUnsavedDialog(false)
    setIsDiscarding(false)
  }, [trip.destination, trip.dates, trip.itinerary, trip.bookings])

  useEffect(() => {
    if (isOpen) {
      resetFormState()
    }
  }, [isOpen, resetFormState])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && hasUnsavedChanges && !isDiscarding) {
        setShowUnsavedDialog(true)
      } else {
        setIsOpen(open)
        if (!open) {
          resetFormState()
        }
      }
    },
    [hasUnsavedChanges, isDiscarding, resetFormState],
  )

  const handleItineraryChange = useCallback((newItinerary: any) => {
    setFormState((prev) => ({ ...prev, currentItinerary: newItinerary }))
    setHasUnsavedChanges(true)
  }, [])

  const handleSave = useCallback(() => {
    updateTrip(trip.id, {
      ...trip,
      destination: formState.destination,
      itinerary: formState.currentItinerary,
      bookings: {
        flight: formState.selectedFlight ? `Booked - ${formState.selectedFlight.airline}` : trip.bookings.flight,
        hotel: formState.selectedHotel ? `Booked - ${formState.selectedHotel.name}` : trip.bookings.hotel,
      },
      flight: formState.selectedFlight
        ? {
            departure: formState.selectedFlight.departure,
            arrival: formState.selectedFlight.arrival,
            from: formState.selectedFlight.from,
            to: formState.selectedFlight.to,
            duration: formState.selectedFlight.duration,
          }
        : trip.flight,
    })

    toast({
      title: "Changes saved",
      description: "Your trip has been updated successfully.",
    })
    setHasUnsavedChanges(false)
    setIsOpen(false)
  }, [formState, trip, updateTrip, toast])

  const handleDiscard = useCallback(() => {
    setIsDiscarding(true)
    setShowUnsavedDialog(false)

    setTimeout(() => {
      resetFormState()
      setIsOpen(false)
      setIsDiscarding(false)
    }, 0)
  }, [resetFormState])

  const handleContinueEditing = useCallback(() => {
    setShowUnsavedDialog(false)
  }, [])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" className="flex-1">
              Edit Trip
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
            <DialogDescription>Make changes to your trip details</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Trip Details</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="flights">Flights</TabsTrigger>
              <TabsTrigger value="hotels">Hotels</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    value={formState.destination}
                    onChange={(e) => {
                      setFormState((prev) => ({ ...prev, destination: e.target.value }))
                      setHasUnsavedChanges(true)
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formState.startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formState.startDate ? format(formState.startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formState.startDate}
                          onSelect={(date) => {
                            setFormState((prev) => ({ ...prev, startDate: date }))
                            setHasUnsavedChanges(true)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formState.endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formState.endDate ? format(formState.endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formState.endDate}
                          onSelect={(date) => {
                            setFormState((prev) => ({ ...prev, endDate: date }))
                            setHasUnsavedChanges(true)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="itinerary" className="min-h-[500px]">
              <InteractiveItinerary
                tripId={trip.id}
                initialItinerary={formState.currentItinerary}
                onItineraryChange={handleItineraryChange}
              />
            </TabsContent>

            <TabsContent value="flights" className="space-y-4">
              <div className="grid gap-4">
                {[...flights]
                  .sort((a, b) => {
                    // Only sort based on initial booking status, not current selection
                    if (trip.bookings.flight.includes(a.airline)) return -1
                    if (trip.bookings.flight.includes(b.airline)) return 1
                    return 0
                  })
                  .map((flight) => (
                    <Card
                      key={flight.airline}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/50",
                        formState.selectedFlight === flight
                          ? "border-primary"
                          : trip.bookings.flight.includes(flight.airline) && !formState.selectedFlight
                            ? "border-2 border-black dark:border-white"
                            : "",
                      )}
                      onClick={() => {
                        setFormState((prev) => ({
                          ...prev,
                          selectedFlight: prev.selectedFlight === flight ? null : flight,
                        }))
                        setBookingStatus((prev) => ({
                          ...prev,
                          flight: true,
                        }))
                        setHasUnsavedChanges(true)
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold">{flight.airline}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {flight.duration}
                                <Badge variant="secondary">
                                  {flight.stops === 0 ? "Nonstop" : `${flight.stops} stops`}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-8">
                              <div>
                                <p className="font-medium">{flight.departure}</p>
                                <p className="text-sm text-muted-foreground">{flight.from}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 mt-2" />
                              <div>
                                <p className="font-medium">{flight.arrival}</p>
                                <p className="text-sm text-muted-foreground">{flight.to}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">${flight.price}</p>
                            <p className="text-sm text-muted-foreground line-through">${flight.originalPrice}</p>
                            <div className="flex gap-2 mt-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{flight.airline}</DialogTitle>
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
                                            <p>Airline: {flight.airline}</p>
                                            <p>Alliance: {flight.alliance}</p>
                                            <p>Duration: {flight.duration}</p>
                                            <p>Stops: {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop(s)`}</p>
                                          </div>
                                        </div>
                                        <Button asChild className="w-full">
                                          <a
                                            href="#"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center"
                                          >
                                            Book Flight
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                          </a>
                                        </Button>
                                      </div>
                                    </TabsContent>
                                    <TabsContent value="reviews" className="h-[400px] overflow-auto">
                                      <div className="space-y-4">
                                        {flightReviews[flight.airline]?.map((review) => (
                                          <div key={review.id} className="space-y-2 border-b pb-4 last:border-0">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <div className="flex">
                                                  {Array.from({ length: review.rating }).map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
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
                              <Button size="sm" asChild onClick={(e) => e.stopPropagation()}>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center">
                                  Book Now
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="hotels" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {[...hotels]
                  .sort((a, b) => {
                    // Only sort based on initial booking status, not current selection
                    if (trip.bookings.hotel.includes(a.name)) return -1
                    if (trip.bookings.hotel.includes(b.name)) return 1
                    return 0
                  })
                  .map((hotel) => (
                    <Card
                      key={hotel.name}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/50",
                        formState.selectedHotel === hotel
                          ? "border-primary"
                          : trip.bookings.hotel.includes(hotel.name) && !formState.selectedHotel
                            ? "border-2 border-black dark:border-white"
                            : "",
                      )}
                      onClick={() => {
                        setFormState((prev) => ({
                          ...prev,
                          selectedHotel: prev.selectedHotel === hotel ? null : hotel,
                        }))
                        setBookingStatus((prev) => ({
                          ...prev,
                          hotel: true,
                        }))
                        setHasUnsavedChanges(true)
                      }}
                    >
                      <div className="relative h-48">
                        <Image
                          src={hotel.image || "/placeholder.svg"}
                          alt={hotel.name}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold">{hotel.name}</h3>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: hotel.rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                              ))}
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {hotel.location}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">${hotel.price}</p>
                            <p className="text-sm text-muted-foreground line-through">${hotel.originalPrice}</p>
                            <div className="flex gap-2 mt-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{hotel.name}</DialogTitle>
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
                                              Experience luxury and comfort at {hotel.name}. Located in the heart of{" "}
                                              {hotel.location}.
                                            </p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="rounded-lg border p-4">
                                            <h4 className="font-medium mb-2">Amenities</h4>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                              <div className="flex gap-2 mt-4">
                                                {hotel.amenities.map((amenity) => (
                                                  <Badge key={amenity} variant="secondary">
                                                    {amenity}
                                                  </Badge>
                                                ))}
                                                <Badge variant="outline">{hotel.neighborhood}</Badge>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="rounded-lg border p-4">
                                            <h4 className="font-medium mb-2">Location</h4>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                              <p>• {hotel.location}</p>
                                              <p>• Walking distance to attractions</p>
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
                                            Book Room
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                          </a>
                                        </Button>
                                      </div>
                                    </TabsContent>
                                    <TabsContent value="location">
                                      <LocationMap hotelName={hotel.name} />
                                    </TabsContent>
                                    <TabsContent value="reviews" className="h-[400px] overflow-auto">
                                      <div className="space-y-4">
                                        {hotelReviews[hotel.name]?.map((review) => (
                                          <div key={review.id} className="space-y-2 border-b pb-4 last:border-0">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <div className="flex">
                                                  {Array.from({ length: review.rating }).map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
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
                              <Button size="sm" asChild onClick={(e) => e.stopPropagation()}>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center">
                                  Book Now
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onConfirmDiscard={handleDiscard}
        onContinueEditing={handleContinueEditing}
      />
    </>
  )
}

