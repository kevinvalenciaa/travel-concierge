import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Types for better TypeScript support
export type Database = {
  public: {
    tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          name: string
          avatar_url: string
          email: string
          preferences: any
          location: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          id: string
          created_at?: string
          name?: string
          avatar_url?: string
          email?: string
          preferences?: any
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          avatar_url?: string
          email?: string
          preferences?: any
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          destination: string
          image: string | null
          start_date: string | null
          end_date: string | null
          dates: string | null
          status: 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled'
          budget: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          destination: string
          image?: string | null
          start_date?: string | null
          end_date?: string | null
          dates?: string | null
          status?: 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled'
          budget?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          destination?: string
          image?: string | null
          start_date?: string | null
          end_date?: string | null
          dates?: string | null
          status?: 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled'
          budget?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      trip_bookings: {
        Row: {
          id: string
          trip_id: string
          flight_status: 'not_booked' | 'pending' | 'booked' | 'completed' | 'cancelled'
          hotel_status: 'not_booked' | 'pending' | 'booked' | 'completed' | 'cancelled'
          flight_details: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          flight_status?: 'not_booked' | 'pending' | 'booked' | 'completed' | 'cancelled'
          hotel_status?: 'not_booked' | 'pending' | 'booked' | 'completed' | 'cancelled'
          flight_details?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          flight_status?: 'not_booked' | 'pending' | 'booked' | 'completed' | 'cancelled'
          hotel_status?: 'not_booked' | 'pending' | 'booked' | 'completed' | 'cancelled'
          flight_details?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      trip_days: {
        Row: {
          id: string
          trip_id: string
          day_number: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          day_number: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          day_number?: number
          created_at?: string
          updated_at?: string
        }
      }
      trip_activities: {
        Row: {
          id: string
          trip_day_id: string
          time: string
          title: string
          description: string | null
          icon: 'hotel' | 'food' | 'attraction' | 'sunset' | 'entertainment' | 'nightlife'
          price_range: string | null
          order_index: number
          details: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_day_id: string
          time: string
          title: string
          description?: string | null
          icon?: 'hotel' | 'food' | 'attraction' | 'sunset' | 'entertainment' | 'nightlife'
          price_range?: string | null
          order_index: number
          details?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_day_id?: string
          time?: string
          title?: string
          description?: string | null
          icon?: 'hotel' | 'food' | 'attraction' | 'sunset' | 'entertainment' | 'nightlife'
          price_range?: string | null
          order_index?: number
          details?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          preferred_currency: string
          preferred_trip_type: string | null
          preferred_budget: number | null
          preferred_activities: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          preferred_currency?: string
          preferred_trip_type?: string | null
          preferred_budget?: number | null
          preferred_activities?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          preferred_currency?: string
          preferred_trip_type?: string | null
          preferred_budget?: number | null
          preferred_activities?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    enums: {
      trip_status: 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled'
      booking_status: 'not_booked' | 'pending' | 'booked' | 'completed' | 'cancelled'
      activity_icon: 'hotel' | 'food' | 'attraction' | 'sunset' | 'entertainment' | 'nightlife'
    }
  }
}

// Create a single supabase client for the browser
export const createBrowserSupabaseClient = () => 
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Create a Supabase client for server-side usage
export const createServerSupabaseClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      }
    }
  ) 