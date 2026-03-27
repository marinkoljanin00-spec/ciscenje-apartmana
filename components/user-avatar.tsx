"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/lib/store"
import { cn } from "@/lib/utils"
import { BadgeCheck } from "lucide-react"

interface UserAvatarProps {
  user: Partial<User> & { ime?: string; email?: string; slika?: string; spol?: User["spol"]; slikaVerificiran?: boolean }
  className?: string
  showBadge?: boolean
  size?: "sm" | "md" | "lg" | "xl"
}

// Returns the default avatar seed/style based on gender
function getDefaultAvatarUrl(email: string, spol?: User["spol"]): string {
  // Use gender-appropriate dicebear styles
  if (spol === "ženski") {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}&style=circle&top=longHair,straightHair,wavyHair,shavedSides&accessories=prescription01,prescription02,round&facialHair=`
  }
  if (spol === "muški") {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}&style=circle&top=shortHairShortFlat,shortHairSides,shortHairDreads01,hat&facialHair=beardLight,beardMedium,moustacheMagnum`
  }
  // Default neutral
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email ?? "user")}`
}

const sizeClasses: Record<string, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
}

const badgeSizeClasses: Record<string, string> = {
  sm: "w-3 h-3 -bottom-0.5 -right-0.5",
  md: "w-4 h-4 -bottom-0.5 -right-0.5",
  lg: "w-5 h-5 -bottom-0.5 -right-0.5",
  xl: "w-6 h-6 -bottom-1 -right-1",
}

export function UserAvatar({ user, className, showBadge = true, size = "md" }: UserAvatarProps) {
  const initials = user.ime
    ? user.ime
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  const avatarSrc = user.slika
    ? user.slika
    : getDefaultAvatarUrl(user.email ?? "user", user.spol)

  return (
    <div className={cn("relative inline-flex flex-shrink-0", className)}>
      <Avatar className={cn(sizeClasses[size])}>
        <AvatarImage src={avatarSrc} alt={user.ime ?? "Korisnik"} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      {showBadge && user.slikaVerificiran && (
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background",
            badgeSizeClasses[size]
          )}
          title="Verificiran profil"
          aria-label="Verificiran profil"
        >
          <BadgeCheck className="w-full h-full p-0.5" />
        </span>
      )}
    </div>
  )
}
