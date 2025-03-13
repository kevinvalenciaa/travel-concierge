import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Star, MapPin } from "lucide-react"
import Image from "next/image"

const hotels = [
  {
    name: "The Ritz-Carlton",
    location: "Paris, France",
    price: 850,
    rating: 5,
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["Spa", "Pool", "Restaurant", "Gym"],
    savings: "Save 30%",
    description: "Luxury hotel with stunning views of the Eiffel Tower",
  },
  {
    name: "Park Hyatt",
    location: "Tokyo, Japan",
    price: 650,
    rating: 5,
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["Spa", "Pool", "Restaurant", "Bar"],
    savings: "Save 25%",
    description: "Modern luxury in the heart of Shinjuku",
  },
]

export default function HotelsPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Hotel Deals</h2>
        <p className="text-muted-foreground">Find the perfect place to stay at the best prices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Hotels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Destination</Label>
            <Input placeholder="Where do you want to stay?" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Check-in Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Pick a date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Check-out Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Pick a date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button className="w-full">Search Hotels</Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recommended Hotels</h3>
        <div className="grid gap-6">
          {hotels.map((hotel, index) => (
            <Card key={index}>
              <CardContent className="p-0">
                <div className="grid md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr]">
                  <div className="relative h-[200px] md:h-full">
                    <Image src={hotel.image || "/placeholder.svg"} alt={hotel.name} fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold">{hotel.name}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{hotel.location}</span>
                        </div>
                        <div className="mt-2 flex">
                          {Array.from({ length: hotel.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          ${hotel.price}
                          <span className="text-sm font-normal">/night</span>
                        </div>
                        <div className="text-sm text-green-600">{hotel.savings}</div>
                      </div>
                    </div>
                    <p className="mt-4 text-muted-foreground">{hotel.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {hotel.amenities.map((amenity) => (
                        <span key={amenity} className="rounded-full bg-secondary px-3 py-1 text-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 flex space-x-4">
                      <Button className="flex-1">Book Now</Button>
                      <Button variant="outline" className="flex-1">
                        View Details
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

