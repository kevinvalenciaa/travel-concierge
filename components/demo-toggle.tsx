"use client"

import { Button } from "@/components/ui/button"
import { useDemo } from "@/contexts/demo-context"

export function DemoToggle() {
  const { isDemoMode, toggleDemo } = useDemo()

  return (
    <Button variant={isDemoMode ? "default" : "outline"} onClick={toggleDemo} className="w-full">
      {isDemoMode ? "Exit Demo" : "View Demo"}
    </Button>
  )
}

