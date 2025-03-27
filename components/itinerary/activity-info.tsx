"use client"

import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ActivityDetail {
  address?: string
  openingHours?: string
  cost?: string
  websiteUrl?: string
  phoneNumber?: string
  ratings?: string
  cuisine?: string
  specialFeatures?: string[]
}

interface ActivityInfoProps {
  title: string
  description: string
  details?: ActivityDetail
}

export function ActivityInfo({ title, description, details }: ActivityInfoProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
          <Info className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm">{description}</p>
          
          {details && (
            <div className="mt-2 pt-2 border-t text-sm space-y-1">
              {details.address && (
                <p><span className="font-medium">Address:</span> {details.address}</p>
              )}
              {details.openingHours && (
                <p><span className="font-medium">Hours:</span> {details.openingHours}</p>
              )}
              {details.cost && (
                <p><span className="font-medium">Cost:</span> {details.cost}</p>
              )}
              {details.phoneNumber && (
                <p><span className="font-medium">Phone:</span> {details.phoneNumber}</p>
              )}
              {details.cuisine && (
                <p><span className="font-medium">Cuisine:</span> {details.cuisine}</p>
              )}
              {details.ratings && (
                <p><span className="font-medium">Ratings:</span> {details.ratings}</p>
              )}
              {details.specialFeatures && details.specialFeatures.length > 0 && (
                <div>
                  <span className="font-medium">Special Features:</span>
                  <ul className="list-disc list-inside ml-2">
                    {details.specialFeatures.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              {details.websiteUrl && (
                <p className="pt-1">
                  <a 
                    href={details.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
} 