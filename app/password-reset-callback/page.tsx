"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { createBrowserSupabaseClient } from "@/lib/supabase"

export default function PasswordResetCallbackPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const validateForm = () => {
    setPasswordError("")
    setError("")
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return false
    }
    
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setError("")
    setSuccessMessage("")
    
    try {
      const supabase = createBrowserSupabaseClient()
      
      // The Supabase client automatically uses the query parameters from the URL
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })
      
      if (updateError) {
        setError(updateError.message || "Failed to update password. Please try again.")
      } else {
        setSuccessMessage("Password updated successfully!")
        setTimeout(() => {
          router.push("/sign-in")
        }, 2000)
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if we have the necessary parameters in the URL
  useEffect(() => {
    const hasAuthParams = searchParams.has('access_token') || 
                          searchParams.has('refresh_token') || 
                          searchParams.has('type')
                          
    if (!hasAuthParams) {
      setError("Invalid password reset link. Please request a new one.")
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/15 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/15 text-green-500 rounded-md text-sm">
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {passwordError && (
                <p className="text-sm text-destructive mt-1">{passwordError}</p>
              )}
            </div>
            <Button className="w-full" type="submit" disabled={isLoading || Boolean(error)}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/sign-in" className="text-primary font-medium hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 