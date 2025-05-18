"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile, updateUserProfile, Profile } from "@/app/services/profiles"

interface ProfileContextType {
  profile: Profile
  loading: boolean
  error: any
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const defaultProfile: Profile = {
  id: "",
  name: "Guest User",
  email: "",
  currency: "USD"
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  // Load profile when user changes
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setLoading(true)
        setError(null)
        try {
          const { profile: userProfile, error: profileError } = await getUserProfile()
          if (userProfile) {
            setProfile(userProfile)
          }
          if (profileError) {
            setError(profileError)
          }
        } catch (err) {
          console.error("Error loading profile", err)
          setError(err)
        } finally {
          setLoading(false)
        }
      } else {
        // Reset to default profile when logged out
        setProfile(defaultProfile)
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { profile: updatedProfile, error: updateError } = await updateUserProfile(updates)
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      if (updateError) {
        setError(updateError)
      }
    } catch (err) {
      console.error("Error updating profile", err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, error, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}

