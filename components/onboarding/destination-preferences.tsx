"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

interface DestinationPreferencesProps {
  value: string[]
  onChange: (value: string[]) => void
}

const popularDestinations = [
  "Paris, France",
  "Tokyo, Japan",
  "New York, USA",
  "Rome, Italy",
  "Barcelona, Spain",
  "London, UK",
]

export function DestinationPreferences({ value, onChange }: DestinationPreferencesProps) {
  const [search, setSearch] = useState("")

  const addDestination = (destination: string) => {
    if (!value.includes(destination)) {
      onChange([...value, destination])
    }
    setSearch("")
  }

  const removeDestination = (destination: string) => {
    onChange(value.filter((d) => d !== destination))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Search Destinations</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Type a destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Selected Destinations</Label>
        <div className="flex flex-wrap gap-2">
          {value.map((destination) => (
            <Badge key={destination} variant="secondary">
              {destination}
              <button onClick={() => removeDestination(destination)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {value.length === 0 && <span className="text-sm text-muted-foreground">No destinations selected</span>}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Popular Destinations</Label>
        <div className="flex flex-wrap gap-2">
          {popularDestinations.map((destination) => (
            <Button
              key={destination}
              variant="outline"
              size="sm"
              onClick={() => addDestination(destination)}
              disabled={value.includes(destination)}
            >
              {destination}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

