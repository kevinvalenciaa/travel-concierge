"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

interface Activity {
  id: string
  icon: "hotel" | "food" | "attraction" | "sunset" | "entertainment" | "nightlife"
  time: string
  title: string
  description: string
  priceRange?: string
}

interface DaySchedule {
  day: number
  activities: Activity[]
}

interface Trip {
  id: number
  destination: string
  image: string
  dates: string
  status: string
  activities: number
  budget?: number
  bookings: {
    flight: string
    hotel: string
  }
  flight?: {
    departure: string
    arrival: string
    from: string
    to: string
    duration: string
  }
  itinerary: DaySchedule[]
}

interface TripsContextType {
  trips: {
    upcoming: Trip[]
    past: Trip[]
    drafts: Trip[]
  }
  deleteTrip: (tripId: number) => void
  addTrip: (trip: Omit<Trip, "id">) => void
  updateTripItinerary: (tripId: number, itinerary: DaySchedule[]) => void
  updateTrip: (tripId: number, updatedTrip: Trip) => void
}

const TripsContext = createContext<TripsContextType | undefined>(undefined)

export function TripsProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<TripsContextType["trips"]>({
    upcoming: [
      {
        id: 1,
        destination: "Paris, France",
        image: "/placeholder.svg?height=200&width=300",
        dates: "Feb 15 - Feb 22, 2024",
        status: "Confirmed",
        activities: 8,
        budget: 2500,
        bookings: {
          flight: "Booked",
          hotel: "Booked",
        },
        flight: {
          departure: "2024-02-15T10:00",
          arrival: "2024-02-15T12:00",
          from: "JFK",
          to: "CDG",
          duration: "7h",
        },
        itinerary: [
          {
            day: 1,
            activities: [
              {
                id: "1-1",
                icon: "hotel",
                time: "14:00",
                title: "Check-in at The Ritz Paris",
                description: "Luxury accommodation in the heart of Paris",
                priceRange: "€€€€",
              },
              {
                id: "1-2",
                icon: "attraction",
                time: "16:00",
                title: "Eiffel Tower Visit",
                description: "Skip-the-line guided tour with summit access",
                priceRange: "€€",
              },
              {
                id: "1-3",
                icon: "food",
                time: "20:00",
                title: "Dinner at L'Arpège",
                description: "Three Michelin-starred dining experience",
                priceRange: "€€€€",
              },
            ],
          },
          {
            day: 2,
            activities: [
              {
                id: "2-1",
                icon: "attraction",
                time: "09:00",
                title: "Louvre Museum",
                description: "Private guided tour of the world's largest art museum",
                priceRange: "€€",
              },
              {
                id: "2-2",
                icon: "food",
                time: "13:00",
                title: "Le Marais Food Tour",
                description: "Culinary walking tour through historic Le Marais",
                priceRange: "€€",
              },
              {
                id: "2-3",
                icon: "sunset",
                time: "19:00",
                title: "Seine River Cruise",
                description: "Sunset dinner cruise along the Seine",
                priceRange: "€€€",
              },
            ],
          },
        ],
      },
      {
        id: 2,
        destination: "Tokyo, Japan",
        image: "/placeholder.svg?height=200&width=300",
        dates: "Mar 10 - Mar 24, 2024",
        status: "Planning",
        activities: 4,
        bookings: {
          flight: "Not Booked",
          hotel: "Not Booked",
        },
        itinerary: [
          {
            day: 1,
            activities: [
              {
                id: "1-1",
                icon: "hotel",
                time: "15:00",
                title: "Check-in at Park Hyatt Tokyo",
                description: "Luxury hotel in Shinjuku",
                priceRange: "€€€€",
              },
              {
                id: "1-2",
                icon: "food",
                time: "19:00",
                title: "Sushi Experience",
                description: "Traditional Omakase dinner",
                priceRange: "€€€",
              },
            ],
          },
        ],
      },
    ],
    past: [
      {
        id: 3,
        destination: "Rome, Italy",
        image: "/placeholder.svg?height=200&width=300",
        dates: "Oct 5 - Oct 12, 2023",
        status: "Completed",
        activities: 10,
        bookings: {
          flight: "Completed",
          hotel: "Completed",
        },
        itinerary: [],
      },
    ],
    drafts: [
      {
        id: 4,
        destination: "Barcelona, Spain",
        image: "/placeholder.svg?height=200&width=300",
        dates: "Not set",
        status: "Draft",
        activities: 0,
        bookings: {
          flight: "Not Booked",
          hotel: "Not Booked",
        },
        itinerary: [],
      },
    ],
  })

  const deleteTrip = (tripId: number) => {
    setTrips((prevTrips) => ({
      upcoming: prevTrips.upcoming.filter((trip) => trip.id !== tripId),
      past: prevTrips.past.filter((trip) => trip.id !== tripId),
      drafts: prevTrips.drafts.filter((trip) => trip.id !== tripId),
    }))
  }

  const addTrip = (trip: Omit<Trip, "id">) => {
    setTrips((prevTrips) => ({
      ...prevTrips,
      upcoming: [
        ...prevTrips.upcoming,
        {
          ...trip,
          id: Math.max(...prevTrips.upcoming.map((t) => t.id), 0) + 1,
        },
      ],
    }))
  }

  const updateTripItinerary = (tripId: number, newItinerary: DaySchedule[]) => {
    setTrips((prevTrips) => ({
      upcoming: prevTrips.upcoming.map((trip) => (trip.id === tripId ? { ...trip, itinerary: newItinerary } : trip)),
      past: prevTrips.past.map((trip) => (trip.id === tripId ? { ...trip, itinerary: newItinerary } : trip)),
      drafts: prevTrips.drafts.map((trip) => (trip.id === tripId ? { ...trip, itinerary: newItinerary } : trip)),
    }))
  }

  const updateTrip = (tripId: number, updatedTrip: Trip) => {
    setTrips((prevTrips) => ({
      upcoming: prevTrips.upcoming.map((trip) => (trip.id === tripId ? updatedTrip : trip)),
      past: prevTrips.past.map((trip) => (trip.id === tripId ? updatedTrip : trip)),
      drafts: prevTrips.drafts.map((trip) => (trip.id === tripId ? updatedTrip : trip)),
    }))
  }

  return (
    <TripsContext.Provider value={{ trips, deleteTrip, addTrip, updateTripItinerary, updateTrip }}>
      {children}
    </TripsContext.Provider>
  )
}

export function useTrips() {
  const context = useContext(TripsContext)
  if (context === undefined) {
    throw new Error("useTrips must be used within a TripsProvider")
  }
  return context
}

