"use client"

import { useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { JobCard } from "@/components/job-card"
import {
  CalendarCheck,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Play,
  Star,
} from "lucide-react"

export function MyJobsView() {
  const { user, jobs, startJob, completeJob } = useAppStore()

  // Get all jobs for this cleaner (not including OTVORENO or ZAVRŠENO)
  const myActiveJobs = useMemo(() => {
    const cleanerJobs = jobs.filter(
      (j) => j.cistacica === user?.email && 
      j.status !== "OTVORENO" && 
      j.status !== "ZAVRŠENO"
    )

    // Parse date and time for sorting
    return cleanerJobs.sort((a, b) => {
      // Parse Croatian date format dd.MM.yyyy.
      const parseDate = (dateStr: string) => {
        const parts = dateStr.replace(/\.$/, "").split(".")
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
      }
      
      const dateA = parseDate(a.datum)
      const dateB = parseDate(b.datum)
      
      // First sort by date
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime()
      }
      
      // Then sort by start time
      return a.vrijemeOd.localeCompare(b.vrijemeOd)
    })
  }, [jobs, user?.email])

  // Group jobs by status for better organization
  const todayJobs = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return myActiveJobs.filter((job) => {
      const parts = job.datum.replace(/\.$/, "").split(".")
      const jobDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
      jobDate.setHours(0, 0, 0, 0)
      return jobDate.getTime() === today.getTime()
    })
  }, [myActiveJobs])

  const upcomingJobs = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return myActiveJobs.filter((job) => {
      const parts = job.datum.replace(/\.$/, "").split(".")
      const jobDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
      jobDate.setHours(0, 0, 0, 0)
      return jobDate.getTime() > today.getTime()
    })
  }, [myActiveJobs])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "ČEKA_ODOBRENJE":
        return { 
          icon: Clock, 
          color: "text-chart-4", 
          bgColor: "bg-chart-4/10",
          label: "Čeka odobrenje" 
        }
      case "ODOBRENO":
        return { 
          icon: Play, 
          color: "text-primary", 
          bgColor: "bg-primary/10",
          label: "Spremno za početak" 
        }
      case "U_TIJEKU":
        return { 
          icon: Clock, 
          color: "text-chart-4", 
          bgColor: "bg-chart-4/10",
          label: "U tijeku" 
        }
      case "ČEKA_RECENZIJU":
        return { 
          icon: Star, 
          color: "text-chart-5", 
          bgColor: "bg-chart-5/10",
          label: "Čeka recenziju" 
        }
      default:
        return { 
          icon: AlertCircle, 
          color: "text-muted-foreground", 
          bgColor: "bg-muted",
          label: status 
        }
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <CalendarCheck className="w-8 h-8 text-primary" />
          Moji Poslovi
        </h1>
        <p className="text-muted-foreground">
          Pregled svih vaših poslova sortiranih po datumu i vremenu
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Danas</p>
                <p className="text-xl font-bold text-foreground">{todayJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nadolazeći</p>
                <p className="text-xl font-bold text-foreground">{upcomingJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-chart-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ukupno aktivnih</p>
                <p className="text-xl font-bold text-foreground">{myActiveJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gradova</p>
                <p className="text-xl font-bold text-foreground">
                  {new Set(myActiveJobs.map(j => j.grad)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Jobs */}
      {todayJobs.length > 0 && (
        <Card className="border-border/50 mb-8 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Danas
            </CardTitle>
            <CardDescription>
              Poslovi za danas - {new Date().toLocaleDateString("hr-HR", { 
                weekday: "long", 
                day: "numeric", 
                month: "long" 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="cleaner"
                  onStart={job.status === "ODOBRENO" ? () => startJob(job.id) : undefined}
                  onComplete={job.status === "U_TIJEKU" ? () => completeJob(job.id) : undefined}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Jobs */}
      {upcomingJobs.length > 0 && (
        <Card className="border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-chart-4" />
              Nadolazeći poslovi
            </CardTitle>
            <CardDescription>
              Poslovi planirani za buduće datume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingJobs.map((job) => {
                const statusInfo = getStatusInfo(job.status)
                return (
                  <div key={job.id} className="relative">
                    {/* Date header for visual grouping */}
                    <div className="absolute -left-2 top-4 w-1 h-[calc(100%-2rem)] bg-border rounded-full" />
                    <JobCard
                      job={job}
                      variant="cleaner"
                      onStart={job.status === "ODOBRENO" ? () => startJob(job.id) : undefined}
                      onComplete={job.status === "U_TIJEKU" ? () => completeJob(job.id) : undefined}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {myActiveJobs.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">
                Nemate aktivnih poslova
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Pregledajte dostupne poslove na početnoj stranici i prijavite se za one koji vam odgovaraju
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Legend */}
      {myActiveJobs.length > 0 && (
        <Card className="border-border/50 mt-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Legenda statusa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {[
                { status: "ČEKA_ODOBRENJE", label: "Čeka odobrenje" },
                { status: "ODOBRENO", label: "Spremno za početak" },
                { status: "U_TIJEKU", label: "U tijeku" },
                { status: "ČEKA_RECENZIJU", label: "Čeka recenziju" },
              ].map(({ status, label }) => {
                const info = getStatusInfo(status)
                const IconComponent = info.icon
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md ${info.bgColor} flex items-center justify-center`}>
                      <IconComponent className={`w-3.5 h-3.5 ${info.color}`} />
                    </div>
                    <span className="text-sm text-muted-foreground">{label}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
