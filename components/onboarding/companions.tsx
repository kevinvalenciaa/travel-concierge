"use client"

import { Card } from "@/components/ui/card"
import { User, Users, Heart, Baby } from "lucide-react"

interface CompanionsProps {
  value: string
  onChange: (value: string) => void
}

const companionTypes = [
  { id: "solo", icon: User, label: "Solo" },
  { id: "couple", icon: Heart, label: "Couple" },
  { id: "friends", icon: Users, label: "Friends" },
  { id: "family", icon: Baby, label: "Family" },
]

export function Companions({ value, onChange }: CompanionsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {companionTypes.map(({ id, icon: Icon, label }) => (
        <Card
          key={id}
          className={`p-4 cursor-pointer transition-colors ${
            value === id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
          onClick={() => onChange(id)}
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

