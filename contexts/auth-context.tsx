"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User, Session } from '@supabase/supabase-js'
import { useRouter, usePathname } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: any, user: User | null }>
  signOut: () => Promise<void>
  loading: boolean
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createBrowserSupabaseClient())
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Get initial session and user
    const initializeAuth = async () => {
      setLoading(true)

      try {
        // Get session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle sign out event, redirect to sign-in page
        if (event === 'SIGNED_OUT') {
          router.push('/sign-in')
        }
        
        // Handle sign in event
        if (event === 'SIGNED_IN') {
          // Create or update user profile in database
          if (session?.user) {
            const { error } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                email: session.user.email,
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'id'
              })
            
            if (error) {
              console.error('Error updating profile:', error)
            }
            
            // Only redirect to dashboard after successful sign in from auth pages
            if (pathname === '/sign-in' || pathname === '/sign-up') {
              router.push('/dashboard')
            }
          }
        }
      }
    )

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase, pathname])

  // Custom hook to protect routes and handle redirects
  useEffect(() => {
    if (loading) return; // Don't do anything while loading
    
    // ROOT PATH HANDLING - Redirect root path to sign-in
    if (pathname === '/') {
      router.push('/sign-in')
      return;
    }

    // DASHBOARD ACCESS PROTECTION
    // If trying to access dashboard or any protected path but not authenticated
    if (pathname.startsWith('/dashboard') && !user) {
      router.push('/sign-in')
      return;
    }
    
    // PUBLIC PATHS - Don't redirect from these paths
    const publicPaths = ['/sign-in', '/sign-up', '/password-reset']
    const isPublicPath = publicPaths.includes(pathname)
    
    // If on a public path and authenticated, let them stay there
    // We won't force redirect to dashboard even when authenticated
  }, [user, loading, pathname, router])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!error) {
      router.push('/dashboard')
    }

    return { error }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })

    if (!error && data?.user) {
      // Create a profile record
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          name: name,
          created_at: new Date().toISOString(),
        })

      router.push('/dashboard')
    }

    return { error, user: data?.user || null }
  }

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-reset-callback`,
    })
    
    return { error }
  }

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
    resetPassword
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

