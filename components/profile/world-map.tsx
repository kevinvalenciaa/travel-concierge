"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Map } from "lucide-react"

// This is a simplified list - you would typically have all countries
const visitedCountries = [
  "FR", // France
  "IT", // Italy
  "JP", // Japan
  "ES", // Spain
]

export function WorldMap() {
  const [isOpen, setIsOpen] = useState(false)
  const totalCountries = 195 // Total number of countries in the world
  const visitedCount = visitedCountries.length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Map className="mr-2 h-4 w-4" />
          View Travel Map
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>My Travel Map</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg border">
            <svg
              viewBox="0 0 2000 1001"
              fill="none"
              className="absolute inset-0 h-full w-full"
              style={{
                background: "rgb(241, 245, 249)",
              }}
            >
              <path
                d="M781.68,324.4l-0.87,4.4l-1.97,3.49l-0.57,3.65l0.52,2.26l0.41,2.21l-0.68,2.85l1.14,5.12l0.33,4.19l0.76,2.37 l0.21,3.31l-1.27,1.33l0.21,2.38l-1.86,4.95l0.52,4.75l0.37,2.36l-0.32,1.79l-0.62,2.53l-1.78,2.85l-4.05,3.57l0.21,3.67l-2.41,0.61 l-0.29,0.78l-1.68,1.7l-7.64,0.1l-0.76,0.99l-0.85,0.72l-2.91,0.18l-0.89,-0.42l-0.83,-1.53l-0.91,-1.03l-0.82,-2.67l-0.57,-1.28 l-2.85,-1.32l-1.03,-2.15l-0.26,-0.99l-1.79,-1.74l-0.93,-1.32l-0.93,-0.71l-2.55,-0.97l-0.89,-1.06l-0.37,-1.69l-0.55,-0.74l-1.68,-1.23 l-0.93,-1.35l-0.21,-1.4l-1.31,-2.71l0.07,-1.84l0.49,-1.77l-0.31,-1.64l-0.57,-1.18l-0.21,-1.61l0.26,-1.72l-0.34,-0.41l-0.07,-1.01 l0.21,-1.52l-0.34,-0.55l-0.07,-1.38l-0.41,-0.74l-0.57,-2.36l0.05,-1.3l0.25,-0.81l-0.08,-1.81l-0.82,-1.98l0.11,-1.98l0.26,-1.4 l-0.08,-1.66l-0.91,-1.9l-0.01,-1.04l0.4,-1.03l-0.08,-1.18l0.18,-1.61l-1.68,-1.94l-0.49,-0.39l-0.08,-0.81l-0.6,-0.76l0.04,-0.99 l0.43,-1.01l0.03,-0.52l0.92,0.43l0.73,-0.83l0.92,0.05l0.67,-0.41l0.92,-0.05l0.8,-0.47l0.87,-0.1l0.85,-0.51l0.52,-0.61l1.01,-0.43 l2.91,0.18l0.67,-0.23l1.52,0.13l0.72,-0.23l0.67,0.28l2.39,0.13l0.93,-0.47l0.62,-0.82l0.62,-0.41l0.98,0.18l0.77,-0.33l0.52,-0.47 l1.42,0.02l0.83,-0.43l1.14,0.28l0.93,-0.28l0.93,0.13l0.77,-0.37l0.77,0.18l0.88,-0.42l0.62,-0.72l0.31,-0.76l0.77,0.15l0.49,-0.32 l0.42,-0.76l1.05,0.1l0.52,-0.37l0.31,-0.66l0.52,-0.42l0.26,-0.71l1.24,0.05l0.44,-0.44l1.55,0.31l0.91,-0.03l0.57,0.31l0.88,-0.13 l0.67,0.26l0.52,-0.23l0.49,-0.56l0.08,-0.71l0.44,-0.51l0.93,0.05l0.57,-0.32l0.88,0.21l0.34,-0.51l0.49,-0.27l0.44,-0.61l0.05,-0.86 l0.8,-0.51l0.91,0.05l0.6,-0.32l0.28,-0.51l0.44,-0.37l0.1,-0.81l0.28,-0.42l0.03,-0.81l0.39,-0.47l0.05,-0.71l0.44,-0.51l0.02,-0.86 l0.85,-0.32l0.28,-0.71l0.44,-0.42l0.39,-0.81l0.21,-0.91l0.44,-0.47l0.93,0.1l0.44,-0.42l0.28,-0.71l0.8,-0.51l0.44,-0.71l0.91,0.05 l0.44,-0.37l0.34,-0.81l0.8,-0.51l0.28,-0.71l0.85,-0.51l0.02,-0.81l0.39,-0.47l0.85,-0.51l0.05,-0.71l0.34,-0.47l0.05,-0.81l0.28,-0.42 l0.15,-0.91l0.34,-0.42l0.15,-0.91l0.28,-0.42l0.15,-0.91l0.23,-0.37l0.21,-0.91l0.28,-0.42l0.15,-0.91l0.28,-0.42l0.1,-0.81l0.34,-0.47 l0.05,-0.71l0.34,-0.47l0.05,-0.71l0.34,-0.47l0.05,-0.71l0.34,-0.47l0.05,-0.71l0.23,-0.37l0.15,-0.91l0.34,-0.42l0.1,-0.81l0.34,-0.47 l0.05,-0.71l0.34,-0.47l0.05,-0.71l0.34,-0.47l0.05,-0.71l0.23,-0.37l0.15,-0.91l0.34,-0.42l0.1,-0.81l0.34,-0.47l0.05,-0.71l0.34,-0.47 l0.05,-0.71l0.34,-0.47l0.05,-0.71l0.23,-0.37l0.15,-0.91l0.34,-0.42l0.1,-0.81l0.34,-0.47l0.05,-0.71l0.34,-0.47l0.05,-0.71l0.34,-0.47 l0.05,-0.71l0.23,-0.37l0.15,-0.91l0.34,-0.42L781.68,324.4z"
                className={`${
                  visitedCountries.includes("FR") ? "fill-primary" : "fill-muted"
                } hover:opacity-90 cursor-pointer transition-colors`}
                data-country="FR"
                data-country-name="France"
              />
              {/* Add more country paths here */}
            </svg>
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
            <div>
              <p className="text-sm font-medium">Countries Visited</p>
              <p className="text-2xl font-bold">{visitedCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Countries</p>
              <p className="text-2xl font-bold">{totalCountries}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Percentage</p>
              <p className="text-2xl font-bold">{((visitedCount / totalCountries) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

