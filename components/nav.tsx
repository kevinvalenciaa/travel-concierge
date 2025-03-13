import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlaneTakeoff, CalendarDays, Settings, User } from "lucide-react"

export function Nav() {
  const items = [
    { href: "/dashboard", icon: PlaneTakeoff },
    { href: "/itinerary", icon: CalendarDays },
    { href: "/preferences", icon: Settings },
    { href: "/profile", icon: User },
  ]
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground"
        >
          <Button variant="ghost" className="w-9 h-9 p-0">
            <item.icon className="h-4 w-4" />
          </Button>
        </Link>
      ))}
    </nav>
  )
}

