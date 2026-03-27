"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has already given consent
    const consentGiven = localStorage.getItem("cookieConsent")
    if (!consentGiven) {
      // Show after 1 second delay
      setTimeout(() => {
        setIsVisible(true)
        setIsLoading(false)
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem("cookieConsent", "all")
    localStorage.setItem("cookieConsentDate", new Date().toISOString())
    setIsVisible(false)
    // Re-enable analytics, etc.
    window.location.reload()
  }

  const handleAcceptEssential = () => {
    localStorage.setItem("cookieConsent", "essential")
    localStorage.setItem("cookieConsentDate", new Date().toISOString())
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Default to essential only if user dismisses
    localStorage.setItem("cookieConsent", "essential")
  }

  if (!isVisible || isLoading) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-md ml-auto bg-background border border-border rounded-lg shadow-lg p-4 sm:p-6 space-y-4">
        {/* Close Button */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground text-base">Korišćenje Cookies-a</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Koristimo cookies kako bi vam pružili bolje iskustvo. Nužni cookies su neophodni za rad platforme.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Zatvori"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cookie Types Info */}
        <div className="space-y-2 text-xs">
          <div className="flex gap-2">
            <div className="w-1 bg-primary rounded-full flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-foreground">Nužni Cookies</p>
              <p className="text-muted-foreground">Za sigurnost i funkcionalnost</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-1 bg-chart-2 rounded-full flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-foreground">Analitički Cookies</p>
              <p className="text-muted-foreground">Za poboljšanje korisničkog iskustva</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-2 text-xs">
          <button 
            onClick={() => window.location.hash = 'privacy-policy'}
            className="text-primary hover:underline bg-transparent border-0 cursor-pointer"
          >
            Politika privatnosti
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            onClick={() => window.location.hash = 'terms-of-service'}
            className="text-primary hover:underline bg-transparent border-0 cursor-pointer"
          >
            Uvjeti korištenja
          </button>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAcceptEssential}
            className="w-full"
          >
            Samo nužni
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleAcceptAll}
            className="w-full"
          >
            Prihvati sve
          </Button>
        </div>
      </div>
    </div>
  )
}
