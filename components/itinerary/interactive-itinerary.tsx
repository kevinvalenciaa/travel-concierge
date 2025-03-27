"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Hotel,
  UtensilsCrossed,
  Landmark,
  Sunset,
  Music,
  Wine,
  Plus,
  Edit,
  Trash,
  GripVertical,
  MoveUp,
  MoveDown,
  CalendarIcon,
  Pencil,
  Trash2,
  ChevronRight,
  Download,
  Info,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useProfile } from "@/contexts/profile-context"
import { createEvents, type DateArray } from "ics"
import { ActivityInfo, type ActivityDetail } from "./activity-info"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Activity {
  id: string
  icon: keyof typeof icons
  time: string
  title: string
  description: string
  priceRange?: string
  details?: ActivityDetail
}

interface DaySchedule {
  day: number
  activities: Activity[]
}

const icons = {
  hotel: Hotel,
  food: UtensilsCrossed,
  attraction: Landmark,
  sunset: Sunset,
  entertainment: Music,
  nightlife: Wine,
}

const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case "USD":
      return "$"
    case "EUR":
      return "€"
    case "GBP":
      return "£"
    case "JPY":
      return "¥"
    case "AUD":
      return "A$"
    case "CAD":
      return "C$"
    default:
      return currency
  }
}

interface InteractiveItineraryProps {
  tripId?: number
  initialItinerary?: DaySchedule[]
  onItineraryChange?: (itinerary: DaySchedule[]) => void
  readOnly?: boolean
  renderActivityDetails?: (activity: Activity) => React.ReactNode
}

function getIconForActivity(icon?: keyof typeof icons) {
  const IconComponent = icon && icons[icon] ? icons[icon] : Landmark;
  return <IconComponent className="h-5 w-5 text-primary" />;
}

function ActivityItem({
  activity,
  onEdit,
  onDelete,
  readOnly = false,
  renderActivityDetails
}: {
  activity: Activity
  onEdit?: (activity: Activity) => void
  onDelete?: (id: string) => void
  readOnly?: boolean
  renderActivityDetails?: (activity: Activity) => React.ReactNode
}) {
  const isLastActivity = false // Used for rendering visual connectors

  return (
    <div className="flex items-start group">
      <div className="flex-none flex flex-col items-center mr-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          {getIconForActivity(activity.icon)}
        </div>
        {!isLastActivity && <div className="w-0.5 grow bg-border mt-2"></div>}
      </div>
      <div className="flex-grow min-w-0 pt-1 pb-6">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <div className="flex items-center">
              <p className="text-sm text-muted-foreground">{activity.time}</p>
              {activity.priceRange && (
                <Badge variant="outline" className="ml-2">
                  {activity.priceRange}
                </Badge>
              )}
            </div>
            <h3 className="font-medium">{activity.title}</h3>
            {activity.description && <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {activity.details && (
              <ActivityInfo 
                title={activity.title} 
                description={activity.description}
                details={activity.details}
              />
            )}
            
            {renderActivityDetails && renderActivityDetails(activity)}
            
            {!readOnly && (
              <>
                <Button variant="ghost" size="icon" onClick={() => onEdit && onEdit(activity)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete && onDelete(activity.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function InteractiveItinerary({
  tripId,
  initialItinerary,
  onItineraryChange,
  readOnly = false,
  renderActivityDetails,
}: InteractiveItineraryProps) {
  const { profile } = useProfile()
  const [itinerary, setItinerary] = useState<DaySchedule[]>(
    initialItinerary || [
      {
        day: 1,
        activities: [
          {
            id: "1",
            icon: "hotel",
            time: "14:00",
            title: "Hotel Check-In",
            description: "Luxury Hotel",
          },
          {
            id: "2",
            icon: "attraction",
            time: "16:00",
            title: "City Tour",
            description: "Explore the city highlights",
          },
        ],
      },
    ],
  )
  const [openDays, setOpenDays] = useState<Record<number, boolean>>({})
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  useEffect(() => {
    if (initialItinerary) {
      setItinerary(initialItinerary)
      // Initialize all days as open
      const initialOpenDays: Record<number, boolean> = {}
      initialItinerary.forEach(day => {
        initialOpenDays[day.day] = true
      })
      setOpenDays(initialOpenDays)
    }
  }, [initialItinerary])

  const handleDayToggle = (dayNumber: number, isOpen: boolean) => {
    setOpenDays(prev => ({
      ...prev,
      [dayNumber]: isOpen
    }))
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
  }

  const handleDeleteActivity = (activityId: string) => {
    const newItinerary = itinerary.map(day => ({
      ...day,
      activities: day.activities.filter(a => a.id !== activityId)
    }))
    setItinerary(newItinerary)
    onItineraryChange?.(newItinerary)
  }

  const handleActivitySubmit = (activityData: Activity) => {
    if (editingActivity) {
      // Edit existing activity
      const newItinerary = itinerary.map(day => ({
        ...day,
        activities: day.activities.map(a => 
          a.id === editingActivity.id ? { ...activityData, id: a.id } : a
        )
      }))
      setItinerary(newItinerary)
      onItineraryChange?.(newItinerary)
    } else if (editingDay !== null) {
      // Add new activity
      const newActivity = {
        ...activityData,
        id: `${Date.now()}`
      }
      const newItinerary = itinerary.map(day => {
        if (day.day === editingDay) {
          return {
            ...day,
            activities: [...day.activities, newActivity]
          }
        }
        return day
      })
      setItinerary(newItinerary)
      onItineraryChange?.(newItinerary)
    }
    
    setEditingActivity(null)
    setEditingDay(null)
  }

  const handleDragEnd = (event: any, dayNumber: number) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      return
    }
    
    const activeId = active.id
    const overId = over.id
    
    const dayToUpdate = itinerary.find(d => d.day === dayNumber)
    
    if (!dayToUpdate) return
    
    const activeIndex = dayToUpdate.activities.findIndex(a => a.id === activeId)
    const overIndex = dayToUpdate.activities.findIndex(a => a.id === overId)
    
    if (activeIndex === -1 || overIndex === -1) return
    
    const newItinerary = itinerary.map(day => {
      if (day.day === dayNumber) {
        const updatedActivities = [...day.activities]
        const [movedActivity] = updatedActivities.splice(activeIndex, 1)
        updatedActivities.splice(overIndex, 0, movedActivity)
        
        return {
          ...day,
          activities: updatedActivities
        }
      }
      return day
    })
    
    setItinerary(newItinerary)
    onItineraryChange?.(newItinerary)
  }

  const downloadCalendar = () => {
    const events = itinerary.flatMap((day) => {
      return day.activities.map((activity) => {
        // Parse the time string (assuming format "HH:mm")
        const [hours, minutes] = activity.time.split(":").map(Number)

        // Create a date for this activity
        const date = new Date()
        date.setDate(date.getDate() + (day.day - 1)) // Add days based on the itinerary day
        date.setHours(hours, minutes)

        // Create end time (1 hour after start by default)
        const endDate = new Date(date)
        endDate.setHours(endDate.getHours() + 1)

        // Format dates for ics
        const start: DateArray = [
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
        ]

        const end: DateArray = [
          endDate.getFullYear(),
          endDate.getMonth() + 1,
          endDate.getDate(),
          endDate.getHours(),
          endDate.getMinutes(),
        ]

        return {
          title: activity.title,
          description: activity.description,
          start,
          end,
          location: activity.description,
        }
      })
    })

    createEvents(events, (error, value) => {
      if (error) {
        console.error(error)
        return
      }

      // Create and trigger download
      const blob = new Blob([value], { type: "text/calendar" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "travel-itinerary.ics"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Itinerary</h2>
        <Button variant="outline" size="sm" onClick={downloadCalendar} className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Export Calendar
        </Button>
      </div>

      <div className="space-y-6">
        {itinerary.map((day, dayIndex) => (
          <div key={day.day} className="space-y-4">
            <Collapsible open={openDays[day.day]} onOpenChange={(open) => handleDayToggle(day.day, open)}>
              <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 data-[state=open]:rotate-90 transition-transform">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <h3 className="font-semibold">Day {day.day}</h3>
                {!readOnly && (
                  <Button variant="ghost" size="sm" onClick={() => setEditingDay(day.day)}>
                    <Plus className="h-4 w-4 mr-1" /> Add Activity
                  </Button>
                )}
              </div>
              
              <CollapsibleContent className="mt-4 ml-1 space-y-1">
                {day.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-4">No activities scheduled for this day.</p>
                ) : (
                  <div className="pl-4">
                    {day.activities.map((activity) => (
                      <div key={activity.id}>
                        <ActivityItem 
                          activity={activity} 
                          onEdit={!readOnly ? handleEditActivity : undefined} 
                          onDelete={!readOnly ? handleDeleteActivity : undefined}
                          readOnly={readOnly}
                          renderActivityDetails={renderActivityDetails}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>

      {(editingDay !== null || editingActivity !== null) && (
        <Dialog open={true} onOpenChange={(open) => {
          if (!open) {
            setEditingDay(null)
            setEditingActivity(null)
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingActivity ? "Edit Activity" : "Add Activity"}</DialogTitle>
            </DialogHeader>
            <ActivityForm 
              onSubmit={handleActivitySubmit} 
              initialValues={editingActivity} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Placeholder for ActivityForm component
function ActivityForm({ 
  onSubmit,
  initialValues
}: { 
  onSubmit: (data: Activity) => void
  initialValues?: Activity | null
}) {
  const [activityData, setActivityData] = useState<Partial<Activity>>(
    initialValues || {
      icon: "attraction",
      time: "12:00",
      title: "",
      description: "",
      priceRange: "€€"
    }
  )
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(activityData as Activity)
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Time</label>
        <Input 
          type="time"
          value={activityData.time}
          onChange={(e) => setActivityData({...activityData, time: e.target.value})}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input 
          value={activityData.title}
          onChange={(e) => setActivityData({...activityData, title: e.target.value})}
          placeholder="Activity title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input 
          value={activityData.description}
          onChange={(e) => setActivityData({...activityData, description: e.target.value})}
          placeholder="Brief description"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Icon</label>
        <div className="flex gap-2">
          {Object.entries(icons).map(([key, Icon]) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={activityData.icon === key ? "default" : "outline"}
              onClick={() => setActivityData({...activityData, icon: key as keyof typeof icons})}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Price Range</label>
        <div className="flex gap-2">
          {["€", "€€", "€€€"].map((price) => (
            <Button
              key={price}
              type="button"
              size="sm"
              variant={activityData.priceRange === price ? "default" : "outline"}
              onClick={() => setActivityData({...activityData, priceRange: price})}
            >
              {price}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end pt-2">
        <Button type="submit">
          {initialValues ? "Update Activity" : "Add Activity"}
        </Button>
      </div>
    </form>
  )
}

