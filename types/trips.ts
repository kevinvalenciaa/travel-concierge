export type ActivityIcon = 'hotel' | 'food' | 'attraction' | 'sunset' | 'entertainment' | 'nightlife';
export type TripStatus = 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled';
export type BookingStatus = 'not_booked' | 'pending' | 'booked' | 'completed' | 'cancelled';

export interface Activity {
  id: string;
  icon: ActivityIcon;
  time: string;
  title: string;
  description: string;
  priceRange?: string;
  details?: any; // Additional details like address, website, etc.
}

export interface DaySchedule {
  day: number;
  activities: Activity[];
}

export interface Trip {
  id: string;
  destination: string;
  image: string;
  dates: string;
  status: TripStatus;
  activities: number;
  budget?: number;
  bookings: {
    flight: string;
    hotel: string;
  };
  flight?: {
    departure: string;
    arrival: string;
    from: string;
    to: string;
    duration: string;
  };
  itinerary: DaySchedule[];
} 