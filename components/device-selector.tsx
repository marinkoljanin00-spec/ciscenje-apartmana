"use client"

import { useAppStore, type DevicePreference } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Monitor, Smartphone, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function DeviceSelector() {
  const { devicePreference, setDevicePreference } = useAppStore()
  const [selected, setSelected] = useState<DevicePreference>(null)

  if (devicePreference !== null) {
    return null
  }

  const handleConfirm = () => {
    if (selected) {
      setDevicePreference(selected)
    }
  }

  return (
    <Dialog open={devicePreference === null}>
      <DialogContent className="sm:max-w-[420px]" showCloseButton={false}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-xl">Dobrodosli u CLEANUP!</DialogTitle>
          <DialogDescription className="text-base">
            Kako bismo vam pruzili najbolje iskustvo, recite nam koji uredaj koristite.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            type="button"
            onClick={() => setSelected("desktop")}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
              "hover:border-primary/50 hover:bg-primary/5",
              selected === "desktop"
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-border bg-card"
            )}
          >
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
              selected === "desktop" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              <Monitor className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Racunalo</p>
              <p className="text-xs text-muted-foreground">Desktop / Laptop</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelected("mobile")}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
              "hover:border-primary/50 hover:bg-primary/5",
              selected === "mobile"
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-border bg-card"
            )}
          >
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
              selected === "mobile" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              <Smartphone className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Mobitel</p>
              <p className="text-xs text-muted-foreground">Telefon / Tablet</p>
            </div>
          </button>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleConfirm}
            disabled={!selected}
            className="w-full"
            size="lg"
          >
            Nastavi
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Ovu postavku mozete kasnije promijeniti u postavkama.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
