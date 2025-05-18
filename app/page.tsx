"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { PricingSection } from "@/components/pricing-section"

export default function HomePage() {
  const router = useRouter()
  
  // Redirect to sign-in page
  useEffect(() => {
    router.push('/sign-in')
  }, [router])
  
  // This will only show briefly before redirect
  return null
}

