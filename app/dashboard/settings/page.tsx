"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { BeanIcon as Beach, Mountain, Building, Landmark, Utensils, SpadeIcon as Spa } from "lucide-react"
import { WorldMap } from "@/components/profile/world-map"
import { useProfile } from "@/contexts/profile-context"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadAvatarButton } from "@/components/upload-avatar-button"
import { useTheme } from "next-themes"

const currencies = [
  { label: "USD - US Dollar", value: "USD" },
  { label: "EUR - Euro", value: "EUR" },
  { label: "GBP - British Pound", value: "GBP" },
  { label: "JPY - Japanese Yen", value: "JPY" },
  { label: "AUD - Australian Dollar", value: "AUD" },
  { label: "CAD - Canadian Dollar", value: "CAD" },
] as const

export default function SettingsPage() {
  const [interests, setInterests] = useState<string[]>([])
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    dealAlerts: true,
    tripReminders: true,
    autoBooking: false,
    flexibleDates: true,
  })

  const { profile, updateProfile } = useProfile()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const { theme, setTheme } = useTheme()
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone || "",
    location: profile.location || "",
    currency: profile.currency,
  })

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (!isEditing) setIsEditing(true)
  }

  const handleSave = () => {
    updateProfile(formData)
    setIsEditing(false)
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    })
  }

  const toggleInterest = (interest: string) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const interests_data = [
    { id: "beach", icon: Beach, label: "Beach Escape" },
    { id: "adventure", icon: Mountain, label: "Adventure & Hiking" },
    { id: "city", icon: Building, label: "City Explorer" },
    { id: "cultural", icon: Landmark, label: "Cultural & Historical" },
    { id: "food", icon: Utensils, label: "Food & Culinary" },
    { id: "wellness", icon: Spa, label: "Relaxation & Wellness" },
  ]

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and travel preferences.</p>
      </div>
      <Separator className="my-6" />

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/4">
          <Card>
            <CardContent className="flex flex-col items-center space-y-4 pt-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center">
                <h3 className="font-medium">{formData.name}</h3>
                <p className="text-sm text-muted-foreground">{formData.location || "No location set"}</p>
              </div>
              <UploadAvatarButton />
              <WorldMap />
            </CardContent>
          </Card>
        </aside>

        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={handleChange("name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={formData.email} onChange={handleChange("email")} type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={handleChange("phone")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={formData.location} onChange={handleChange("location")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, currency: value }))
                      if (!isEditing) setIsEditing(true)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {isEditing && (
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        name: profile.name,
                        email: profile.email,
                        phone: profile.phone || "",
                        location: profile.location || "",
                        currency: profile.currency,
                      })
                      setIsEditing(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Travel Preferences</CardTitle>
              <CardDescription>Customize your travel experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Travel Interests</Label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {interests_data.map(({ id, icon: Icon, label }) => (
                    <Button
                      key={id}
                      variant={interests.includes(id) ? "default" : "outline"}
                      className="h-auto flex-col gap-2 p-4"
                      onClick={() => toggleInterest(id)}
                    >
                      <Icon className="h-6 w-6" />
                      <span>{label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Travel Settings</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates about your trips</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Deal Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified about price drops</p>
                    </div>
                    <Switch
                      checked={preferences.dealAlerts}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, dealAlerts: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Trip Reminders</Label>
                      <p className="text-sm text-muted-foreground">Receive trip preparation reminders</p>
                    </div>
                    <Switch
                      checked={preferences.tripReminders}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, tripReminders: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Booking</Label>
                      <p className="text-sm text-muted-foreground">Allow AI to book trips within your preferences</p>
                    </div>
                    <Switch
                      checked={preferences.autoBooking}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, autoBooking: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Flexible Dates</Label>
                      <p className="text-sm text-muted-foreground">Show options for flexible travel dates</p>
                    </div>
                    <Switch
                      checked={preferences.flexibleDates}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, flexibleDates: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable dark mode for the entire website</p>
                    </div>
                    <Switch
                      checked={theme === "dark"}
                      defaultChecked={true}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-red-500">Danger Zone</Label>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

