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
        }
        Insert: {
          id: string
          created_at?: string
          name?: string
          avatar_url?: string
          email?: string
          preferences?: any
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          avatar_url?: string
          email?: string
          preferences?: any
        }
      }
      // Add other tables as needed
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