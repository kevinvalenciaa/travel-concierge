"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

interface TravelDatesProps {
  value: { type: "exact" | "flexible"; dates: Date | null }
  onChange: (value: { type: "exact" | "flexible"; dates: Date | null }) => void
}

export function TravelDates({ value, onChange }: TravelDatesProps) {
  const [dateType, setDateType] = useState<"exact" | "flexible">(value?.type || "exact")

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>When do you want to travel?</Label>
        <RadioGroup
          value={dateType}
          onValueChange={(value: "exact" | "flexible") => {
            setDateType(value)
            onChange({ type: value, dates: null })
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="exact" id="exact" />
            <Label htmlFor="exact">I have exact dates</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="flexible" id="flexible" />
            <Label htmlFor="flexible">I'm flexible with dates</Label>
          </div>
        </RadioGroup>
      </div>
      {dateType === "exact" ? (
        <Calendar
          mode="single"
          selected={value?.dates || undefined}
          onSelect={(date) => onChange({ type: "exact", dates: date })}
          className={cn("rounded-md border")}
        />
      ) : (
        <div className="space-y-4">
          <Label>Best time to travel</Label>
          <div className="grid grid-cols-2 gap-4">
            {["Spring", "Summer", "Fall", "Winter"].map((season) => (
              <Button
                key={season}
                variant="outline"
                className={cn(value?.dates === season && "bg-primary text-primary-foreground")}
                onClick={() => onChange({ type: "flexible", dates: season as any })}
              >
                {season}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

