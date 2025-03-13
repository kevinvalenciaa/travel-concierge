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
    title: "Trips",
    href: "/dashboard/trips",
    icon: Calendar,
  },
  {
    title: "AI",
    href: "/dashboard/assistant",
    icon: Bot,
  },
  {
    title: "Profile",
    href: "/dashboard/settings",
    icon: User,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-4 md:hidden">
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center",
              pathname === item.href ? "text-primary" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

