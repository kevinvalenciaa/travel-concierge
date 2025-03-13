"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

interface DemoContextType {
  isDemoMode: boolean
  toggleDemo: () => void
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false)

  const toggleDemo = () => setIsDemoMode((prev) => !prev)

  return <DemoContext.Provider value={{ isDemoMode, toggleDemo }}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (context === undefined) {
    throw new Error("useDemo must be used within a DemoProvider")
  }
  return context
}

