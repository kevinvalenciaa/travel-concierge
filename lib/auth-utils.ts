import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createServerSupabaseClient } from './supabase'
import { type CookieOptions } from '@supabase/ssr'

// Check if the user is authenticated server-side
export async function getServerSession() {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error.message)
      return null
    }
    
    return data.session
  } catch (error) {
    console.error('Unexpected error getting session:', error)
    return null
  }
}

// Redirect if not authenticated (for protected routes)
export async function requireAuth() {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/sign-in')
  }
  
  return session
}

// Get the current user's profile from the database
export async function getUserProfile(userId: string) {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user profile:', error.message)
    return null
  }
  
  return data
}

// For use in server components
export async function createSupabaseServerComponent() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({
            name,
            value,
            ...options
          })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({
            name,
            value: '',
            ...options,
            maxAge: 0
          })
        },
      },
    }
  )
} 