"use client"

import { useState } from "react"
import { type User, type Job } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MapPin, Euro, LogOut, User as UserIcon, CheckCircle, Loader2, AlertCircle } from "lucide-react"

interface CleanerDashboardProps {
  user: User
  jobs: Job[]
}

export function CleanerDashboard({ user, jobs: initialJobs }: CleanerDashboardProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const [acceptingJobId, setAcceptingJobId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleAcceptJob(jobId: number) {
    setAcceptingJobId(jobId)
    setError("")
    setSuccess("")
    
    try {
      const response = await fetch("/api/jobs/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess("Posao je uspješno prihvaćen!")
        // Remove the accepted job from the list
        setJobs(jobs.filter(job => job.id !== jobId))
      } else {
        setError(result.error || "Greška pri prihvaćanju posla")
      }
    } catch {
      setError("Mrežna greška. Pokušajte ponovno.")
    }
    setAcceptingJobId(null)
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/auth"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Marketplace Čišćenja</h1>
              <p className="text-sm text-muted-foreground">Dobrodošli, {user.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Sparkles className="w-3 h-3 mr-1" />
              Čistač
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Odjava
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 p-3 rounded-md mb-6">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Dostupni poslovi</CardTitle>
            <CardDescription>
              Pronađite i prihvatite poslove čišćenja u vašoj blizini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">Trenutno nema dostupnih poslova</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Provjerite ponovno kasnije za nove prilike
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-4"
                  >
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Euro className="w-4 h-4" />
                          {Number(job.price).toFixed(2)} EUR
                        </span>
                        {job.client_name && (
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            {job.client_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAcceptJob(job.id)}
                      disabled={acceptingJobId === job.id}
                      className="bg-green-600 hover:bg-green-700 shrink-0"
                    >
                      {acceptingJobId === job.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Prihvaćanje...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Prihvati posao
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
