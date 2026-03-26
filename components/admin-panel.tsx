"use client"

import { useState } from "react"
import { useAppStore, type BugReport, type BugReportStatus, ADMIN_EMAIL } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bug,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Calendar,
  User,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

const statusConfig: Record<BugReportStatus, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  novo: { label: "Novo", icon: Clock, color: "text-chart-4", bg: "bg-chart-4/10" },
  u_tijeku: { label: "U tijeku", icon: Loader2, color: "text-chart-2", bg: "bg-chart-2/10" },
  riješeno: { label: "Riješeno", icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
}

const prioritetConfig = {
  niska: { label: "Niska", icon: Info, color: "text-muted-foreground", bg: "bg-muted" },
  srednja: { label: "Srednja", icon: AlertCircle, color: "text-chart-4", bg: "bg-chart-4/10" },
  visoka: { label: "Visoka", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
}

export function AdminPanel() {
  const { user, bugReports, updateBugReportStatus } = useAppStore()
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null)
  const [newStatus, setNewStatus] = useState<BugReportStatus>("novo")
  const [odgovor, setOdgovor] = useState("")

  // Only admin can see this panel
  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Pristup odbijen</h2>
        <p className="text-muted-foreground">
          Samo administrator može pristupiti ovoj stranici.
        </p>
      </div>
    )
  }

  const noviReports = bugReports.filter((r) => r.status === "novo")
  const uTijekuReports = bugReports.filter((r) => r.status === "u_tijeku")
  const rijeseniReports = bugReports.filter((r) => r.status === "riješeno")

  const handleUpdateStatus = () => {
    if (!selectedReport) return
    updateBugReportStatus(selectedReport.id, newStatus, odgovor || undefined)
    setSelectedReport(null)
    setOdgovor("")
  }

  const openReportDialog = (report: BugReport) => {
    setSelectedReport(report)
    setNewStatus(report.status)
    setOdgovor(report.odgovor || "")
  }

  const ReportCard = ({ report }: { report: BugReport }) => {
    const status = statusConfig[report.status]
    const prioritet = prioritetConfig[report.prioritet]
    const StatusIcon = status.icon
    const PrioritetIcon = prioritet.icon

    return (
      <Card
        className="border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
        onClick={() => openReportDialog(report)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{report.naslov}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{report.opis}</p>
            </div>
            <Badge variant="outline" className={cn("flex-shrink-0", prioritet.bg, prioritet.color)}>
              <PrioritetIcon className="w-3 h-3 mr-1" />
              {prioritet.label}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {report.korisnik}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {report.datum}
              </span>
            </div>
            <Badge variant="outline" className={cn("text-xs", status.bg, status.color)}>
              <StatusIcon className={cn("w-3 h-3 mr-1", report.status === "u_tijeku" && "animate-spin")} />
              {status.label}
            </Badge>
          </div>
          {report.odgovor && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-start gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{report.odgovor}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Pregled i upravljanje prijavama nedostataka</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nove prijave</p>
                <p className="text-2xl font-bold text-foreground">{noviReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">U tijeku</p>
                <p className="text-2xl font-bold text-foreground">{uTijekuReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Riješeno</p>
                <p className="text-2xl font-bold text-foreground">{rijeseniReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports sections */}
      {bugReports.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bug className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nema prijava</h3>
            <p className="text-muted-foreground">
              Trenutno nema prijavljenih nedostataka.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {noviReports.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-chart-4" />
                Nove prijave ({noviReports.length})
              </h2>
              <div className="grid gap-4">
                {noviReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            </div>
          )}

          {uTijekuReports.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-chart-2" />
                U tijeku ({uTijekuReports.length})
              </h2>
              <div className="grid gap-4">
                {uTijekuReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            </div>
          )}

          {rijeseniReports.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Riješeno ({rijeseniReports.length})
              </h2>
              <div className="grid gap-4">
                {rijeseniReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalji prijave</DialogTitle>
            <DialogDescription>
              Pregledajte i ažurirajte status prijave
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-muted-foreground">Naslov</Label>
                <p className="text-foreground font-medium">{selectedReport.naslov}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Opis</Label>
                <p className="text-foreground whitespace-pre-wrap">{selectedReport.opis}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Korisnik</Label>
                  <p className="text-foreground">{selectedReport.korisnik}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Datum</Label>
                  <p className="text-foreground">{selectedReport.datum}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Prioritet</Label>
                  <Badge variant="outline" className={cn("mt-1", prioritetConfig[selectedReport.prioritet].bg, prioritetConfig[selectedReport.prioritet].color)}>
                    {prioritetConfig[selectedReport.prioritet].label}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as BugReportStatus)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="u_tijeku">U tijeku</SelectItem>
                      <SelectItem value="riješeno">Riješeno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="odgovor">Odgovor / Bilješka</Label>
                <Textarea
                  id="odgovor"
                  placeholder="Dodajte odgovor ili bilješku o rješenju..."
                  value={odgovor}
                  onChange={(e) => setOdgovor(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setSelectedReport(null)}>
                  Zatvori
                </Button>
                <Button type="button" className="flex-1" onClick={handleUpdateStatus}>
                  Spremi promjene
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
