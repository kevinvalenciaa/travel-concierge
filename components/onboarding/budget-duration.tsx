"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BudgetDurationProps {
  budget: number
  duration: number
  onChange: (data: { budget?: number; duration?: number }) => void
}

export function BudgetDuration({ budget, duration, onChange }: BudgetDurationProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label>Daily Budget (USD)</Label>
        <Slider
          value={[budget]}
          onValueChange={([value]) => onChange({ budget: value })}
          min={50}
          max={2000}
          step={50}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>$50</span>
          <span>${budget}</span>
          <span>$2000+</span>
        </div>
      </div>
      <div className="space-y-4">
        <Label>Trip Duration</Label>
        <Select value={duration.toString()} onValueChange={(value) => onChange({ duration: Number.parseInt(value) })}>
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 days</SelectItem>
            <SelectItem value="7">1 week</SelectItem>
            <SelectItem value="14">2 weeks</SelectItem>
            <SelectItem value="30">1 month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

