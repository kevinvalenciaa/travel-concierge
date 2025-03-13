import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { UserNav } from "@/components/dashboard/user-nav"
// import { AiChat } from "@/components/dashboard/ai-chat"
import { DashboardFooter } from "@/components/dashboard/dashboard-footer"
import { PageTransition } from "@/components/transitions"
import { TripsProvider } from "@/contexts/trips-context"
import { Toaster } from "@/components/ui/toaster"
import type React from "react"
import { ProfileProvider } from "@/contexts/profile-context"
import Link from "next/link"
import Image from "next/image"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <TripsProvider>
      <ProfileProvider>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center px-6">
              <div className="flex items-center md:ml-2">
                {" "}
                {/* Reduced from md:ml-4 */} {/* Updated logo margin */}
                <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
                  <div className="relative w-8 h-8">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Voyentra%20AI%20Mockup%20(1)-F2LveqUm96V8dtUeslKizMhtjUIVVS.png"
                      alt="Voyentra AI Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-[#8c52ff] to-[#5ce1e6] bg-clip-text text-transparent">
                    Voyentra AI
                  </span>
                </Link>
              </div>
              <div className="ml-auto flex items-center space-x-4">
                <UserNav />
              </div>
            </div>
          </header>
          <div className="container mx-auto flex-1 items-start md:grid md:grid-cols-[180px_1fr] md:gap-2 md:px-0 md:pt-6">
            {" "}
            {/* Updated container padding and grid columns */}
            <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block px-1">
              {" "}
              {/* Updated sidebar nav padding */}
              <SidebarNav />
            </aside>
            <main className="flex w-full flex-col overflow-hidden">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
          <DashboardFooter />
          <MobileNav />
          {/* <AiChat /> */}
          <Toaster />
        </div>
      </ProfileProvider>
    </TripsProvider>
  )
}

