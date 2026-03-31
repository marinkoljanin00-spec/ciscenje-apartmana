"use client"

import { ClientDashboard } from "@/components/client-dashboard"
import { useState, useEffect } from "react"
import type { User, Job } from "@/app/actions"

export default function Home() {
  const [error, setError] = useState<string | null>(null)

  // Mock user for testing UI
  const testUser: User = {
    id: 1,
    email: "test@test.com",
    full_name: "Test Korisnik",
    role: "client",
    created_at: new Date().toISOString()
  }

  // Empty jobs array - will show "Nemate objavljenih poslova"
  const testJobs: Job[] = []

  useEffect(() => {
    // Catch any global errors
    const handleError = (event: ErrorEvent) => {
      setError(event.message)
    }
    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  return (
    <>
      {error && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 text-center font-bold text-lg">
          GREŠKA: {error}
        </div>
      )}
      <ClientDashboard user={testUser} jobs={testJobs} />
    </>
  )
}
