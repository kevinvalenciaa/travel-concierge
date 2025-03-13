import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Nav } from "@/components/nav"
import { PlaneTakeoff } from "lucide-react"
import { PreferencesForm } from "@/components/preferences-form"

export default function PreferencesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <PlaneTakeoff className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">AI Travel Concierge</span>
            </a>
            <Nav />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">Travel Preferences</h1>
            <p className="text-lg text-muted-foreground">Help us personalize your travel experiences</p>
          </div>
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <CardTitle>Your Travel Style</CardTitle>
              <CardDescription>Tell us about your preferred way of traveling</CardDescription>
            </CardHeader>
            <CardContent>
              <PreferencesForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

