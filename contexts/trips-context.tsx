"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { getUserTrips, createTrip as createTripService, updateTrip as updateTripService, deleteTrip as deleteTripService, updateTripItinerary as updateTripItineraryService } from "@/app/services/trips"
import { Trip, DaySchedule } from "@/types/trips"

interface TripsContextType {
  trips: {
    upcoming: Trip[]
    past: Trip[]
    drafts: Trip[]
  }
  loading: boolean
  deleteTrip: (tripId: string) => Promise<void>
  addTrip: (trip: Omit<Trip, "id">) => Promise<Trip | null>
  updateTripItinerary: (tripId: string, itinerary: DaySchedule[]) => Promise<void>
  updateTrip: (tripId: string, updatedTrip: Trip) => Promise<Trip | null>
}

const TripsContext = createContext<TripsContextType | undefined>(undefined)

export function TripsProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<TripsContextType["trips"]>({
    upcoming: [],
    past: [],
    drafts: []
  })
  const [loading, setLoading] = useState(true)

  // Load user trips on mount and when auth state changes
  useEffect(() => {
    const loadTrips = async () => {
      setLoading(true)
      try {
        const userTrips = await getUserTrips()
        setTrips(userTrips)
      } catch (error) {
        console.error("Error loading trips", error)
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
  }, [])

  const deleteTrip = async (tripId: string) => {
    const { error } = await deleteTripService(tripId)
    if (!error) {
      setTrips((prevTrips) => ({
        upcoming: prevTrips.upcoming.filter((trip) => trip.id !== tripId),
        past: prevTrips.past.filter((trip) => trip.id !== tripId),
        drafts: prevTrips.drafts.filter((trip) => trip.id !== tripId),
      }))
    }
  }

  const addTrip = async (trip: Omit<Trip, "id">): Promise<Trip | null> => {
    const { trip: newTrip, error } = await createTripService(trip)
    if (newTrip && !error) {
      setTrips((prevTrips) => {
        // Determine which category to add to
        const category = ['confirmed', 'planning'].includes(newTrip.status) 
          ? 'upcoming' 
          : newTrip.status === 'completed' 
            ? 'past' 
            : 'drafts'
        
        return {
          ...prevTrips,
          [category]: [newTrip, ...prevTrips[category as keyof typeof prevTrips]]
        }
      })
      return newTrip
    }
    return null
  }

  const updateTripItinerary = async (tripId: string, newItinerary: DaySchedule[]) => {
    const { error } = await updateTripItineraryService(tripId, newItinerary)
    
    if (!error) {
      setTrips((prevTrips) => {
        // Update in all categories
        const updatedTrips = { ...prevTrips }
        
        // Helper to update trip in a category
        const updateInCategory = (category: keyof typeof updatedTrips) => {
          updatedTrips[category] = updatedTrips[category].map((trip) => 
            trip.id === tripId 
              ? { 
                  ...trip, 
                  itinerary: newItinerary,
                  activities: newItinerary.reduce((count, day) => count + day.activities.length, 0)
                } 
              : trip
          )
        }
        
        // Update in all categories
        updateInCategory('upcoming')
        updateInCategory('past')
        updateInCategory('drafts')
        
        return updatedTrips
      })
    }
  }

  const updateTrip = async (tripId: string, updatedTrip: Trip): Promise<Trip | null> => {
    const { trip: resultTrip, error } = await updateTripService(tripId, updatedTrip)
    
    if (resultTrip && !error) {
      setTrips((prevTrips) => {
        // Remove from all categories
        const withoutTrip = {
          upcoming: prevTrips.upcoming.filter((trip) => trip.id !== tripId),
          past: prevTrips.past.filter((trip) => trip.id !== tripId),
          drafts: prevTrips.drafts.filter((trip) => trip.id !== tripId),
        }
        
        // Add to the appropriate category
        const category = ['confirmed', 'planning'].includes(resultTrip.status) 
          ? 'upcoming' 
          : resultTrip.status === 'completed' 
            ? 'past' 
            : 'drafts'
        
        return {
          ...withoutTrip,
          [category]: [resultTrip, ...withoutTrip[category as keyof typeof withoutTrip]]
        }
      })
      
      return resultTrip
    }
    
    return null
  }

  return (
    <TripsContext.Provider value={{ trips, loading, deleteTrip, addTrip, updateTripItinerary, updateTrip }}>
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

