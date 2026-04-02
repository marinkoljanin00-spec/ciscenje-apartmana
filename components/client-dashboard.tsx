"use client"

import { useState } from "react"
import { type User, type Job } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MapPin, Euro, Plus, Loader2, LogOut, Briefcase, AlertCircle, CheckCircle } from "lucide-react"

interface ClientDashboardProps {
  user: User
  jobs: Job[]
}

export function ClientDashboard({ user, jobs: initialJobs }: ClientDashboardProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleCreateJob(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError("")
    setSuccess("")
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          location: formData.get("location"),
          price: parseFloat(formData.get("price") as string),
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess("Posao je uspješno objavljen!")
        // Refresh page to get updated jobs list
        window.location.reload()
      } else {
        setError(result.error || "Greška pri objavljivanju posla")
      }
    } catch {
      setError("Mrežna greška. Pokušajte ponovno.")
    }
    setIsPending(false)
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/auth"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Otvoren</Badge>
      case "accepted":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Prihvaćen</Badge>
      case "completed":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Završen</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Marketplace Čišćenja</h1>
              <p className="text-sm text-muted-foreground">Dobrodošli, {user.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-primary border-primary">
              <Briefcase className="w-3 h-3 mr-1" />
              Klijent
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Odjava
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create Job Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Objavi posao
                </CardTitle>
                <CardDescription>
                  Opišite posao koji trebate obaviti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Naslov</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="npr. Čišćenje stana 50m2"
                      required
                      disabled={isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Lokacija</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        name="location"
                        placeholder="npr. Zagreb, Trešnjevka"
                        className="pl-10"
                        required
                        disabled={isPending}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Cijena (EUR)</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="50"
                        className="pl-10"
                        required
                        disabled={isPending}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 p-3 rounded-md">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      {success}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Objavljivanje...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Objavi posao
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Moji poslovi</CardTitle>
                <CardDescription>
                  Pregled svih vaših objavljenih poslova
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">Nemate objavljenih poslova</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Objavite svoj prvi posao pomoću forme lijevo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{job.title}</h3>
                            {getStatusBadge(job.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Euro className="w-3 h-3" />
                              {Number(job.price).toFixed(2)} EUR
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
