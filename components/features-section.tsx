"use client"

import { motion } from "framer-motion"
import { Brain, Clock, Map } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Personalized Recommendations",
    description: "AI suggests trips tailored to your interests",
  },
  {
    icon: Clock,
    title: "Real-Time Deals",
    description: "Finds the best flight & hotel prices",
  },
  {
    icon: Map,
    title: "Smart Itinerary",
    description: "Generates a complete travel schedule for you",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-background shadow-lg"
            >
              <feature.icon className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

