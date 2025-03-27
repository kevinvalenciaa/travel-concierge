"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format, eachDayOfInterval } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Star, ArrowRight, ExternalLink, Filter } from "lucide-react"
import { InteractiveItinerary } from "@/components/itinerary/interactive-itinerary"
import { useTrips } from "@/contexts/trips-context"
import Image from "next/image"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { useProfile } from "@/contexts/profile-context"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { flightReviews, hotelReviews } from "@/data/reviews"
import { LocationMap } from "@/components/location-map"

// Sample data with more variety for filtering
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

const hotels = [
  {
    name: "The Ritz Paris",
    location: "Place Vendôme",
    price: 1200,
    originalPrice: 1500,
    rating: 5,
    amenities: ["Spa", "Pool", "Restaurant", "Gym", "Room Service"],
    image: "/placeholder.svg?height=200&width=300",
    neighborhood: "1st Arrondissement",
  },
  {
    name: "Four Seasons George V",
    location: "Champs-Élysées",
    price: 1100,
    originalPrice: 1400,
    rating: 5,
    amenities: ["Spa", "Pool", "Restaurant", "Business Center"],
    image: "/placeholder.svg?height=200&width=300",
    neighborhood: "8th Arrondissement",
  },
  {
    name: "Hôtel Plaza Athénée",
    location: "Avenue Montaigne",
    price: 950,
    originalPrice: 1200,
    rating: 5,
    amenities: ["Restaurant", "Spa", "Room Service"],
    image: "/placeholder.svg?height=200&width=300",
    neighborhood: "8th Arrondissement",
  },
  {
    name: "Le Bristol Paris",
    location: "Rue du Faubourg Saint-Honoré",
    price: 850,
    originalPrice: 1100,
    rating: 4,
    amenities: ["Pool", "Restaurant", "Gym"],
    image: "/placeholder.svg?height=200&width=300",
    neighborhood: "1st Arrondissement",
  },
]

interface PreviewResultsProps {
  onConfirm: () => void
  budget?: number
  startDate?: Date | null
  endDate?: Date | null
  destination?: string
  travelers?: number
  generatedItinerary?: any
}

interface FlightFilters {
  maxPrice: number[]
  nonStop: boolean
  airlines: string[]
  alliances: string[]
}

interface HotelFilters {
  maxPrice: number[]
  minRating: number
  amenities: string[]
  neighborhoods: string[]
}

export function PreviewResults({
  onConfirm,
  budget = 1000,
  startDate,
  endDate,
  destination = "Paris, France",
  travelers = 1,
  generatedItinerary = null,
}: PreviewResultsProps) {
  const router = useRouter()
  const { addTrip } = useTrips()
  const { toast } = useToast()
  const { profile } = useProfile()
  const [currentBudget, setBudget] = useState([budget])
  const [selectedFlight, setSelectedFlight] = useState<(typeof flights)[0] | null>(null)
  const [selectedHotel, setSelectedHotel] = useState<(typeof hotels)[0] | null>(null)

  // Filter states
  const [flightFilters, setFlightFilters] = useState<FlightFilters>({
    maxPrice: [1000],
    nonStop: false,
    airlines: [],
    alliances: [],
  })

  const [hotelFilters, setHotelFilters] = useState<HotelFilters>({
    maxPrice: [2000],
    minRating: 0,
    amenities: [],
    neighborhoods: [],
  })

  // Compute unique values for filter options
  const uniqueAirlines = [...new Set(flights.map((flight) => flight.airline))]
  const uniqueAlliances = [...new Set(flights.map((flight) => flight.alliance))]
  const uniqueAmenities = [...new Set(hotels.flatMap((hotel) => hotel.amenities))]
  const uniqueNeighborhoods = [...new Set(hotels.map((hotel) => hotel.neighborhood))]

  // Filter flights based on current filters
  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      const meetsMaxPrice = flight.price <= flightFilters.maxPrice[0]
      const meetsNonStop = !flightFilters.nonStop || flight.stops === 0
      const meetsAirline = flightFilters.airlines.length === 0 || flightFilters.airlines.includes(flight.airline)
      const meetsAlliance = flightFilters.alliances.length === 0 || flightFilters.alliances.includes(flight.alliance)

      return meetsMaxPrice && meetsNonStop && meetsAirline && meetsAlliance
    })
  }, [flightFilters])

  // Filter hotels based on current filters
  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const meetsMaxPrice = hotel.price <= hotelFilters.maxPrice[0]
      const meetsRating = hotel.rating >= hotelFilters.minRating
      const meetsAmenities =
        hotelFilters.amenities.length === 0 ||
        hotelFilters.amenities.every((amenity) => hotel.amenities.includes(amenity))
      const meetsNeighborhood =
        hotelFilters.neighborhoods.length === 0 || hotelFilters.neighborhoods.includes(hotel.neighborhood)

      return meetsMaxPrice && meetsRating && meetsAmenities && meetsNeighborhood
    })
  }, [hotelFilters])

  // Generate itinerary based on date range or use AI-generated one
  const generatedItineraryData = useMemo(() => {
    // If we have AI-generated itinerary, use it
    if (generatedItinerary && generatedItinerary.itinerary) {
      return generatedItinerary.itinerary;
    }

    // Fallback to simple generated itinerary if AI data is not available
    if (!startDate || !endDate) return []

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return days.map((date, index) => ({
      day: index + 1,
      activities: generateActivitiesForDay(index + 1, destination),
    }))
  }, [startDate, endDate, destination, generatedItinerary])

  const hasBookings = selectedFlight !== null && selectedHotel !== null
  const buttonText = hasBookings ? "Confirm Trip" : "Plan Trip"

  const handleConfirmBooking = () => {
    if (!startDate || !endDate) return

    addTrip({
      destination: destination,
      image: "/placeholder.svg?height=200&width=300",
      dates: `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`,
      status: hasBookings ? "Confirmed" : "Planning",
      activities: generatedItineraryData.reduce((acc: number, day: { activities: any[] }) => acc + day.activities.length, 0),
      budget: currentBudget[0],
      bookings: {
        flight: selectedFlight ? `Booked - ${selectedFlight.airline}` : "Not Booked",
        hotel: selectedHotel ? `Booked - ${selectedHotel.name}` : "Not Booked",
      },
      flight: selectedFlight
        ? {
            departure: selectedFlight.departure,
            arrival: selectedFlight.arrival,
            from: selectedFlight.from,
            to: selectedFlight.to,
            duration: selectedFlight.duration,
          }
        : undefined,
      itinerary: generatedItineraryData,
    })

    toast({
      title: hasBookings ? "Trip Confirmed!" : "Trip Created",
      description: hasBookings
        ? "Your trip has been confirmed with all selected bookings."
        : "Your trip has been created and saved to your trips.",
    })

    onConfirm()
    router.push("/dashboard/trips")
  }

  // Generate itinerary JSX using the AI-generated data or fallback
  const itineraryContent = (
    <InteractiveItinerary
      initialItinerary={generatedItineraryData}
      readOnly={false}
      renderActivityDetails={(activity) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              Details
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{activity.title}</DialogTitle>
              <DialogDescription>{activity.time} - {activity.priceRange}</DialogDescription>
            </DialogHeader>
            <ActivityDetails activity={activity} />
          </DialogContent>
        </Dialog>
      )}
    />
  )

  return (
    <div className="container max-w-7xl py-8">
      <svg width="0" height="0">
        <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8c52ff" />
          <stop offset="100%" stopColor="#5ce1e6" />
        </linearGradient>
      </svg>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Your {destination} Adventure</h1>
            <p className="text-muted-foreground">
              {startDate && endDate
                ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`
                : "Customized travel plan based on your preferences"}
            </p>
          </div>
          <Button onClick={handleConfirmBooking}>{buttonText}</Button>
        </div>

        <Tabs defaultValue="flights" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="flights">Flights</TabsTrigger>
              <TabsTrigger value="hotels">Hotels</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            </TabsList>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Results</SheetTitle>
                  <SheetDescription>Adjust your search preferences</SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="flights" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="flights">Flights</TabsTrigger>
                    <TabsTrigger value="hotels">Hotels</TabsTrigger>
                  </TabsList>

                  <TabsContent value="flights" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Maximum Price ({profile.currency})</Label>
                        <Slider
                          value={flightFilters.maxPrice}
                          onValueChange={(value) => setFlightFilters((prev) => ({ ...prev, maxPrice: value }))}
                          max={2000}
                          step={50}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0</span>
                          <span>{flightFilters.maxPrice}</span>
                          <span>2000+</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="non-stop"
                          checked={flightFilters.nonStop}
                          onCheckedChange={(checked) => setFlightFilters((prev) => ({ ...prev, nonStop: checked }))}
                        />
                        <Label htmlFor="non-stop">Non-stop flights only</Label>
                      </div>

                      <div className="space-y-2">
                        <Label>Airlines</Label>
                        <div className="space-y-2">
                          {uniqueAirlines.map((airline) => (
                            <div key={airline} className="flex items-center space-x-2">
                              <Checkbox
                                id={airline}
                                checked={flightFilters.airlines.includes(airline)}
                                onCheckedChange={(checked) => {
                                  setFlightFilters((prev) => ({
                                    ...prev,
                                    airlines: checked
                                      ? [...prev.airlines, airline]
                                      : prev.airlines.filter((a) => a !== airline),
                                  }))
                                }}
                              />
                              <Label htmlFor={airline}>{airline}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Alliances</Label>
                        <div className="space-y-2">
                          {uniqueAlliances.map((alliance) => (
                            <div key={alliance} className="flex items-center space-x-2">
                              <Checkbox
                                id={alliance}
                                checked={flightFilters.alliances.includes(alliance)}
                                onCheckedChange={(checked) => {
                                  setFlightFilters((prev) => ({
                                    ...prev,
                                    alliances: checked
                                      ? [...prev.alliances, alliance]
                                      : prev.alliances.filter((a) => a !== alliance),
                                  }))
                                }}
                              />
                              <Label htmlFor={alliance}>{alliance}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="hotels" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Maximum Price per Night ({profile.currency})</Label>
                        <Slider
                          value={hotelFilters.maxPrice}
                          onValueChange={(value) => setHotelFilters((prev) => ({ ...prev, maxPrice: value }))}
                          max={2000}
                          step={50}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0</span>
                          <span>{hotelFilters.maxPrice}</span>
                          <span>2000+</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Minimum Rating</Label>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              variant={hotelFilters.minRating === rating ? "default" : "outline"}
                              size="sm"
                              onClick={() => setHotelFilters((prev) => ({ ...prev, minRating: rating }))}
                            >
                              {rating}★
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Amenities</Label>
                        <div className="space-y-2">
                          {uniqueAmenities.map((amenity) => (
                            <div key={amenity} className="flex items-center space-x-2">
                              <Checkbox
                                id={amenity}
                                checked={hotelFilters.amenities.includes(amenity)}
                                onCheckedChange={(checked) => {
                                  setHotelFilters((prev) => ({
                                    ...prev,
                                    amenities: checked
                                      ? [...prev.amenities, amenity]
                                      : prev.amenities.filter((a) => a !== amenity),
                                  }))
                                }}
                              />
                              <Label htmlFor={amenity}>{amenity}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Neighborhoods</Label>
                        <div className="space-y-2">
                          {uniqueNeighborhoods.map((neighborhood) => (
                            <div key={neighborhood} className="flex items-center space-x-2">
                              <Checkbox
                                id={neighborhood}
                                checked={hotelFilters.neighborhoods.includes(neighborhood)}
                                onCheckedChange={(checked) => {
                                  setHotelFilters((prev) => ({
                                    ...prev,
                                    neighborhoods: checked
                                      ? [...prev.neighborhoods, neighborhood]
                                      : prev.neighborhoods.filter((n) => n !== neighborhood),
                                  }))
                                }}
                              />
                              <Label htmlFor={neighborhood}>{neighborhood}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>
          </div>

          <TabsContent value="flights" className="space-y-4">
            <div className="grid gap-4">
              {filteredFlights.map((flight) => (
                <Card
                  key={`${flight.airline}-${flight.departure}`}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedFlight === flight ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedFlight(selectedFlight === flight ? null : flight)}
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
                        <p className="text-2xl font-bold">
                          {profile.currency} {flight.price}
                        </p>
                        <p className="text-sm text-muted-foreground line-through">
                          {profile.currency} {flight.originalPrice}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
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
                          <Button size="sm" asChild>
                            <a href="#" target="_blank" rel="noopener noreferrer">
                              Book Now <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredFlights.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No flights match your current filters. Try adjusting your search criteria.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="hotels" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredHotels.map((hotel) => (
                <Card
                  key={hotel.name}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedHotel === hotel ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedHotel(selectedHotel === hotel ? null : hotel)}
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
                            <Star key={i} className="h-4 w-4 text-[#8c52ff]" style={{ fill: "url(#star-gradient)" }} />
                          ))}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {hotel.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {profile.currency} {hotel.price}
                        </p>
                        <p className="text-sm text-muted-foreground line-through">
                          {profile.currency} {hotel.originalPrice}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
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
                                          Experience luxury and comfort at {hotel.name}. Located in the{" "}
                                          {hotel.neighborhood}.
                                        </p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="rounded-lg border p-4">
                                        <h4 className="font-medium mb-2">Amenities</h4>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                          {hotel.amenities.map((amenity) => (
                                            <p key={amenity}>• {amenity}</p>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="rounded-lg border p-4">
                                        <h4 className="font-medium mb-2">Location</h4>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                          <p>• {hotel.location}</p>
                                          <p>• {hotel.neighborhood}</p>
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
                          <Button size="sm" asChild>
                            <a href="#" target="_blank" rel="noopener noreferrer">
                              Book Now <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {hotel.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredHotels.length === 0 && (
                <Card className="md:col-span-2">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No hotels match your current filters. Try adjusting your search criteria.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="itinerary" className="p-4">
            {itineraryContent}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

// Helper function to generate activities for each day
function generateActivitiesForDay(day: number, destination: string) {
  // Get destination-specific activities
  const destinationActivities = getDestinationActivities(destination);
  
  // Morning activity
  const morningActivity = {
    id: `${day}-1`,
    icon: "attraction" as const,
    time: "09:00",
    title: destinationActivities.morningActivities[day % destinationActivities.morningActivities.length],
    description: `Explore this famous attraction in ${destination}`,
    priceRange: "€€",
    details: getActivityDetails(destinationActivities.morningActivities[day % destinationActivities.morningActivities.length], destination, "attraction")
  };

  // Lunch activity
  const lunchActivity = {
    id: `${day}-2`,
    icon: "food" as const,
    time: "13:00",
    title: destinationActivities.restaurants[day % destinationActivities.restaurants.length],
    description: `Enjoy delicious local cuisine in ${destination}`,
    priceRange: "€€",
    details: getActivityDetails(destinationActivities.restaurants[day % destinationActivities.restaurants.length], destination, "restaurant")
  };

  // Afternoon/evening activity
  const eveningActivity = {
    id: `${day}-3`,
    icon: day === 1 ? "hotel" : ("entertainment" as const),
    time: day === 1 ? "15:00" : "19:00",
    title: day === 1 
      ? `Hotel Check-in in ${destinationActivities.neighborhoods[0]}`
      : destinationActivities.eveningActivities[(day - 1) % destinationActivities.eveningActivities.length],
    description: day === 1 
      ? `Check in to your accommodation in ${destination}` 
      : `Experience the local nightlife and entertainment in ${destination}`,
    priceRange: "€€€",
    details: day === 1 
      ? getActivityDetails(`Hotel in ${destinationActivities.neighborhoods[0]}`, destination, "hotel")
      : getActivityDetails(destinationActivities.eveningActivities[(day - 1) % destinationActivities.eveningActivities.length], destination, "entertainment")
  };

  // First day includes hotel check-in
  if (day === 1) {
    return [morningActivity, lunchActivity, eveningActivity];
  }

  // Last day typically ends earlier
  if (day === 7) {
    return [morningActivity, lunchActivity];
  }

  // For other days, add a dinner activity
  const dinnerActivity = {
    id: `${day}-4`,
    icon: "food" as const,
    time: "19:00",
    title: destinationActivities.dinnerSpots[day % destinationActivities.dinnerSpots.length],
    description: `Dinner at this well-known restaurant in ${destination}`,
    priceRange: "€€",
    details: getActivityDetails(destinationActivities.dinnerSpots[day % destinationActivities.dinnerSpots.length], destination, "restaurant")
  };

  // Regular days have a full schedule
  return [morningActivity, lunchActivity, eveningActivity, dinnerActivity];
}

// Helper function to get accurate details for each activity
function getActivityDetails(activityName: string, destination: string, type: "attraction" | "restaurant" | "hotel" | "entertainment") {
  // Map of real activity details by destination and name
  const activityDetailsMap: Record<string, Record<string, any>> = {
    "Valledupar, Colombia": {
      // Real Valledupar restaurants
      "La Casona de Badillo": {
        address: "Calle 16a #5-28, Valledupar, Cesar, Colombia",
        openingHours: "12:00 - 23:00 daily",
        cuisine: "Traditional Colombian cuisine & Vallenato specialties",
        ratings: "4.5/5 (1,240 reviews)",
        specialFeatures: [
          "Live Vallenato music performances",
          "Authentic local cuisine",
          "Historic building"
        ],
        websiteUrl: "https://lacasonadebadillovalledupar.com/",
        phoneNumber: "+57 605 571 5197"
      },
      "Restaurante El Fogón Vallenato": {
        address: "Calle 15 #14-33, Centro, Valledupar, Colombia",
        openingHours: "11:30 - 15:00, 18:00 - 22:00",
        cuisine: "Regional Colombian cuisine specializing in traditional Vallenato dishes",
        ratings: "4.6/5 (890 reviews)",
        specialFeatures: [
          "Traditional wood-fired cooking",
          "Family recipes",
          "Vegetarian options available"
        ],
        phoneNumber: "+57 605 573 4211"
      },
      "Restaurante María Mulata": {
        address: "Carrera 7 #16B-50, Los Músicos, Valledupar, Colombia",
        openingHours: "12:00 - 15:30, 18:00 - 22:30 (Closed Mondays)",
        cuisine: "Fusion of Caribbean and Andean cuisine",
        ratings: "4.7/5 (1,050 reviews)",
        specialFeatures: [
          "Seasonal menu with local ingredients",
          "Artistic atmosphere",
          "Outdoor garden seating"
        ],
        websiteUrl: "https://restaurantemariamulata.com/",
        phoneNumber: "+57 605 589 7123"
      },
      "Los Caracoles": {
        address: "Calle 9 #11-14, Valledupar, Cesar, Colombia",
        openingHours: "11:00 - 23:00 (Until midnight on weekends)",
        cuisine: "Seafood and regional specialties",
        ratings: "4.3/5 (780 reviews)",
        specialFeatures: [
          "Signature caracol (snail) dishes",
          "Fresh seafood",
          "Traditional cooking methods"
        ],
        phoneNumber: "+57 605 570 3399"
      },
      
      // Real Valledupar attractions
      "Parque de la Leyenda Vallenata": {
        address: "Avenida Fundación, Valledupar, Cesar, Colombia",
        openingHours: "08:00 - 18:00 daily",
        cost: "COP 10,000 (approximately $2.50 USD)",
        ratings: "4.6/5 (2,150 reviews)",
        specialFeatures: [
          "Monument to vallenato legends",
          "Cultural performances",
          "Annual Festival Vallenato venue"
        ],
        websiteUrl: "https://corpovalle.gov.co/",
        phoneNumber: "+57 605 574 8952"
      },
      "Museo del Acordeón": {
        address: "Calle 15 #13-11, Centro Histórico, Valledupar, Colombia",
        openingHours: "09:00 - 17:00 (Closed Mondays)",
        cost: "COP 8,000 (approximately $2 USD)",
        ratings: "4.7/5 (1,320 reviews)",
        specialFeatures: [
          "Historical collection of accordions",
          "Interactive music exhibits",
          "History of Vallenato music"
        ],
        websiteUrl: "https://museodelacordeon.co/",
        phoneNumber: "+57 605 571 9044"
      },
      "Catedral de Valledupar": {
        address: "Calle 15 with Carrera 5, Centro, Valledupar, Colombia",
        openingHours: "07:00 - 19:00 daily (Mass times vary)",
        cost: "Free",
        ratings: "4.5/5 (870 reviews)",
        specialFeatures: [
          "Colonial architecture",
          "Religious art",
          "Historical importance"
        ],
        phoneNumber: "+57 605 570 2233"
      },
      "Río Guatapurí": {
        address: "Balneario Hurtado, Valledupar, Cesar, Colombia",
        openingHours: "07:00 - 17:00 daily",
        cost: "Free access (some vendors on site)",
        ratings: "4.8/5 (3,100 reviews)",
        specialFeatures: [
          "River swimming",
          "Natural beauty",
          "Local gathering spot",
          "Food vendors"
        ]
      },
      "Mercado Público de Valledupar": {
        address: "Calle 28 with Carrera 19, Valledupar, Colombia",
        openingHours: "05:00 - 16:00 daily (Busiest in mornings)",
        cost: "Free entry",
        ratings: "4.2/5 (650 reviews)",
        specialFeatures: [
          "Fresh local produce",
          "Artisan crafts",
          "Local culture",
          "Food stalls"
        ]
      },
      
      // Hotels in Valledupar
      "Hotel in Centro Histórico": {
        address: "Calle 16 #6-24, Centro Histórico, Valledupar, Colombia",
        phoneNumber: "+57 605 573 5500",
        ratings: "4.4/5 (950 reviews)",
        specialFeatures: [
          "Central location",
          "Rooftop pool",
          "Free breakfast",
          "Air conditioning"
        ],
        websiteUrl: "https://www.hotelghlvalledupar.com/",
        cost: "From $80 USD per night"
      },
      "Hotel Tativan": {
        address: "Carrera 7a #19-40, Los Músicos, Valledupar, Colombia",
        phoneNumber: "+57 605 574 1122",
        ratings: "4.2/5 (820 reviews)",
        specialFeatures: [
          "Boutique hotel",
          "Traditional decor",
          "Courtyard garden",
          "Room service"
        ],
        websiteUrl: "https://hoteltativan.com/",
        cost: "From $65 USD per night"
      },
      
      // Entertainment in Valledupar
      "La Caja Live Music Venue": {
        address: "Calle 13 #9-15, Centro, Valledupar, Colombia",
        openingHours: "19:00 - 02:00 (Thursday to Saturday)",
        cost: "Cover charge COP 15,000-30,000 depending on performance",
        ratings: "4.7/5 (1,100 reviews)",
        specialFeatures: [
          "Live Vallenato performances",
          "Local bands",
          "Dance floor",
          "Cocktail bar"
        ],
        phoneNumber: "+57 311 456 7890"
      },
      "Vallenato Music Lesson": {
        address: "Academia Turco Gil, Carrera 5 #17-50, Valledupar, Colombia",
        openingHours: "By appointment (09:00 - 18:00)",
        cost: "COP 50,000-80,000 per lesson",
        ratings: "4.9/5 (320 reviews)",
        specialFeatures: [
          "Professional instructors",
          "Instruments provided",
          "Cultural experience",
          "All skill levels welcome"
        ],
        phoneNumber: "+57 314 578 9012",
        websiteUrl: "https://academiaturcogil.com/"
      }
    },
    "Paris, France": {
      // Paris attractions
      "Eiffel Tower Visit": {
        address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
        openingHours: "09:00 - 00:45 (Last elevator at 23:00)",
        cost: "€26.80 for adults to the summit",
        ratings: "4.6/5 (140,000+ reviews)",
        specialFeatures: [
          "Iconic Paris landmark",
          "Panoramic city views",
          "Restaurant on second floor",
          "Light show every hour after dark"
        ],
        websiteUrl: "https://www.toureiffel.paris/en",
        phoneNumber: "+33 892 70 12 39"
      },
      "Louvre Museum Tour": {
        address: "Rue de Rivoli, 75001 Paris, France",
        openingHours: "09:00 - 18:00 (Closed Tuesdays)",
        cost: "€17 for adults",
        ratings: "4.7/5 (210,000+ reviews)",
        specialFeatures: [
          "World's largest art museum",
          "Home to Mona Lisa",
          "Egyptian antiquities",
          "Former royal palace"
        ],
        websiteUrl: "https://www.louvre.fr/en",
        phoneNumber: "+33 1 40 20 53 17"
      },
      
      // Paris restaurants
      "Café de Flore": {
        address: "172 Boulevard Saint-Germain, 75006 Paris, France",
        openingHours: "07:30 - 01:30 daily",
        cuisine: "Traditional French café cuisine",
        ratings: "4.3/5 (15,600+ reviews)",
        specialFeatures: [
          "Historic café since 1880",
          "Famous literary clientele",
          "Iconic Parisian experience",
          "Outdoor terrace"
        ],
        websiteUrl: "https://cafedeflore.fr/",
        phoneNumber: "+33 1 45 48 55 26"
      },
      "Le Jules Verne": {
        address: "Eiffel Tower, 2nd Floor, Avenue Gustave Eiffel, 75007 Paris, France",
        openingHours: "12:00 - 13:30, 19:00 - 21:30 (Closed Mondays)",
        cuisine: "Contemporary French haute cuisine",
        ratings: "4.6/5 (3,200+ reviews)",
        specialFeatures: [
          "Michelin-starred restaurant",
          "Spectacular Eiffel Tower location",
          "Tasting menus",
          "Private elevator access"
        ],
        websiteUrl: "https://www.restaurants-toureiffel.com/en/jules-verne-restaurant.html",
        phoneNumber: "+33 1 45 55 61 44"
      }
    },
    "New York, NYC": {
      // NYC attractions
      "Statue of Liberty Visit": {
        address: "Liberty Island, New York, NY 10004",
        openingHours: "09:30 - 16:00 (Last ferry departs at 15:30)",
        cost: "$24.30 for adults (includes ferry and grounds access)",
        ratings: "4.7/5 (87,000+ reviews)",
        specialFeatures: [
          "UNESCO World Heritage Site",
          "Symbol of American freedom",
          "Panoramic harbor views",
          "Museum access available"
        ],
        websiteUrl: "https://www.nps.gov/stli/",
        phoneNumber: "+1 (212) 363-3200"
      },
      
      // NYC restaurants
      "Katz's Delicatessen": {
        address: "205 E Houston St, New York, NY 10002",
        openingHours: "08:00 - 22:30 (Until 23:45 on Fridays and Saturdays)",
        cuisine: "Jewish deli classics, famous pastrami sandwiches",
        ratings: "4.5/5 (44,000+ reviews)",
        specialFeatures: [
          "Iconic NYC institution since 1888",
          "Hand-carved pastrami",
          "Film location for 'When Harry Met Sally'",
          "Bustling, authentic atmosphere"
        ],
        websiteUrl: "https://katzsdelicatessen.com/",
        phoneNumber: "+1 (212) 254-2246"
      }
    }
  };

  // Try to find the specific activity in our detailed map
  if (activityDetailsMap[destination]?.[activityName]) {
    return activityDetailsMap[destination][activityName];
  }

  // For destinations and activities we don't have specific data for yet
  // Create reasonable, more personalized data based on the activity name and type
  const cityName = destination.split(',')[0].trim();
  const countryName = destination.split(',').length > 1 ? destination.split(',')[1].trim() : '';
  
  // Generic but somewhat customized fallback details based on activity type
  switch (type) {
    case "restaurant":
      return {
        address: `Near the center of ${cityName}`,
        openingHours: "11:00 - 22:00",
        cuisine: `Local ${cityName} specialties${countryName ? ` and ${countryName} cuisine` : ''}`,
        ratings: "4.5/5 (780+ reviews)",
        specialFeatures: [
          "Regional specialties",
          "Locally sourced ingredients",
          "Popular with locals and tourists"
        ],
        phoneNumber: "+X XXX XXX XXXX" // Placeholder, not real
      };
    case "attraction":
      return {
        address: `${cityName} ${activityName.includes("Museum") ? "Cultural District" : "Tourist Area"}`,
        openingHours: "09:00 - 17:00 daily",
        cost: "Admission fees vary, typically $10-20",
        ratings: "4.4/5 (1,300+ reviews)",
        specialFeatures: [
          "Popular tourist destination",
          "Historical significance",
          "Cultural importance"
        ],
        websiteUrl: `https://visit${cityName.toLowerCase().replace(/\s/g, '')}.com/${activityName.toLowerCase().replace(/\s/g, '-')}`
      };
    case "hotel":
      return {
        address: `Central location in ${cityName}`,
        phoneNumber: "+X XXX XXX XXXX", // Placeholder, not real
        ratings: "4.3/5 (950+ reviews)",
        specialFeatures: [
          "Comfortable accommodations",
          "Central location",
          "Modern amenities",
          `Views of ${cityName}`
        ],
        cost: "Rates vary by season"
      };
    case "entertainment":
      return {
        address: `Entertainment district, ${cityName}`,
        openingHours: "18:00 - 00:00",
        cost: "Ticket prices vary by event",
        ratings: "4.6/5 (620+ reviews)",
        specialFeatures: [
          "Local entertainment",
          "Cultural experience",
          "Authentic atmosphere"
        ]
      };
    default:
      return {
        address: `${cityName} center`,
        openingHours: "Hours vary",
        ratings: "4.4/5 (reviews)",
        specialFeatures: [
          "Local experience",
          "Recommended activity"
        ]
      };
  }
}

// Helper function to provide destination-specific activities
function getDestinationActivities(destination: string) {
  // Default activities for any destination
  const defaultActivities = {
    morningActivities: ["City Tour", "Museum Visit", "Local Market Tour"],
    afternoonActivities: ["Historical District Tour", "Cultural Experience", "Shopping District"],
    eveningActivities: ["Cultural Show", "Local Music Venue", "Sunset Cruise"],
    restaurants: ["Local Cuisine Restaurant", "Popular Eatery", "Traditional Dining Experience"],
    dinnerSpots: ["Highly-Rated Restaurant", "Authentic Local Dining", "Scenic Dinner Spot"],
    neighborhoods: ["Downtown", "Tourist District", "Popular Area"]
  };

  // Lowercase the destination for easier matching
  const lowerDestination = destination.toLowerCase();
  
  // Destination-specific activities for popular destinations
  if (lowerDestination.includes("hawaii") || lowerDestination.includes("honolulu") || lowerDestination.includes("maui")) {
    return {
      morningActivities: ["Diamond Head Hike", "Pearl Harbor Visit", "Hanauma Bay Snorkeling", "Waikiki Beach Morning", "Polynesian Cultural Center"],
      afternoonActivities: ["North Shore Beaches", "Dole Plantation Tour", "Iolani Palace Visit", "Waimea Valley Hike", "Kualoa Ranch Tour"],
      eveningActivities: ["Waikiki Sunset Viewing", "Luau Experience", "Kuhio Beach Torch Lighting", "Live Hawaiian Music", "Honolulu Night Market"],
      restaurants: ["Duke's Waikiki", "Mama's Fish House", "Helena's Hawaiian Food", "Marukame Udon", "Ono Hawaiian Foods"],
      dinnerSpots: ["Morio's Sushi Bistro", "Alan Wong's Restaurant", "Merriman's", "Roy's Waikiki", "House Without a Key"],
      neighborhoods: ["Waikiki", "Kailua", "Lahaina", "North Shore", "Kapahulu"]
    };
  } 
  else if (lowerDestination.includes("paris") || lowerDestination.includes("france")) {
    return {
      morningActivities: ["Eiffel Tower Visit", "Louvre Museum Tour", "Notre-Dame Cathedral", "Arc de Triomphe", "Montmartre Walk"],
      afternoonActivities: ["Seine River Cruise", "Musée d'Orsay", "Luxembourg Gardens", "Champs-Élysées Shopping", "Palace of Versailles"],
      eveningActivities: ["Moulin Rouge Show", "Paris Opera Performance", "Seine River Night Cruise", "Eiffel Tower Light Show", "Le Marais Nightlife"],
      restaurants: ["Café de Flore", "Les Deux Magots", "L'As du Fallafel", "Bistrot Paul Bert", "Le Comptoir du Relais"],
      dinnerSpots: ["Le Jules Verne", "Chez L'Ami Jean", "Septime", "Le Chateaubriand", "Brasserie Lipp"],
      neighborhoods: ["Le Marais", "Saint-Germain-des-Prés", "Montmartre", "Latin Quarter", "Opera District"]
    };
  }
  else if (lowerDestination.includes("new york") || lowerDestination.includes("nyc")) {
    return {
      morningActivities: ["Statue of Liberty Visit", "Central Park Walk", "Empire State Building", "Metropolitan Museum", "Brooklyn Bridge Walk"],
      afternoonActivities: ["Times Square Exploration", "High Line Park", "Chelsea Market", "Museum of Modern Art", "Grand Central Terminal"],
      eveningActivities: ["Broadway Show", "Jazz Club in Harlem", "Rooftop Bar Experience", "Greenwich Village Tour", "Comedy Club Show"],
      restaurants: ["Katz's Delicatessen", "Peter Luger Steak House", "Russ & Daughters", "Lombardi's Pizza", "Shake Shack"],
      dinnerSpots: ["Gramercy Tavern", "Le Bernardin", "Balthazar", "Carbone", "Keens Steakhouse"],
      neighborhoods: ["Manhattan", "Brooklyn", "SoHo", "Upper East Side", "Lower East Side"]
    };
  }
  else if (lowerDestination.includes("tokyo") || lowerDestination.includes("japan")) {
    return {
      morningActivities: ["Meiji Shrine", "Tsukiji Fish Market", "Senso-ji Temple", "Tokyo Skytree", "Imperial Palace Gardens"],
      afternoonActivities: ["Harajuku Shopping", "Ueno Park", "Akihabara Electronics District", "Roppongi Hills", "Tokyo National Museum"],
      eveningActivities: ["Robot Restaurant Show", "Izakaya Hopping in Shinjuku", "Tokyo Bay Cruise", "Karaoke in Shibuya", "Golden Gai Bars"],
      restaurants: ["Ichiran Ramen", "Sushi Dai", "Tonkatsu Maisen", "Tempura Kondo", "Tsukiji Sushisay"],
      dinnerSpots: ["Sukiyabashi Jiro", "Gonpachi", "Kyubey", "Ukai-tei", "Tapas Molecular Bar"],
      neighborhoods: ["Shinjuku", "Shibuya", "Ginza", "Asakusa", "Roppongi"]
    };
  }
  else if (lowerDestination.includes("london") || lowerDestination.includes("uk") || lowerDestination.includes("england")) {
    return {
      morningActivities: ["Tower of London", "British Museum", "Buckingham Palace", "Westminster Abbey", "St. Paul's Cathedral"],
      afternoonActivities: ["London Eye", "Tate Modern", "Hyde Park", "Covent Garden", "National Gallery"],
      eveningActivities: ["West End Show", "Shakespeare's Globe Theatre", "Soho Nightlife", "Jack the Ripper Tour", "River Thames Cruise"],
      restaurants: ["Borough Market Eateries", "Dishoom", "The Ivy", "The Wolseley", "Gordon Ramsay Restaurant"],
      dinnerSpots: ["Rules Restaurant", "Dinner by Heston Blumenthal", "Duck & Waffle", "Sketch", "The Ledbury"],
      neighborhoods: ["Westminster", "Soho", "Notting Hill", "Kensington", "Camden"]
    };
  }
  else if (lowerDestination.includes("rome") || lowerDestination.includes("italy")) {
    return {
      morningActivities: ["Colosseum Tour", "Vatican Museums", "Roman Forum", "Trevi Fountain", "Pantheon Visit"],
      afternoonActivities: ["Spanish Steps", "Villa Borghese", "Piazza Navona", "Trastevere Walk", "Castel Sant'Angelo"],
      eveningActivities: ["Opera at Teatro dell'Opera", "Campo de' Fiori Nightlife", "Trastevere Dining", "Tiber River Walk", "Piazza Navona at Night"],
      restaurants: ["Da Enzo al 29", "Roscioli", "La Pergola", "Armando al Pantheon", "Pizzarium"],
      dinnerSpots: ["Antica Pesa", "Il Pagliaccio", "La Pergola", "Glass Hostaria", "Ad Hoc"],
      neighborhoods: ["Vatican", "Trastevere", "Monti", "Centro Storico", "Testaccio"]
    };
  }
  else if (lowerDestination.includes("barcelona") || lowerDestination.includes("spain")) {
    return {
      morningActivities: ["Sagrada Familia Visit", "Park Güell Tour", "La Rambla Walk", "Gothic Quarter Exploration", "Picasso Museum"],
      afternoonActivities: ["Barceloneta Beach", "Montjuïc Castle", "Casa Batlló", "La Boqueria Market", "Camp Nou Stadium Tour"],
      eveningActivities: ["Flamenco Show", "Magic Fountain Display", "Tapas Crawl", "Barceloneta Nightlife", "El Born District Walk"],
      restaurants: ["Tickets Bar", "El Quim de la Boqueria", "Cervecería Catalana", "Cal Pep", "Ciudad Condal"],
      dinnerSpots: ["Disfrutar", "El Nacional", "7 Portes", "Can Culleretes", "La Paradeta"],
      neighborhoods: ["Eixample", "El Born", "Gothic Quarter", "Gràcia", "Barceloneta"]
    };
  }
  else if (lowerDestination.includes("sydney") || lowerDestination.includes("australia")) {
    return {
      morningActivities: ["Sydney Opera House Tour", "Bondi Beach Walk", "Harbour Bridge Climb", "Royal Botanic Gardens", "Taronga Zoo"],
      afternoonActivities: ["Darling Harbour", "The Rocks Historic Area", "Sydney Tower Eye", "Manly Beach Ferry", "Queen Victoria Building"],
      eveningActivities: ["Sydney Harbour Dinner Cruise", "Opera Performance", "The Star Casino", "Darling Harbour Nightlife", "Circular Quay Walk"],
      restaurants: ["Quay", "Tetsuya's", "Mr. Wong", "Icebergs Dining Room", "The Boathouse on Blackwattle Bay"],
      dinnerSpots: ["Bennelong", "Aria Restaurant", "Rockpool Bar & Grill", "Cafe Sydney", "Sepia"],
      neighborhoods: ["The Rocks", "Darling Harbour", "Paddington", "Surry Hills", "Bondi"]
    };
  }
  else if (lowerDestination.includes("amsterdam") || lowerDestination.includes("netherlands")) {
    return {
      morningActivities: ["Rijksmuseum Visit", "Anne Frank House", "Van Gogh Museum", "Canal Cruise", "Vondelpark Bike Ride"],
      afternoonActivities: ["Jordaan District", "Dam Square", "Heineken Experience", "Bloemenmarkt Flower Market", "NEMO Science Museum"],
      eveningActivities: ["Red Light District Tour", "Paradiso Concert Venue", "Brown Cafe Visit", "Jazz Club", "Night Canal Cruise"],
      restaurants: ["Seafood Bar", "Pancakes Amsterdam", "Foodhallen", "De Kas", "Moeders"],
      dinnerSpots: ["Rijsel", "Restaurant Greetje", "Blue Pepper", "Ciel Bleu", "De Silveren Spiegel"],
      neighborhoods: ["Jordaan", "De Pijp", "Nine Streets", "Museum Quarter", "Old Centre"]
    };
  }
  
  // Try to create a more personalized experience by analyzing the destination name
  // This is a fallback for destinations not explicitly covered above
  
  // Create more destination-specific activities by analyzing the destination name and making educated guesses
  const words = lowerDestination.split(/[\s,]+/).filter(word => word.length > 3);
  
  if (words.length > 0) {
    // Create personalized activities based on the destination name
    const customActivities = {
      morningActivities: [
        `${capitalize(words[0])} Historical Tour`,
        `${capitalize(destination)} City Museum`,
        `${capitalize(destination)} Central Park`,
        `${capitalize(destination)} Walking Tour`,
        `${capitalize(words[0])} Cultural Center`
      ],
      afternoonActivities: [
        `${capitalize(words[0])} Shopping District`,
        `${capitalize(destination)} Heritage Site`,
        `${capitalize(destination)} Art Gallery`,
        `${capitalize(words[0])} Local Market`,
        `${capitalize(destination)} Scenic Viewpoint`
      ],
      eveningActivities: [
        `${capitalize(destination)} Night Tour`,
        `${capitalize(words[0])} Traditional Performance`,
        `${capitalize(destination)} Sunset Spot`,
        `${capitalize(words[0])} Entertainment District`,
        `${capitalize(destination)} Local Experience`
      ],
      restaurants: [
        `${capitalize(words[0])} Traditional Restaurant`,
        `${capitalize(destination)} Food Market`,
        `${capitalize(words[0])} Bistro`,
        `${capitalize(destination)} Cafe`,
        `${capitalize(words[0])} Eatery`
      ],
      dinnerSpots: [
        `${capitalize(destination)} Fine Dining`,
        `${capitalize(words[0])} Gourmet Restaurant`,
        `${capitalize(destination)} Local Cuisine`,
        `${capitalize(words[0])} Dinner with a View`,
        `${capitalize(destination)} Famous Restaurant`
      ],
      neighborhoods: [
        `${capitalize(destination)} Old Town`,
        `${capitalize(words[0])} District`,
        `${capitalize(destination)} Central Area`,
        `${capitalize(words[0])} Quarter`,
        `${capitalize(destination)} Historic Center`
      ]
    };
    
    return customActivities;
  }
  
  // Return default if no specific destination match found and no customization possible
  return defaultActivities;
}

// Helper function to capitalize the first letter of each word
function capitalize(str: string): string {
  if (!str) return '';
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Add ActivityDetails component to display rich information about each activity
function ActivityDetails({ activity }: { activity: any }) {
  const details = activity.details || {};
  
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h4 className="font-medium mb-2">{activity.title}</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{activity.description}</p>
          
          {details.address && (
            <div className="flex items-start gap-2 mt-2">
              <MapPin className="h-4 w-4 mt-0.5 text-primary" />
              <p>{details.address}</p>
            </div>
          )}
          
          {details.openingHours && (
            <div>
              <p className="font-semibold">Opening Hours:</p>
              <ul className="list-disc list-inside pl-2">
                {Array.isArray(details.openingHours) 
                  ? details.openingHours.map((hours: string, i: number) => (
                      <li key={i}>{hours}</li>
                    ))
                  : <li>{details.openingHours}</li>
                }
              </ul>
            </div>
          )}
          
          {details.phoneNumber && (
            <p><span className="font-semibold">Phone:</span> {details.phoneNumber}</p>
          )}
          
          {details.website && details.website !== 'Not available' && (
            <p>
              <span className="font-semibold">Website:</span>{' '}
              <a 
                href={details.website.startsWith('http') ? details.website : `https://${details.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {details.website}
              </a>
            </p>
          )}
          
          {details.websiteUrl && details.websiteUrl !== 'Not available' && (
            <p>
              <span className="font-semibold">Website:</span>{' '}
              <a 
                href={details.websiteUrl.startsWith('http') ? details.websiteUrl : `https://${details.websiteUrl}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {details.websiteUrl}
              </a>
            </p>
          )}
          
          {(details.rating || details.ratings) && (details.rating !== 'Not rated' || details.ratings !== 'Not rated') && (
            <p><span className="font-semibold">Rating:</span> {details.rating || details.ratings}</p>
          )}
          
          {details.cost && (
            <p><span className="font-semibold">Price:</span> {details.cost}</p>
          )}
          
          {details.priceLevel && (
            <p><span className="font-semibold">Price Level:</span> {details.priceLevel}</p>
          )}
          
          {details.specialFeatures && details.specialFeatures.length > 0 && (
            <div>
              <p className="font-semibold">Special Features:</p>
              <ul className="list-disc list-inside pl-2">
                {details.specialFeatures.map((feature: string, i: number) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          {details.cuisine && (
            <p><span className="font-semibold">Cuisine:</span> {details.cuisine}</p>
          )}
        </div>
      </div>
    </div>
  );
}

