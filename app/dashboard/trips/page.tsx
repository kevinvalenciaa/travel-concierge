"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, MapPin, Trash2 } from "lucide-react"
import Image from "next/image"
import { TripDetailsDialog } from "@/components/trips/trip-details-dialog"
import { EditTripDialog } from "@/components/trips/edit-trip-dialog"
import { DeleteTripDialog } from "@/components/trips/delete-trip-dialog"
import { useState } from "react"
import { useTrips } from "@/contexts/trips-context"
import { useRouter } from "next/navigation"

export default function TripsPage() {
  const { trips } = useTrips()
  const router = useRouter()

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Trips</h2>
          <p className="text-muted-foreground">Manage your upcoming, past, and draft trips</p>
        </div>
        <Button onClick={() => router.push("/dashboard/new-trip")}>Create New Trip</Button>
      </div>
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          {trips.upcoming.length > 0 ? (
            trips.upcoming.map((trip) => <TripCard key={trip.id} trip={trip} />)
          ) : (
            <Card className="p-8 text-center">
              <p className="text-lg text-muted-foreground">No upcoming trips</p>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
          {trips.past.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TripCard({ trip }: { trip: any }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { deleteTrip } = useTrips()

  const handleDeleteTrip = () => {
    setShowDeleteDialog(false)
    deleteTrip(trip.id)
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr]">
          <div className="relative h-[200px] md:h-full">
            <Image src={trip.image || "/placeholder.svg"} alt={trip.destination} fill className="object-cover" />
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-semibold">{trip.destination}</h3>
                <div className="mt-2 flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-1 h-4 w-4" />
                  {trip.dates}
                </div>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  {trip.destination}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {trip.bookings.flight === "Booked" && trip.bookings.hotel === "Booked" ? "Confirmed" : "Planning"}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{trip.activities} Activities</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">Flight</div>
                <div className="text-sm text-muted-foreground">{trip.bookings.flight}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Hotel</div>
                <div className="text-sm text-muted-foreground">{trip.bookings.hotel}</div>
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <TripDetailsDialog trip={trip} />
              <EditTripDialog trip={trip} />
              <Button
                variant="outline"
                size="icon"
                className="flex-none w-10 h-10"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              <DeleteTripDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDeleteTrip}
                tripName={trip.destination}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

