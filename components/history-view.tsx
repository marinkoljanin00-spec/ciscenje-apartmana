"use client"

import { useAppStore } from "@/lib/store"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { History, Euro, MapPin, User, Star, Clock, Calendar } from "lucide-react"

export function HistoryView() {
  const { user, jobs, reviews, users } = useAppStore()

  const historyJobs =
    user?.tip === "vlasnik"
      ? jobs.filter(
          (j) => j.vlasnik === user.email && j.status !== "OTVORENO"
        )
      : jobs.filter((j) => j.cistacica === user?.email)

  const statusConfig: Record<string, { label: string; className: string }> = {
    OTVORENO: {
      label: "Otvoreno",
      className: "bg-primary/10 text-primary",
    },
    "ČEKA_ODOBRENJE": {
      label: "Čeka odobrenje",
      className: "bg-chart-4/10 text-chart-4",
    },
    ODOBRENO: {
      label: "Odobreno",
      className: "bg-primary/10 text-primary",
    },
    U_TIJEKU: {
      label: "U tijeku",
      className: "bg-chart-4/10 text-chart-4",
    },
    "ČEKA_RECENZIJU": {
      label: "Čeka recenziju",
      className: "bg-chart-5/10 text-chart-5",
    },
    ZAVRŠENO: {
      label: "Završeno",
      className: "bg-muted text-muted-foreground",
    },
  }

  const getReviewForJob = (jobId: string) => {
    return reviews.find((r) => r.oglas_id === jobId)
  }

  const getCleanerName = (email: string | undefined) => {
    if (!email) return "-"
    const cleaner = users.find(u => u.email === email)
    return cleaner?.ime || email
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <History className="w-8 h-8 text-primary" />
          Povijest
        </h1>
        <p className="text-muted-foreground">
          {user?.tip === "vlasnik"
            ? "Pregled vaših prošlih narudžbi"
            : "Pregled vaših obavljenih poslova"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <History className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ukupno poslova</p>
                <p className="text-2xl font-bold text-foreground">
                  {historyJobs.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Euro className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {user?.tip === "vlasnik" ? "Ukupno potrošeno" : "Ukupna zarada"}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {historyJobs
                    .filter((j) => j.status === "ZAVRŠENO")
                    .reduce((acc, j) => acc + j.cijena, 0)
                    .toFixed(2)}{" "}
                  EUR
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Arhiva poslova</CardTitle>
          <CardDescription>
            Detaljan pregled svih vaših poslova
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">
                Nema povijesti
              </h3>
              <p className="text-sm text-muted-foreground">
                Vaša povijest poslova će se pojaviti ovdje
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Adresa
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Datum
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Vrijeme
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4" />
                        Cijena
                      </div>
                    </TableHead>
                    {user?.tip === "vlasnik" && (
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Čistač/ica
                        </div>
                      </TableHead>
                    )}
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Ocjena
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyJobs.map((job) => {
                    const review = getReviewForJob(job.id)
                    const status = statusConfig[job.status] || statusConfig.OTVORENO
                    return (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          {job.adresa}, {job.grad}
                        </TableCell>
                        <TableCell>{job.datum}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {job.vrijemeOd} - {job.vrijemeDo}
                        </TableCell>
                        <TableCell>{job.cijena.toFixed(2)} EUR</TableCell>
                        {user?.tip === "vlasnik" && (
                          <TableCell className="text-muted-foreground">
                            {getCleanerName(job.cistacica)}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={status.className}
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {review ? (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= review.ocjena
                                      ? "text-chart-4 fill-chart-4"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
