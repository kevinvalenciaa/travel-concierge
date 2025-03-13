"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useProfile } from "@/contexts/profile-context"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export function UploadAvatarButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { updateProfile } = useProfile()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        setIsOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (preview) {
      updateProfile({ avatar: preview })
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      })
    }
    handleClose()
  }

  const handleClose = () => {
    setIsOpen(false)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
        Change Avatar
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>Preview your new profile picture before saving changes.</DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="relative mx-auto h-48 w-48 rounded-full overflow-hidden">
              <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

