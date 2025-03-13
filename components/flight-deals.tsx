"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDemo } from "@/contexts/demo-context"
import { Loader2, PlaneTakeoff } from "lucide-react"

interface FlightDeal {
  from: string
  to: string
  price: number
  airline: string
  departure: string
  arrival: string
}

const DEMO_FLIGHTS: FlightDeal[] = [
  {
    from: "New York (JFK)",
    to: "Paris (CDG)",
    price: 449,
    airline: "Air France",
    departure: "10:30 PM",
    arrival: "11:45 AM",
  },
  {
    from: "New York (JFK)",
    to: "London (LHR)",
    price: 399,
    airline: "British Airways",
    departure: "9:15 PM",
    arrival: "9:30 AM",
  },
  {
    from: "New York (JFK)",
    to: "Rome (FCO)",
    price: 529,
    airline: "ITA Airways",
    departure: "4:45 PM",
    arrival: "7:00 AM",
  },
]

export function FlightDeals() {
  const { isDemoMode } = useDemo()
  const [isLoading, setIsLoading] = useState(false)
  const [deals, setDeals] = useState<FlightDeal[]>([])

  const loadDeals = async () => {
    if (!isDemoMode) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setDeals(DEMO_FLIGHTS)
    setIsLoading(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Best Flight Deals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" onClick={loadDeals} disabled={isLoading || !isDemoMode}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding best deals...
            </>
          ) : (
            "Find Deals"
          )}
        </Button>
        {deals.map((deal, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <PlaneTakeoff className="h-4 w-4" />
                    <span className="font-medium">
                      {deal.from} → {deal.to}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {deal.airline} • {deal.departure} - {deal.arrival}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">${deal.price}</div>
                  <div className="text-sm text-muted-foreground">Round trip</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isDemoMode && (
          <p className="text-sm text-muted-foreground text-center">Enable demo mode to try this feature</p>
        )}
      </CardContent>
    </Card>
  )
}

