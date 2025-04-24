"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, Info, MapPin, Phone, Star, Clock, DollarSign } from "lucide-react"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ActivityDetail {
  name?: string;
  address?: string;
  openingHours?: string | string[];
  cost?: string;
  websiteUrl?: string;
  phoneNumber?: string;
  ratings?: string;
  cuisine?: string;
  specialFeatures?: string[];
  photoReference?: string;
  mapUrl?: string;
  reviewHighlights?: string[];
  vicinity?: string;
  placeType?: string;
}

interface ActivityInfoProps {
  title: string;
  description: string;
  details?: ActivityDetail;
}

export function ActivityInfo({ title, description, details }: ActivityInfoProps) {
  if (!details) {
    return null;
  }

  // Format opening hours for display
  const displayHours = Array.isArray(details.openingHours) 
    ? details.openingHours 
    : details.openingHours ? [details.openingHours] : [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-primary/10">
          <Info className="h-3.5 w-3.5 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="start">
        <div className="space-y-3">
          <h4 className="font-semibold text-lg text-primary">{title}</h4>
          <p className="text-sm">{description}</p>
          
          <div className="mt-3 pt-3 border-t text-sm space-y-2.5">
            {details.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <p className="text-sm">{details.address}</p>
              </div>
            )}
            
            {displayHours.length > 0 && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">Hours:</p>
                  <ul className="text-sm space-y-0.5 list-none">
                    {displayHours.map((hours, index) => (
                      <li key={index} className="text-muted-foreground">{hours}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {details.phoneNumber && details.phoneNumber !== 'Not available' && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <p className="text-sm">{details.phoneNumber}</p>
              </div>
            )}
            
            {details.ratings && details.ratings !== 'Not rated' && (
              <div className="flex items-start gap-2">
                <Star className="h-4 w-4 mt-0.5 text-amber-500 flex-shrink-0" />
                <p className="text-sm">{details.ratings}</p>
              </div>
            )}
            
            {details.cost && (
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <p className="text-sm">{details.cost}</p>
              </div>
            )}
            
            {details.cuisine && (
              <div className="mt-2">
                <p className="text-sm"><span className="font-medium">Cuisine:</span> {details.cuisine}</p>
              </div>
            )}
            
            {details.specialFeatures && details.specialFeatures.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Special Features:</p>
                <ul className="list-disc list-inside text-sm space-y-0.5">
                  {details.specialFeatures.map((feature, index) => (
                    <li key={index} className="text-muted-foreground">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {details.reviewHighlights && details.reviewHighlights.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Reviews:</p>
                <ul className="text-sm space-y-1">
                  {details.reviewHighlights.map((review, index) => (
                    <li key={index} className="text-muted-foreground italic">"{review.substring(0, 100)}..."</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="pt-2 flex flex-wrap gap-2">
              {details.websiteUrl && details.websiteUrl !== 'Not available' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={() => window.open(details.websiteUrl, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Website
                </Button>
              )}
              
              {details.mapUrl && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={() => window.open(details.mapUrl, '_blank', 'noopener,noreferrer')}
                >
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  Map
                </Button>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 