"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

interface UserProfile {
  name: string
  email: string
  avatar?: string
  location?: string
  phone?: string
  currency: string
}

interface ProfileContextType {
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    name: "John Doe",
    email: "john@example.com",
    avatar: "/placeholder.svg",
    currency: "USD",
  })

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  return <ProfileContext.Provider value={{ profile, updateProfile }}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}

