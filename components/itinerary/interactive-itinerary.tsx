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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useProfile } from "@/contexts/profile-context"
import { createEvents, type DateArray } from "ics"

interface Activity {
  id: string
  icon: keyof typeof icons
  time: string
  title: string
  description: string
  priceRange?: string
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
}

export function InteractiveItinerary({
  tripId,
  initialItinerary,
  onItineraryChange,
  readOnly,
}: InteractiveItineraryProps) {
  const { profile } = useProfile()
  const [schedule, setSchedule] = useState<DaySchedule[]>(
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

  useEffect(() => {
    if (initialItinerary) {
      setSchedule(initialItinerary)
    }
  }, [initialItinerary])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const sourceDay = Number.parseInt(result.source.droppableId)
    const destinationDay = Number.parseInt(result.destination.droppableId)
    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    const newSchedule = [...schedule]
    const sourceDaySchedule = newSchedule.find((day) => day.day === sourceDay)
    const destDaySchedule = newSchedule.find((day) => day.day === destinationDay)

    if (!sourceDaySchedule || !destDaySchedule) return

    const [movedActivity] = sourceDaySchedule.activities.splice(sourceIndex, 1)
    destDaySchedule.activities.splice(destinationIndex, 0, movedActivity)

    setSchedule(newSchedule)
    onItineraryChange?.(newSchedule)
  }

  const moveActivity = (dayIndex: number, activityIndex: number, direction: "up" | "down") => {
    const newSchedule = [...schedule]
    const day = newSchedule[dayIndex]
    const activities = [...day.activities]

    if (direction === "up" && activityIndex > 0) {
      // Move activity up within the same day
      ;[activities[activityIndex], activities[activityIndex - 1]] = [
        activities[activityIndex - 1],
        activities[activityIndex],
      ]
    } else if (direction === "down" && activityIndex < activities.length - 1) {
      // Move activity down within the same day
      ;[activities[activityIndex], activities[activityIndex + 1]] = [
        activities[activityIndex + 1],
        activities[activityIndex],
      ]
    } else if (direction === "up" && dayIndex > 0) {
      // Move activity to previous day
      const activity = activities[activityIndex]
      activities.splice(activityIndex, 1)
      newSchedule[dayIndex - 1].activities.push(activity)
    } else if (direction === "down" && dayIndex < newSchedule.length - 1) {
      // Move activity to next day
      const activity = activities[activityIndex]
      activities.splice(activityIndex, 1)
      newSchedule[dayIndex + 1].activities.unshift(activity)
    }

    day.activities = activities
    setSchedule(newSchedule)
    onItineraryChange?.(newSchedule)
  }

  const handleAddActivity = (dayId: number) => {
    const newActivity: Activity = {
      id: `new-${Date.now()}`,
      icon: "attraction",
      time: "12:00",
      title: "New Activity",
      description: "Description",
    }

    const newSchedule = schedule.map((day) => {
      if (day.day === dayId) {
        return {
          ...day,
          activities: [...day.activities, newActivity],
        }
      }
      return day
    })

    setSchedule(newSchedule)
    onItineraryChange?.(newSchedule)
  }

  const handleEditActivity = (dayId: number, activity: Activity) => {
    const newSchedule = schedule.map((day) => ({
      ...day,
      activities: day.activities.map((a) => (a.id === activity.id ? activity : a)),
    }))

    setSchedule(newSchedule)
    onItineraryChange?.(newSchedule)
  }

  const handleDeleteActivity = (activityId: string) => {
    const newSchedule = schedule.map((day) => ({
      ...day,
      activities: day.activities.filter((a) => a.id !== activityId),
    }))

    setSchedule(newSchedule)
    onItineraryChange?.(newSchedule)
  }

  const downloadCalendar = () => {
    const events = schedule.flatMap((day) => {
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
          <CalendarIcon className="h-4 w-4" />
          Add to Calendar
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {schedule.map((day, dayIndex) => (
          <Card key={day.day}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Day {day.day}</h3>
                {!readOnly && (
                  <Button variant="outline" size="sm" onClick={() => handleAddActivity(day.day)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                )}
              </div>
              <Droppable droppableId={day.day.toString()}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {day.activities.map((activity, activityIndex) => {
                      const Icon = icons[activity.icon]
                      return (
                        <Draggable key={activity.id} draggableId={activity.id} index={activityIndex}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} className="group relative">
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-4">
                                    {!readOnly && (
                                      <div
                                        {...provided.dragHandleProps}
                                        className="mt-1.5 text-muted-foreground cursor-grab"
                                      >
                                        <GripVertical className="h-4 w-4" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 text-primary" />
                                        <span className="text-sm text-muted-foreground">{activity.time}</span>
                                        {activity.priceRange && (
                                          <Badge variant="secondary">
                                            {activity.priceRange?.replace(/€/g, getCurrencySymbol(profile.currency))}
                                          </Badge>
                                        )}
                                      </div>
                                      <h4 className="font-medium mt-1">{activity.title}</h4>
                                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                                    </div>
                                    {!readOnly && (
                                      <div className="flex gap-2">
                                        <div className="flex flex-col gap-1">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => moveActivity(dayIndex, activityIndex, "up")}
                                            disabled={activityIndex === 0 && dayIndex === 0}
                                          >
                                            <MoveUp className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => moveActivity(dayIndex, activityIndex, "down")}
                                            disabled={
                                              activityIndex === day.activities.length - 1 &&
                                              dayIndex === schedule.length - 1
                                            }
                                          >
                                            <MoveDown className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="opacity-0 group-hover:opacity-100"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Edit Activity</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                              <div className="space-y-2">
                                                <Input
                                                  placeholder="Time"
                                                  value={activity.time}
                                                  onChange={(e) =>
                                                    handleEditActivity(day.day, {
                                                      ...activity,
                                                      time: e.target.value,
                                                    })
                                                  }
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Input
                                                  placeholder="Title"
                                                  value={activity.title}
                                                  onChange={(e) =>
                                                    handleEditActivity(day.day, {
                                                      ...activity,
                                                      title: e.target.value,
                                                    })
                                                  }
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Input
                                                  placeholder="Description"
                                                  value={activity.description}
                                                  onChange={(e) =>
                                                    handleEditActivity(day.day, {
                                                      ...activity,
                                                      description: e.target.value,
                                                    })
                                                  }
                                                />
                                              </div>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="opacity-0 group-hover:opacity-100"
                                          onClick={() => handleDeleteActivity(activity.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
        ))}
      </DragDropContext>
    </div>
  )
}

