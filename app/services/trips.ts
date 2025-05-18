import { createBrowserSupabaseClient, createServerSupabaseClient, Database } from "@/lib/supabase"
import { DaySchedule, Trip, TripStatus, BookingStatus, Activity, ActivityIcon } from "@/types/trips"

// Convert database trip to app trip format
const mapDbTripToAppTrip = async (
  dbTrip: Database['public']['tables']['trips']['Row'], 
  supabase: ReturnType<typeof createBrowserSupabaseClient>
): Promise<Trip> => {
  // Get trip bookings
  const { data: bookingsData } = await supabase
    .from('trip_bookings')
    .select('*')
    .eq('trip_id', dbTrip.id)
    .single()

  // Get trip days with activities
  const { data: daysData } = await supabase
    .from('trip_days')
    .select(`
      id,
      day_number,
      trip_activities (*)
    `)
    .eq('trip_id', dbTrip.id)
    .order('day_number')

  // Format itinerary
  const itinerary: DaySchedule[] = daysData?.map(day => ({
    day: day.day_number,
    activities: (day.trip_activities || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map(activity => ({
        id: activity.id,
        icon: activity.icon as ActivityIcon,
        time: activity.time,
        title: activity.title,
        description: activity.description || '',
        priceRange: activity.price_range || undefined,
      }))
  })) || []

  // Map trip
  return {
    id: dbTrip.id,
    destination: dbTrip.destination,
    image: dbTrip.image || '/placeholder.svg?height=200&width=300',
    dates: dbTrip.dates || 'Not set',
    status: (dbTrip.status as TripStatus) || 'draft',
    activities: itinerary.reduce((count, day) => count + day.activities.length, 0),
    budget: dbTrip.budget || undefined,
    bookings: {
      flight: mapBookingStatus(bookingsData?.flight_status),
      hotel: mapBookingStatus(bookingsData?.hotel_status),
    },
    flight: bookingsData?.flight_details || undefined,
    itinerary
  }
}

// Helper to map booking status
const mapBookingStatus = (status?: Database['public']['enums']['booking_status'] | null): string => {
  if (!status) return 'Not Booked'

  switch (status) {
    case 'booked': return 'Booked'
    case 'completed': return 'Completed'
    case 'cancelled': return 'Cancelled'
    case 'pending': return 'Pending'
    default: return 'Not Booked'
  }
}

// Create an array of days and activities
const createDaysAndActivities = async (
  tripId: string,
  itinerary: DaySchedule[],
  supabase: ReturnType<typeof createBrowserSupabaseClient>
) => {
  // Create days first
  for (const daySchedule of itinerary) {
    const { data: dayData, error: dayError } = await supabase
      .from('trip_days')
      .insert({
        trip_id: tripId,
        day_number: daySchedule.day
      })
      .select()
      .single()

    if (dayError) {
      console.error('Error creating day:', dayError)
      continue
    }

    // Then create activities for this day
    if (daySchedule.activities.length > 0) {
      const activitiesForInsert = daySchedule.activities.map((activity: Activity, index: number) => ({
        trip_day_id: dayData.id,
        time: activity.time,
        title: activity.title,
        description: activity.description,
        icon: activity.icon,
        price_range: activity.priceRange,
        order_index: index,
        details: null // Add details if available
      }))

      const { error: activitiesError } = await supabase
        .from('trip_activities')
        .insert(activitiesForInsert)

      if (activitiesError) {
        console.error('Error creating activities:', activitiesError)
      }
    }
  }
}

// Get all trips for the current user
export async function getUserTrips(): Promise<{ 
  upcoming: Trip[], 
  past: Trip[], 
  drafts: Trip[] 
}> {
  const supabase = createBrowserSupabaseClient()
  
  // Get the current session to identify the user
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return { upcoming: [], past: [], drafts: [] }
  }

  // Get all user trips
  const { data: tripData, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    
  if (error || !tripData) {
    console.error('Error fetching trips:', error)
    return { upcoming: [], past: [], drafts: [] }
  }

  // Process trips
  const trips: Trip[] = []
  for (const dbTrip of tripData) {
    const trip = await mapDbTripToAppTrip(dbTrip, supabase)
    trips.push(trip)
  }

  // Sort trips by status
  return {
    upcoming: trips.filter(trip => ['confirmed', 'planning'].includes(trip.status)),
    past: trips.filter(trip => trip.status === 'completed'),
    drafts: trips.filter(trip => trip.status === 'draft')
  }
}

// Get a single trip by ID
export async function getTripById(tripId: string): Promise<Trip | null> {
  const supabase = createBrowserSupabaseClient()
  
  // Get trip
  const { data: dbTrip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()
    
  if (error || !dbTrip) {
    console.error('Error fetching trip:', error)
    return null
  }

  return mapDbTripToAppTrip(dbTrip, supabase)
}

// Create a new trip
export async function createTrip(tripData: Omit<Trip, "id">): Promise<{ trip: Trip | null, error: any }> {
  const supabase = createBrowserSupabaseClient()
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return { trip: null, error: "Not authenticated" }
  }

  // Extract data for the trips table
  const { destination, image, dates, status, budget, bookings, flight, itinerary } = tripData
  
  // Insert the trip
  const { data: newTrip, error: tripError } = await supabase
    .from('trips')
    .insert({
      user_id: session.user.id,
      destination,
      image: image || null,
      dates,
      status: status.toLowerCase() as Database['public']['enums']['trip_status'],
      budget
    })
    .select()
    .single()
    
  if (tripError || !newTrip) {
    console.error('Error creating trip:', tripError)
    return { trip: null, error: tripError }
  }

  // Create bookings
  const { error: bookingsError } = await supabase
    .from('trip_bookings')
    .insert({
      trip_id: newTrip.id,
      flight_status: reverseMapBookingStatus(bookings.flight),
      hotel_status: reverseMapBookingStatus(bookings.hotel),
      flight_details: flight || null
    })

  if (bookingsError) {
    console.error('Error creating bookings:', bookingsError)
    // We continue despite this error
  }

  // Create days and activities
  if (itinerary && itinerary.length > 0) {
    await createDaysAndActivities(newTrip.id, itinerary, supabase)
  }

  // Return the full trip
  const trip = await mapDbTripToAppTrip(newTrip, supabase)
  return { trip, error: null }
}

// Helper to map booking status back to enum
const reverseMapBookingStatus = (status: string): Database['public']['enums']['booking_status'] => {
  switch (status.toLowerCase()) {
    case 'booked': return 'booked'
    case 'completed': return 'completed'
    case 'cancelled': return 'cancelled'
    case 'pending': return 'pending'
    default: return 'not_booked'
  }
}

// Update a trip
export async function updateTrip(tripId: string, tripData: Trip): Promise<{ trip: Trip | null, error: any }> {
  const supabase = createBrowserSupabaseClient()
  
  // Extract data for the trips table
  const { destination, image, dates, status, budget, bookings, flight, itinerary } = tripData
  
  // Update the trip
  const { data: updatedTrip, error: tripError } = await supabase
    .from('trips')
    .update({
      destination,
      image: image || null,
      dates,
      status: status.toLowerCase() as Database['public']['enums']['trip_status'],
      budget
    })
    .eq('id', tripId)
    .select()
    .single()
    
  if (tripError || !updatedTrip) {
    console.error('Error updating trip:', tripError)
    return { trip: null, error: tripError }
  }

  // Update bookings
  const { error: bookingsError } = await supabase
    .from('trip_bookings')
    .update({
      flight_status: reverseMapBookingStatus(bookings.flight),
      hotel_status: reverseMapBookingStatus(bookings.hotel),
      flight_details: flight || null
    })
    .eq('trip_id', tripId)

  if (bookingsError) {
    console.error('Error updating bookings:', bookingsError)
  }

  // Update itinerary (delete and recreate days and activities)
  if (itinerary && itinerary.length > 0) {
    // First delete existing days (cascades to activities)
    const { error: deleteDaysError } = await supabase
      .from('trip_days')
      .delete()
      .eq('trip_id', tripId)

    if (deleteDaysError) {
      console.error('Error deleting days:', deleteDaysError)
    }

    // Then create new days and activities
    await createDaysAndActivities(tripId, itinerary, supabase)
  }

  // Return the full trip
  const trip = await mapDbTripToAppTrip(updatedTrip, supabase)
  return { trip, error: null }
}

// Delete a trip
export async function deleteTrip(tripId: string): Promise<{ error: any }> {
  const supabase = createBrowserSupabaseClient()
  
  // Delete the trip (will cascade to days, activities, and bookings)
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
    
  if (error) {
    console.error('Error deleting trip:', error)
    return { error }
  }

  return { error: null }
}

// Update just the itinerary of a trip
export async function updateTripItinerary(tripId: string, itinerary: DaySchedule[]): Promise<{ error: any }> {
  const supabase = createBrowserSupabaseClient()
  
  // Delete existing days and activities
  const { error: deleteDaysError } = await supabase
    .from('trip_days')
    .delete()
    .eq('trip_id', tripId)

  if (deleteDaysError) {
    console.error('Error deleting days:', deleteDaysError)
    return { error: deleteDaysError }
  }

  // Create new days and activities
  await createDaysAndActivities(tripId, itinerary, supabase)

  return { error: null }
} 