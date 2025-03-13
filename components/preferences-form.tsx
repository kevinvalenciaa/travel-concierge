"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export function PreferencesForm() {
  const [budget, setBudget] = useState([150])
  const [accommodation, setAccommodation] = useState("hotel")
  const [duration, setDuration] = useState("")
  const [interests, setInterests] = useState<string[]>([])

  const toggleInterest = (interest: string) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Travel Budget (per day)</Label>
        <Slider value={budget} onValueChange={setBudget} max={1000} min={50} step={50} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Budget (${budget})</span>
          <span>Luxury ($1000+)</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Preferred Accommodation</Label>
        <RadioGroup value={accommodation} onValueChange={setAccommodation}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hotel" id="hotel" />
            <Label htmlFor="hotel">Hotels</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hostel" id="hostel" />
            <Label htmlFor="hostel">Hostels</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="apartment" id="apartment" />
            <Label htmlFor="apartment">Apartments</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label>Trip Duration</Label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger>
            <SelectValue placeholder="Select preferred duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekend">Weekend Getaway</SelectItem>
            <SelectItem value="week">1 Week</SelectItem>
            <SelectItem value="twoweeks">2 Weeks</SelectItem>
            <SelectItem value="month">1 Month+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Interests</Label>
        <div className="grid grid-cols-2 gap-4">
          {[
            ["culture", "🏛️ Culture"],
            ["beach", "🏖️ Beach"],
            ["adventure", "🏔️ Adventure"],
            ["food", "🍷 Food & Wine"],
            ["arts", "🎨 Arts"],
            ["nature", "🌿 Nature"],
          ].map(([value, label]) => (
            <Button
              key={value}
              variant={interests.includes(value) ? "default" : "outline"}
              onClick={() => toggleInterest(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      <Button
        className="w-full"
        onClick={() => {
          console.log({
            budget: budget[0],
            accommodation,
            duration,
            interests,
          })
        }}
      >
        Save Preferences
      </Button>
    </div>
  )
}

