import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, PlaneTakeoff, ArrowRight } from "lucide-react"

const deals = [
  {
    from: "New York (JFK)",
    to: "Paris (CDG)",
    price: 449,
    airline: "Air France",
    departure: "10:30 PM",
    arrival: "11:45 AM",
    date: "Feb 15, 2024",
    savings: "Save $200",
  },
  {
    from: "New York (JFK)",
    to: "Tokyo (NRT)",
    price: 799,
    airline: "Japan Airlines",
    departure: "11:45 AM",
    arrival: "4:20 PM",
    date: "Mar 10, 2024",
    savings: "Save $350",
  },
]

export default function FlightsPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Flight Deals</h2>
        <p className="text-muted-foreground">Find the best flight deals based on your preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Flights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>From</Label>
              <Input placeholder="Departure city" />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input placeholder="Destination city" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Departure Date</Label>
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
              <Label>Return Date</Label>
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
          <Button className="w-full">Search Flights</Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recommended Deals</h3>
        <div className="grid gap-4">
          {deals.map((deal, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <PlaneTakeoff className="h-8 w-8 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{deal.from}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="font-semibold">{deal.to}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {deal.airline} • {deal.date}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {deal.departure} - {deal.arrival}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${deal.price}</div>
                    <div className="text-sm text-green-600">{deal.savings}</div>
                    <Button className="mt-2">Book Now</Button>
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

