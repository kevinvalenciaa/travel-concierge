import { useProfile } from "@/contexts/profile-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

function ProfileTab() {
  const { name, email, avatar, currency, isLoading } = useProfile()
  
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatar} alt={name || "User"} />
              <AvatarFallback>{name ? name[0].toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{name || "User"}</h2>
              <p className="text-muted-foreground">{email}</p>
              <p className="text-sm text-muted-foreground">Currency: {currency}</p>
 