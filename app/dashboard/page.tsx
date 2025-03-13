"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, TrendingUp, Globe, Bell, MapPin, Clock, Star, ArrowRight, ExternalLink } from "lucide-react"
import Image from "next/image"
import { TripDetailsDialog } from "@/components/trips/trip-details-dialog"
import { EditTripDialog } from "@/components/trips/edit-trip-dialog"
import { useTrips } from "@/contexts/trips-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { flightReviews, hotelReviews } from "@/data/reviews"
import { LocationMap } from "@/components/location-map"
import { useProfile } from "@/contexts/profile-context"

const insights = [
  {
    title: "Price Alert",
    icon: TrendingUp,
    content: "Flight prices to Paris have dropped 20% in the last week",
  },
  {
    title: "Destination Pick",
    icon: Globe,
    content: "Based on your interests, you might love visiting Barcelona",
  },
  {
    title: "Travel Alert",
    icon: Bell,
    content: "New visa requirements for Japan starting next month",
  },
]

const flightDeals = [
  {
    from: "New York",
    to: "Paris",
    price: "$449",
    airline: "Air France",
    savings: "Save $200",
    departure: "10:30 PM",
    arrival: "11:45 AM",
    duration: "7h 15m",
  },
  {
    from: "New York",
    to: "Tokyo",
    price: "$799",
    airline: "Japan Airlines",
    savings: "Save $350",
    departure: "11:45 AM",
    arrival: "4:20 PM",
    duration: "14h 35m",
  },
]

const hotelDeals = [
  {
    name: "The Ritz-Carlton",
    location: "Paris",
    price: "$450/night",
    rating: 5,
    savings: "Save 30%",
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["Spa", "Pool", "Restaurant"],
  },
  {
    name: "Park Hyatt",
    location: "Tokyo",
    price: "$380/night",
    rating: 5,
    savings: "Save 25%",
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["Spa", "Pool", "Restaurant"],
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { trips } = useTrips()
  const upcomingTrips = trips.upcoming
  const { toast } = useToast()
  const { profile } = useProfile()
  const firstName = profile.name.split(" ")[0]

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <svg width="0" height="0">
        <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8c52ff" />
          <stop offset="100%" stopColor="#5ce1e6" />
        </linearGradient>
      </svg>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#8c52ff] to-[#5ce1e6] bg-clip-text text-transparent">
            Hey {firstName}, ready for your next adventure?
          </h2>
          <p className="text-muted-foreground">Here's what's happening with your travel plans</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push("/dashboard/new-trip")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Plan a New Trip
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Upcoming Trips</h3>
        {upcomingTrips.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingTrips.map((trip) => (
              <Card key={trip.id}>
                <div className="relative h-48">
                  <Image
                    src={trip.image || "/placeholder.svg"}
                    alt={trip.destination}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="p-4">
                  <h4 className="text-xl font-semibold">{trip.destination}</h4>
                  <p className="text-sm text-muted-foreground">{trip.dates}</p>
                  <div className="mt-4 flex justify-between text-sm">
                    <span>Budget: {trip.budget}</span>
                    <span>{trip.style}</span>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <TripDetailsDialog trip={trip} />
                    <EditTripDialog trip={trip} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground">Where should we go next, traveler?</p>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{insight.content}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="space-y-8">
        {/* Flight Deals Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Exclusive Flight Deals</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {flightDeals.map((deal, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{deal.airline}</h4>
                        <span className="text-sm text-green-600">{deal.savings}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {deal.duration}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{deal.departure}</p>
                          <p className="text-sm text-muted-foreground">{deal.from}</p>
                        </div>
                        <ArrowRight className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{deal.arrival}</p>
                          <p className="text-sm text-muted-foreground">{deal.to}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{deal.price}</p>
                      <div className="flex gap-2 mt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">View Details</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{deal.airline} Flight Details</DialogTitle>
                              <DialogDescription>
                                Flight from {deal.from} to {deal.to}
                              </DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="details">
                              <TabsList>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                              </TabsList>
                              <TabsContent value="details">
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <div className="flex items-center gap-4">
                                      <div>
                                        <p className="font-medium">{deal.departure}</p>
                                        <p className="text-sm text-muted-foreground">{deal.from}</p>
                                      </div>
                                      <ArrowRight className="h-4 w-4" />
                                      <div>
                                        <p className="font-medium">{deal.arrival}</p>
                                        <p className="text-sm text-muted-foreground">{deal.to}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Clock className="h-4 w-4" />
                                      {deal.duration}
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                      <div className="text-sm text-green-600">{deal.savings}</div>
                                      <div>
                                        <p className="text-2xl font-bold">{deal.price}</p>
                                        <Button asChild>
                                          <a
                                            href={`https://www.expedia.com/Flights-Search?leg1=${deal.from}-${deal.to}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center"
                                          >
                                            Book Now
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="reviews" className="h-[400px] overflow-auto">
                                <div className="space-y-4">
                                  {flightReviews[deal.airline]?.map((review) => (
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
                        <Button asChild>
                          <a
                            href={`https://www.expedia.com/Flights-Search?leg1=${deal.from}-${deal.to}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
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
        </div>

        {/* Hotel Deals Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Exclusive Hotel Deals</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {hotelDeals.map((deal, index) => (
              <Card key={index}>
                <div className="relative h-48">
                  <Image
                    src={deal.image || "/placeholder.svg"}
                    alt={deal.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{deal.name}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: deal.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-[#8c52ff]" style={{ fill: "url(#star-gradient)" }} />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {deal.location}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {deal.amenities.map((amenity) => (
                          <span key={amenity} className="text-xs bg-muted px-2 py-1 rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{deal.price}</p>
                      <p className="text-sm text-green-600">{deal.savings}</p>
                      <div className="flex gap-2 mt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">View Details</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{deal.name}</DialogTitle>
                              <DialogDescription>{deal.location}</DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="details">
                              <TabsList>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="location">Location</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                              </TabsList>
                              <TabsContent value="details">
                                <div className="grid gap-4 py-4">
                                  <div className="relative h-48">
                                    <Image
                                      src={deal.image || "/placeholder.svg"}
                                      alt={deal.name}
                                      fill
                                      className="object-cover rounded-lg"
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: deal.rating }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className="h-4 w-4 text-[#8c52ff]"
                                          style={{ fill: "url(#star-gradient)" }}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <MapPin className="h-4 w-4" />
                                      {deal.location}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      {deal.amenities.map((amenity) => (
                                        <span key={amenity} className="text-xs bg-muted px-2 py-1 rounded-full">
                                          {amenity}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                      <div className="text-sm text-green-600">{deal.savings}</div>
                                      <div>
                                        <p className="text-2xl font-bold">{deal.price}</p>
                                        <Button asChild>
                                          <a
                                            href={`https://www.booking.com/search.html?ss=${encodeURIComponent(
                                              deal.name + " " + deal.location,
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center"
                                          >
                                            Book Now
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="location">
                                <LocationMap hotelName={deal.name} />
                              </TabsContent>
                              <TabsContent value="reviews" className="h-[400px] overflow-auto">
                                <div className="space-y-4">
                                  {hotelReviews[deal.name]?.map((review) => (
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
                        <Button asChild>
                          <a
                            href={`https://www.booking.com/search.html?ss=${encodeURIComponent(
                              deal.name + " " + deal.location,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
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
        </div>
      </div>
    </div>
  )
}

