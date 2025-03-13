import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Nav } from "@/components/nav"
import { PlaneTakeoff, MapPin, Coffee, Utensils, Bed } from "lucide-react"

export default function ItineraryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <PlaneTakeoff className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">AI Travel Concierge</span>
            </a>
            <Nav />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">Your Paris Itinerary</h1>
            <p className="text-lg text-muted-foreground">5 days in the City of Light</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Day 1 - Welcome to Paris</CardTitle>
                <CardDescription>Monday, February 5th</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Coffee className="h-4 w-4" />
                  <div>
                    <p className="font-medium">9:00 AM - Café de Flore</p>
                    <p className="text-sm text-muted-foreground">Start your day with a classic Parisian breakfast</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPin className="h-4 w-4" />
                  <div>
                    <p className="font-medium">11:00 AM - Eiffel Tower</p>
                    <p className="text-sm text-muted-foreground">Skip-the-line guided tour</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Utensils className="h-4 w-4" />
                  <div>
                    <p className="font-medium">1:30 PM - Le Chateaubriand</p>
                    <p className="text-sm text-muted-foreground">Modern French cuisine</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPin className="h-4 w-4" />
                  <div>
                    <p className="font-medium">3:00 PM - Seine River Cruise</p>
                    <p className="text-sm text-muted-foreground">1-hour scenic boat tour</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Utensils className="h-4 w-4" />
                  <div>
                    <p className="font-medium">7:00 PM - L'Arpège</p>
                    <p className="text-sm text-muted-foreground">Three Michelin star dining experience</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Bed className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Ritz Paris</p>
                    <p className="text-sm text-muted-foreground">15 Place Vendôme</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trip Summary</CardTitle>
                  <CardDescription>Current bookings and reservations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Accommodation</p>
                        <p className="text-sm text-muted-foreground">Ritz Paris</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Transportation</p>
                        <p className="text-sm text-muted-foreground">Private transfers</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Activities</p>
                        <p className="text-sm text-muted-foreground">4 booked</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Restaurants</p>
                        <p className="text-sm text-muted-foreground">3 reserved</p>
                      </div>
                    </div>
                    <Button className="w-full">Modify Itinerary</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>AI Suggestions</CardTitle>
                  <CardDescription>Based on your preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-3">
                      <p className="font-medium">Evening Jazz Club</p>
                      <p className="text-sm text-muted-foreground">
                        Given your interest in music, you might enjoy Le Petit Journal
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="font-medium">Wine Tasting</p>
                      <p className="text-sm text-muted-foreground">
                        Recommended: Private cellar tour at La Cave du Paul Bert
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      View More Suggestions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

