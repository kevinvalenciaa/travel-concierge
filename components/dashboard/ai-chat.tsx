"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, X } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const aiMessage = {
      role: "assistant" as const,
      content: "I'll help you plan your perfect trip! What kind of destination are you interested in?",
    }
    setMessages((prev) => [...prev, aiMessage])
    setIsLoading(false)
  }

  if (!isOpen) {
    return (
      <Button className="fixed bottom-20 right-4 h-12 w-12 rounded-full md:bottom-8" onClick={() => setIsOpen(true)}>
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-20 right-4 w-80 md:bottom-8 md:w-96">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">AI Travel Assistant</CardTitle>
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
              <div
                className={`rounded-lg px-3 py-2 ${
                  message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input placeholder="Ask anything..." value={input} onChange={(e) => setInput(e.target.value)} />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

