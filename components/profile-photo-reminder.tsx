"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { Camera, BadgeCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProfilePhotoReminderProps {
  onOpenUpload: () => void
}

export function ProfilePhotoReminder({ onOpenUpload }: ProfilePhotoReminderProps) {
  const { user } = useAppStore()
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Only show if user has no profile picture and hasn't dismissed it
    if (user?.slika || dismissed) return

    const timer = setTimeout(() => {
      setVisible(true)
    }, 10 * 60 * 1000) // 10 minuta

    return () => clearTimeout(timer)
  }, [user?.slika, dismissed])

  if (!visible || dismissed || user?.slika) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Camera className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">Dodajte profilnu sliku</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Korisnici s profilnom slikom dobivaju{" "}
            <span className="text-primary font-medium inline-flex items-center gap-0.5">
              <BadgeCheck className="w-3 h-3" />
              badge verifikacije
            </span>{" "}
            i veće povjerenje.
          </p>
          <Button
            size="sm"
            className="mt-2 h-7 text-xs gap-1.5"
            onClick={() => {
              setDismissed(true)
              setVisible(false)
              onOpenUpload()
            }}
          >
            <Camera className="w-3 h-3" />
            Dodaj sliku
          </Button>
        </div>
        <button
          type="button"
          aria-label="Zatvori obavijest"
          onClick={() => {
            setDismissed(true)
            setVisible(false)
          }}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
