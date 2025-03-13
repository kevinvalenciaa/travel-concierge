"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/placeholder.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your AI-Powered Travel Planner
            <span className="block text-2xl md:text-3xl mt-2 text-white/90">Smarter, Faster, Personalized</span>
          </h1>
          <Button size="lg" className="text-lg px-8" onClick={() => (window.location.href = "/dashboard")}>
            Plan My Trip
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

