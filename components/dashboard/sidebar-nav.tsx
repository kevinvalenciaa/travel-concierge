"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, Bot, User } from "lucide-react"

const items = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "My Trips",
    href: "/dashboard/trips",
    icon: Calendar,
  },
  {
    title: "AI Concierge",
    href: "/dashboard/assistant",
    icon: Bot,
  },
  {
    title: "Profile",
    href: "/dashboard/settings",
    icon: User,
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-1 px-0">
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-muted hover:text-muted-foreground w-full",
              pathname === item.href ? "bg-muted" : "transparent",
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

