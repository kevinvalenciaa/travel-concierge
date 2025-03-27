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
  };

  // Lunch activity
  const lunchActivity = {
    id: `${day}-2`,
    icon: "food" as const,
    time: "13:00",
    title: destinationActivities.restaurants[day % destinationActivities.restaurants.length],
    description: `Enjoy delicious local cuisine in ${destination}`,
    priceRange: "€€",
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
  };

  // Regular days have a full schedule
  return [morningActivity, lunchActivity, eveningActivity, dinnerActivity];
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
  
  // Destination-specific activities
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
  // Return default if no specific destination match found
  return defaultActivities;
}

