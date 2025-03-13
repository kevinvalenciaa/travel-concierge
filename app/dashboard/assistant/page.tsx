"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const suggestedPrompts = [
  "Plan a weekend getaway under $500",
  "Find the best time to visit Bali",
  "Create a family-friendly itinerary in London",
  "Suggest romantic restaurants in Paris",
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI travel assistant. How can I help you plan your next adventure?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Function to generate a simple AI response
  const generateAIResponse = async (userMessage: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate a contextual response based on the user's message
    let response = "I understand you're interested in "
    if (userMessage.toLowerCase().includes("weekend")) {
      response += "planning a weekend getaway. I can help you find destinations that fit your budget and timeframe."
    } else if (userMessage.toLowerCase().includes("bali")) {
      response += "visiting Bali. The best time to visit is typically during the dry season, from April to October."
    } else if (userMessage.toLowerCase().includes("london")) {
      response += "exploring London with your family. I'll suggest some kid-friendly attractions and activities."
    } else if (userMessage.toLowerCase().includes("paris")) {
      response += "romantic dining in Paris. I know several intimate restaurants with amazing views."
    } else {
      response += "travel planning. Could you tell me more about your preferences?"
    }

    return response
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Generate and add AI response
    const aiResponse = await generateAIResponse(content)
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiResponse,
    }
    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSendMessage(input)
  }

  const handlePromptClick = async (prompt: string) => {
    await handleSendMessage(prompt)
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Travel Assistant</h2>
        <p className="text-muted-foreground">Your personal AI travel planner and guide</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <Card className="flex h-[700px] flex-col">
          <CardHeader>
            <CardTitle>Chat with AI Assistant</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "assistant" ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="rounded-lg bg-muted px-4 py-2">
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                Send
              </Button>
            </form>
          </div>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start w-full text-left whitespace-normal h-auto"
                    onClick={() => handlePromptClick(prompt)}
                    disabled={isLoading}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start">
                  Japan Trip Planning
                </Button>
                <Button variant="ghost" className="justify-start">
                  Paris Restaurant Recommendations
                </Button>
                <Button variant="ghost" className="justify-start">
                  Beach Vacation Ideas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

