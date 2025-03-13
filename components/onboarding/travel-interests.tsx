"use client"
import { Card } from "@/components/ui/card"
import { BeanIcon as Beach, Mountain, Building, Landmark, Utensils, SpadeIcon as Spa } from "lucide-react"

const interests = [
  { id: "beach", icon: Beach, label: "Beach Escape" },
  { id: "adventure", icon: Mountain, label: "Adventure & Hiking" },
  { id: "city", icon: Building, label: "City Explorer" },
  { id: "cultural", icon: Landmark, label: "Cultural & Historical" },
  { id: "food", icon: Utensils, label: "Food & Culinary" },
  { id: "wellness", icon: Spa, label: "Relaxation & Wellness" },
]

interface TravelInterestsProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function TravelInterests({ value, onChange }: TravelInterestsProps) {
  const toggleInterest = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((i) => i !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {interests.map(({ id, icon: Icon, label }) => (
        <Card
          key={id}
          className={`p-4 cursor-pointer transition-colors ${
            value.includes(id) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
          onClick={() => toggleInterest(id)}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <Icon className="h-8 w-8" />
            <span className="text-sm font-medium">{label}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}

