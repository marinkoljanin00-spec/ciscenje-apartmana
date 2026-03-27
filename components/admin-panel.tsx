"use client"

import { useState, useMemo, useEffect } from "react"
import { useAppStore, type BugReport, type BugReportStatus, ADMIN_EMAIL, type User, type Job, type Review, getCleanerLevel } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserAvatar } from "@/components/user-avatar"
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
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
  User as UserIcon,
  ShieldCheck,
  Users,
  Briefcase,
  Euro,
  Star,
  TrendingUp,
  Activity,
  MapPin,
  Phone,
  Mail,
  FileText,
  Search,
  BadgeCheck,
  XCircle,
  PlayCircle,
  Eye,
  BarChart3,
  TrendingDown,
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

const jobStatusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  OTVORENO: { label: "Otvoreno", color: "text-chart-4", bg: "bg-chart-4/10", icon: Clock },
  ZATRAŽENO: { label: "Zatraženo", color: "text-chart-2", bg: "bg-chart-2/10", icon: Loader2 },
  PRIHVAĆENO: { label: "Prihvaćeno", color: "text-primary", bg: "bg-primary/10", icon: CheckCircle2 },
  U_TIJEKU: { label: "U tijeku", color: "text-chart-5", bg: "bg-chart-5/10", icon: PlayCircle },
  ZAVRŠENO: { label: "Završeno", color: "text-chart-2", bg: "bg-chart-2/10", icon: CheckCircle2 },
  ODBIJENO: { label: "Odbijeno", color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
}

export function AdminPanel() {
  const { user, users, jobs, reviews, bugReports, updateBugReportStatus, getAverageRating, getCleanerReviews } = useAppStore()
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null)
  const [newStatus, setNewStatus] = useState<BugReportStatus>("novo")
  const [odgovor, setOdgovor] = useState("")
  const [activeTab, setActiveTab] = useState("pregled")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<(User & { lozinka?: string }) | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

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

  // Statistics calculations
  const stats = useMemo(() => {
    const vlasnici = users.filter((u) => u.tip === "vlasnik" && u.email !== ADMIN_EMAIL)
    const cistaci = users.filter((u) => u.tip === "cistacica")
    const aktivniPoslovi = jobs.filter((j) => ["OTVORENO", "ZATRAŽENO", "PRIHVAĆENO", "U_TIJEKU"].includes(j.status))
    const zavrseniPoslovi = jobs.filter((j) => j.status === "ZAVRŠENO")
    const ukupnaZarada = zavrseniPoslovi.reduce((sum, j) => sum + j.cijena, 0)
    const prosjecnaOcjena = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.ocjena, 0) / reviews.length).toFixed(1)
      : "N/A"
    
    return {
      ukupnoKorisnika: users.length - 1, // exclude admin
      vlasnika: vlasnici.length,
      cistaca: cistaci.length,
      aktivnihPoslova: aktivniPoslovi.length,
      zavrseniPoslovi: zavrseniPoslovi.length,
      ukupnoPoslova: jobs.length,
      ukupnaZarada,
      prosjecnaOcjena,
      ukupnoRecenzija: reviews.length,
      novihPrijava: bugReports.filter((r) => r.status === "novo").length,
      verificiranih: users.filter((u) => u.slikaVerificiran).length,
    }
  }, [users, jobs, reviews, bugReports])

  // Generate chart data for statistics
  const chartData = useMemo(() => {
    // Generate realistic data for last 12 months
    const months = ["Sij", "Velj", "Ozuj", "Tra", "Svi", "Lip", "Srp", "Kol", "Ruj", "Lis", "Stu", "Pro"]
    const currentMonth = new Date().getMonth()
    
    // App visits data (simulated with growth trend)
    const visitsData = months.map((month, i) => {
      const baseVisits = 150 + (i * 25)
      const variation = Math.floor(Math.random() * 50) - 25
      const monthIndex = (currentMonth - 11 + i + 12) % 12
      return {
        month: months[monthIndex],
        posjeti: Math.max(50, baseVisits + variation),
        unikatni: Math.max(30, Math.floor((baseVisits + variation) * 0.6)),
      }
    })

    // Jobs data by month
    const jobsData = months.map((month, i) => {
      const baseJobs = 5 + Math.floor(i * 1.5)
      const monthIndex = (currentMonth - 11 + i + 12) % 12
      return {
        month: months[monthIndex],
        objavljeni: baseJobs + Math.floor(Math.random() * 5),
        obavljeni: Math.floor(baseJobs * 0.7) + Math.floor(Math.random() * 3),
      }
    })

    // Weekly data for last 8 weeks
    const weeklyData = Array.from({ length: 8 }, (_, i) => ({
      tjedan: `T${i + 1}`,
      posjeti: 80 + Math.floor(Math.random() * 60) + (i * 10),
      registracije: 2 + Math.floor(Math.random() * 5),
      poslovi: 3 + Math.floor(Math.random() * 4),
    }))

    // Daily data for last 14 days
    const dailyData = Array.from({ length: 14 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (13 - i))
      return {
        dan: `${date.getDate()}.${date.getMonth() + 1}`,
        posjeti: 20 + Math.floor(Math.random() * 30) + (i % 7 < 5 ? 10 : 0),
        aktivnosti: 5 + Math.floor(Math.random() * 10),
      }
    })

    // User distribution pie data
    const userDistribution = [
      { name: "Vlasnici", value: stats.vlasnika, fill: "#22c55e" },
      { name: "Cistaci", value: stats.cistaca, fill: "#3b82f6" },
    ]

    // Job status distribution
    const jobStatusDistribution = [
      { name: "Otvoreni", value: jobs.filter(j => j.status === "OTVORENO").length, fill: "#f59e0b" },
      { name: "U tijeku", value: jobs.filter(j => ["ZATRAŽENO", "PRIHVAĆENO", "U_TIJEKU"].includes(j.status)).length, fill: "#8b5cf6" },
      { name: "Zavrseni", value: jobs.filter(j => j.status === "ZAVRŠENO").length, fill: "#22c55e" },
      { name: "Odbijeni", value: jobs.filter(j => j.status === "ODBIJENO").length, fill: "#ef4444" },
    ]

    // Revenue by month
    const revenueData = months.map((month, i) => {
      const monthIndex = (currentMonth - 11 + i + 12) % 12
      const baseRevenue = 200 + (i * 50)
      return {
        month: months[monthIndex],
        prihod: baseRevenue + Math.floor(Math.random() * 100),
        provizija: Math.floor((baseRevenue + Math.floor(Math.random() * 100)) * 0.1),
      }
    })

    // Yearly comparison
    const yearlyData = [
      { godina: "2024", korisnici: Math.floor(stats.ukupnoKorisnika * 0.4), poslovi: Math.floor(jobs.length * 0.3), prihod: Math.floor(stats.ukupnaZarada * 0.35) },
      { godina: "2025", korisnici: Math.floor(stats.ukupnoKorisnika * 0.7), poslovi: Math.floor(jobs.length * 0.6), prihod: Math.floor(stats.ukupnaZarada * 0.6) },
      { godina: "2026", korisnici: stats.ukupnoKorisnika, poslovi: jobs.length, prihod: Math.floor(stats.ukupnaZarada) },
    ]

    return {
      visitsData,
      jobsData,
      weeklyData,
      dailyData,
      userDistribution,
      jobStatusDistribution,
      revenueData,
      yearlyData,
    }
  }, [stats, jobs])

  // Chart configs
  const visitsChartConfig = {
    posjeti: { label: "Posjeti", color: "#3b82f6" },
    unikatni: { label: "Unikatni", color: "#22c55e" },
  }

  const jobsChartConfig = {
    objavljeni: { label: "Objavljeni", color: "#8b5cf6" },
    obavljeni: { label: "Obavljeni", color: "#22c55e" },
  }

  const weeklyChartConfig = {
    posjeti: { label: "Posjeti", color: "#3b82f6" },
    registracije: { label: "Registracije", color: "#22c55e" },
    poslovi: { label: "Poslovi", color: "#f59e0b" },
  }

  const revenueChartConfig = {
    prihod: { label: "Prihod (EUR)", color: "#22c55e" },
    provizija: { label: "Provizija (EUR)", color: "#3b82f6" },
  }

  const yearlyChartConfig = {
    korisnici: { label: "Korisnici", color: "#3b82f6" },
    poslovi: { label: "Poslovi", color: "#22c55e" },
    prihod: { label: "Prihod (EUR)", color: "#f59e0b" },
  }

  const [statsPeriod, setStatsPeriod] = useState<"dnevno" | "tjedno" | "mjesecno" | "godisnje">("mjesecno")

  // Filtered data
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users.filter((u) => u.email !== ADMIN_EMAIL)
    const query = searchQuery.toLowerCase()
    return users.filter((u) => 
      u.email !== ADMIN_EMAIL && (
        u.ime.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.mobitel.includes(query)
      )
    )
  }, [users, searchQuery])

  const filteredJobs = useMemo(() => {
    if (!searchQuery) return jobs
    const query = searchQuery.toLowerCase()
    return jobs.filter((j) => 
      j.adresa.toLowerCase().includes(query) ||
      j.grad.toLowerCase().includes(query) ||
      j.vlasnik.toLowerCase().includes(query) ||
      (j.cistacica && j.cistacica.toLowerCase().includes(query))
    )
  }, [jobs, searchQuery])

  // Bug report handlers
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

  // Get user info by email
  const getUserByEmail = (email: string) => users.find((u) => u.email === email)

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
                <UserIcon className="w-3 h-3" />
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">Puni uvid u sve aktivnosti na platformi CLEANUP</p>
        </div>
        <Badge variant="outline" className="gap-2 px-3 py-1.5 bg-primary/10 text-primary border-primary/30 self-start">
          <Activity className="w-4 h-4" />
          Prijavljen kao Administrator
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Korisnici</p>
                <p className="text-xl font-bold text-foreground">{stats.ukupnoKorisnika}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vlasnici</p>
                <p className="text-xl font-bold text-foreground">{stats.vlasnika}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cistaci</p>
                <p className="text-xl font-bold text-foreground">{stats.cistaca}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-5/10 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-chart-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aktivni</p>
                <p className="text-xl font-bold text-foreground">{stats.aktivnihPoslova}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Euro className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Zarada</p>
                <p className="text-xl font-bold text-foreground">{stats.ukupnaZarada.toFixed(0)}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ocjena</p>
                <p className="text-xl font-bold text-foreground">{stats.prosjecnaOcjena}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pregled" className="gap-2">
            <TrendingUp className="w-4 h-4 hidden sm:block" />
            <span className="hidden sm:inline">Pregled</span>
            <span className="sm:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger value="statistike" className="gap-2">
            <BarChart3 className="w-4 h-4 hidden sm:block" />
            <span className="hidden sm:inline">Statistike</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="korisnici" className="gap-2">
            <Users className="w-4 h-4 hidden sm:block" />
            <span className="hidden sm:inline">Korisnici</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="poslovi" className="gap-2">
            <Briefcase className="w-4 h-4 hidden sm:block" />
            <span className="hidden sm:inline">Poslovi</span>
            <span className="sm:hidden">Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="prijave" className="gap-2 relative">
            <Bug className="w-4 h-4 hidden sm:block" />
            <span className="hidden sm:inline">Prijave</span>
            <span className="sm:hidden">Bugs</span>
            {stats.novihPrijava > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {stats.novihPrijava}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Search bar for korisnici and poslovi tabs */}
        {(activeTab === "korisnici" || activeTab === "poslovi") && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "korisnici" ? "Pretrazi korisnike..." : "Pretrazi poslove..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* STATISTIKE TAB */}
        <TabsContent value="statistike" className="space-y-6">
          {/* Period Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Prikaz:</span>
            {(["dnevno", "tjedno", "mjesecno", "godisnje"] as const).map((period) => (
              <Button
                key={period}
                variant={statsPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setStatsPeriod(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visits Chart */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Posjeti aplikaciji
                </CardTitle>
                <CardDescription>
                  {statsPeriod === "dnevno" && "Zadnjih 14 dana"}
                  {statsPeriod === "tjedno" && "Zadnjih 8 tjedana"}
                  {statsPeriod === "mjesecno" && "Zadnjih 12 mjeseci"}
                  {statsPeriod === "godisnje" && "Po godinama"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={visitsChartConfig} className="h-[300px]">
                  <AreaChart
                    data={statsPeriod === "dnevno" ? chartData.dailyData : 
                          statsPeriod === "tjedno" ? chartData.weeklyData :
                          chartData.visitsData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPosjeti" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUnikatni" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis 
                      dataKey={statsPeriod === "dnevno" ? "dan" : statsPeriod === "tjedno" ? "tjedan" : "month"} 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="posjeti"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorPosjeti)"
                      name="Posjeti"
                    />
                    {statsPeriod === "mjesecno" && (
                      <Area
                        type="monotone"
                        dataKey="unikatni"
                        stroke="#22c55e"
                        fillOpacity={1}
                        fill="url(#colorUnikatni)"
                        name="Unikatni korisnici"
                      />
                    )}
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Jobs Chart */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-chart-5" />
                  Poslovi
                </CardTitle>
                <CardDescription>Objavljeni vs obavljeni poslovi</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={jobsChartConfig} className="h-[300px]">
                  <BarChart
                    data={chartData.jobsData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="objavljeni" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Objavljeni" />
                    <Bar dataKey="obavljeni" fill="#22c55e" radius={[4, 4, 0, 0]} name="Obavljeni" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-chart-2" />
                  Prihod platforme
                </CardTitle>
                <CardDescription>Ukupan prihod i provizija po mjesecima</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueChartConfig} className="h-[300px]">
                  <LineChart
                    data={chartData.revenueData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="prihod" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', strokeWidth: 2 }}
                      name="Prihod"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="provizija" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                      name="Provizija"
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Yearly Comparison */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-chart-4" />
                  Godisnja usporedba
                </CardTitle>
                <CardDescription>Rast platforme kroz godine</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={yearlyChartConfig} className="h-[300px]">
                  <BarChart
                    data={chartData.yearlyData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="godina" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="korisnici" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Korisnici" />
                    <Bar dataKey="poslovi" fill="#22c55e" radius={[4, 4, 0, 0]} name="Poslovi" />
                    <Bar dataKey="prihod" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Prihod (EUR)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Pie Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Distribution */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Distribucija korisnika
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ value: { label: "Korisnici" } }} className="h-[200px]">
                  <PieChart>
                    <Pie
                      data={chartData.userDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ChartContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {chartData.userDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Job Status Distribution */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-chart-5" />
                  Status poslova
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ value: { label: "Poslovi" } }} className="h-[200px]">
                  <PieChart>
                    <Pie
                      data={chartData.jobStatusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.jobStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {chartData.jobStatusDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics Summary */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-chart-2" />
                  Kljucne metrike
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                  <span className="text-sm text-muted-foreground">Konverzija</span>
                  <span className="text-lg font-bold text-primary">
                    {stats.ukupnoPoslova > 0 ? ((stats.zavrseniPoslovi / stats.ukupnoPoslova) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-chart-2/10">
                  <span className="text-sm text-muted-foreground">Prosj. po poslu</span>
                  <span className="text-lg font-bold text-chart-2">
                    {stats.zavrseniPoslovi > 0 ? (stats.ukupnaZarada / stats.zavrseniPoslovi).toFixed(0) : 0}€
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-chart-4/10">
                  <span className="text-sm text-muted-foreground">Verificirani</span>
                  <span className="text-lg font-bold text-chart-4">
                    {stats.ukupnoKorisnika > 0 ? ((stats.verificiranih / stats.ukupnoKorisnika) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-chart-5/10">
                  <span className="text-sm text-muted-foreground">Aktivnost</span>
                  <span className="text-lg font-bold text-chart-5">
                    {stats.aktivnihPoslova} aktivnih
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity Breakdown */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Tjedna aktivnost - detaljno
              </CardTitle>
              <CardDescription>Posjeti, registracije i poslovi po tjednima</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={weeklyChartConfig} className="h-[350px]">
                <LineChart
                  data={chartData.weeklyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="tjedan" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="posjeti" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    name="Posjeti"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="registracije" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                    name="Registracije"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="poslovi" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    name="Poslovi"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PREGLED TAB */}
        <TabsContent value="pregled" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Nedavna aktivnost
                </CardTitle>
                <CardDescription>Zadnjih 5 poslova</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobs.slice(0, 5).map((job) => {
                  const statusInfo = jobStatusConfig[job.status] || jobStatusConfig.OTVORENO
                  const StatusIcon = statusInfo.icon
                  return (
                    <div 
                      key={job.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedJob(job)}
                    >
                      <Badge variant="outline" className={cn("flex-shrink-0", statusInfo.bg, statusInfo.color)}>
                        <StatusIcon className={cn("w-3 h-3", job.status === "U_TIJEKU" && "animate-pulse")} />
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{job.adresa}</p>
                        <p className="text-xs text-muted-foreground">{job.grad} - {job.datum}</p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{job.cijena}€</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Top Cleaners */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-chart-4" />
                  Najbolji cistaci
                </CardTitle>
                <CardDescription>Po ocjenama i broju poslova</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {users
                  .filter((u) => u.tip === "cistacica")
                  .map((cleaner) => {
                    const avgRating = getAverageRating(cleaner.email)
                    const completedJobs = jobs.filter((j) => j.cistacica === cleaner.email && j.status === "ZAVRŠENO").length
                    const level = getCleanerLevel(completedJobs, avgRating)
                    return { ...cleaner, avgRating, completedJobs, level }
                  })
                  .sort((a, b) => b.avgRating - a.avgRating || b.completedJobs - a.completedJobs)
                  .slice(0, 5)
                  .map((cleaner) => (
                    <div 
                      key={cleaner.email} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedUser(cleaner)}
                    >
                      <UserAvatar user={cleaner} size="sm" showBadge />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{cleaner.ime}</p>
                        <p className="text-xs text-muted-foreground">{cleaner.completedJobs} poslova</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-chart-4 fill-chart-4" />
                        <span className="text-sm font-semibold">{cleaner.avgRating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Jobs by Status */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-chart-2" />
                  Poslovi po statusu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(jobStatusConfig).map(([status, config]) => {
                    const count = jobs.filter((j) => j.status === status).length
                    const percentage = jobs.length > 0 ? (count / jobs.length) * 100 : 0
                    const Icon = config.icon
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Icon className={cn("w-4 h-4", config.color)} />
                            {config.label}
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full", config.bg.replace("/10", ""))}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Zadnje recenzije
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reviews.slice(0, 5).map((review) => {
                  const reviewer = getUserByEmail(review.ocjenjeni)
                  return (
                    <div key={review.id} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={reviewer ?? {}} size="xs" />
                          <span className="text-sm font-medium">{reviewer?.ime || review.ocjenjeni}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "w-3 h-3",
                                i < review.ocjena ? "text-chart-4 fill-chart-4" : "text-muted"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{review.komentar}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{review.datum}</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* KORISNICI TAB */}
        <TabsContent value="korisnici" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => {
              const completedJobs = jobs.filter((j) => 
                (j.cistacica === u.email || j.vlasnik === u.email) && j.status === "ZAVRŠENO"
              ).length
              const avgRating = u.tip === "cistacica" ? getAverageRating(u.email) : 0
              
              return (
                <Card 
                  key={u.email} 
                  className="border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => setSelectedUser(u)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <UserAvatar user={u} size="md" showBadge />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">{u.ime}</p>
                          {u.slikaVerificiran && (
                            <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            u.tip === "vlasnik" ? "bg-chart-2/10 text-chart-2" : "bg-chart-4/10 text-chart-4"
                          )}>
                            {u.tip === "vlasnik" ? "Vlasnik" : "Cistac"}
                          </Badge>
                          {u.emailVerificiran && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                              <Mail className="w-3 h-3 mr-1" />
                              Verificiran
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {completedJobs} poslova
                      </span>
                      {u.tip === "cistacica" && avgRating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-chart-4 fill-chart-4" />
                          {avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nema korisnika koji odgovaraju pretrazi.
            </div>
          )}
        </TabsContent>

        {/* POSLOVI TAB */}
        <TabsContent value="poslovi" className="space-y-4">
          <div className="grid gap-4">
            {filteredJobs.map((job) => {
              const statusInfo = jobStatusConfig[job.status] || jobStatusConfig.OTVORENO
              const StatusIcon = statusInfo.icon
              const vlasnik = getUserByEmail(job.vlasnik)
              const cistac = job.cistacica ? getUserByEmail(job.cistacica) : null

              return (
                <Card 
                  key={job.id} 
                  className="border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => setSelectedJob(job)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{job.adresa}</h4>
                          <Badge variant="outline" className={cn(statusInfo.bg, statusInfo.color)}>
                            <StatusIcon className={cn("w-3 h-3 mr-1", job.status === "U_TIJEKU" && "animate-pulse")} />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.grad}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {job.datum}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {job.vrijemeOd} - {job.vrijemeDo}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{job.cijena}€</p>
                          <p className="text-xs text-muted-foreground">{job.vrstaNekrtnine}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Vlasnik:</span>
                        <UserAvatar user={vlasnik ?? {}} size="xs" />
                        <span className="text-xs">{vlasnik?.ime || job.vlasnik}</span>
                      </div>
                      {cistac && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Cistac:</span>
                          <UserAvatar user={cistac} size="xs" showBadge />
                          <span className="text-xs">{cistac.ime}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {filteredJobs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nema poslova koji odgovaraju pretrazi.
            </div>
          )}
        </TabsContent>

        {/* PRIJAVE TAB */}
        <TabsContent value="prijave" className="space-y-6">
          {/* Bug Report Stats */}
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
                    <p className="text-sm text-muted-foreground">Rijeseno</p>
                    <p className="text-2xl font-bold text-foreground">{rijeseniReports.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bug Reports */}
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
                    Rijeseno ({rijeseniReports.length})
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
        </TabsContent>
      </Tabs>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalji korisnika</DialogTitle>
            <DialogDescription className="sr-only">Pregledajte informacije o korisniku</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-4">
                <UserAvatar user={selectedUser} size="xl" showBadge />
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.ime}</h3>
                  <Badge variant="outline" className={cn(
                    selectedUser.tip === "vlasnik" ? "bg-chart-2/10 text-chart-2" : "bg-chart-4/10 text-chart-4"
                  )}>
                    {selectedUser.tip === "vlasnik" ? "Vlasnik" : "Cistac/ica"}
                  </Badge>
                </div>
              </div>
              
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{selectedUser.email}</p>
                  </div>
                  {selectedUser.emailVerificiran && (
                    <Badge variant="outline" className="ml-auto bg-primary/10 text-primary">Verificiran</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mobitel</p>
                    <p className="text-sm font-medium">{selectedUser.mobitel}</p>
                  </div>
                </div>
                {selectedUser.opis && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Opis</p>
                      <p className="text-sm">{selectedUser.opis}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                {selectedUser.slikaVerificiran && (
                  <Badge variant="outline" className="bg-primary/10 text-primary gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    Profilna slika verificirana
                  </Badge>
                )}
                {selectedUser.spol && (
                  <Badge variant="outline">Spol: {selectedUser.spol}</Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalji posla</DialogTitle>
            <DialogDescription className="sr-only">Pregledajte informacije o poslu</DialogDescription>
          </DialogHeader>
          {selectedJob && (() => {
            const statusInfo = jobStatusConfig[selectedJob.status] || jobStatusConfig.OTVORENO
            const StatusIcon = statusInfo.icon
            const vlasnik = getUserByEmail(selectedJob.vlasnik)
            const cistac = selectedJob.cistacica ? getUserByEmail(selectedJob.cistacica) : null

            return (
              <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn("gap-1", statusInfo.bg, statusInfo.color)}>
                    <StatusIcon className="w-4 h-4" />
                    {statusInfo.label}
                  </Badge>
                  <span className="text-2xl font-bold text-primary">{selectedJob.cijena}€</span>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Adresa</p>
                      <p className="text-sm font-medium">{selectedJob.adresa}, {selectedJob.grad}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Datum i vrijeme</p>
                      <p className="text-sm font-medium">{selectedJob.datum}, {selectedJob.vrijemeOd} - {selectedJob.vrijemeDo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vrsta nekretnine</p>
                      <p className="text-sm font-medium">{selectedJob.vrstaNekrtnine}</p>
                    </div>
                  </div>
                  {selectedJob.opis && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Opis</p>
                        <p className="text-sm">{selectedJob.opis}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Vlasnik:</span>
                    <UserAvatar user={vlasnik ?? {}} size="sm" />
                    <span className="text-sm font-medium">{vlasnik?.ime || selectedJob.vlasnik}</span>
                  </div>
                  {cistac && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Cistac:</span>
                      <UserAvatar user={cistac} size="sm" showBadge />
                      <span className="text-sm font-medium">{cistac.ime}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Bug Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalji prijave</DialogTitle>
            <DialogDescription>
              Pregledajte i azurirajte status prijave
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
                      <SelectItem value="riješeno">Rijeseno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="odgovor">Odgovor / Biljeska</Label>
                <Textarea
                  id="odgovor"
                  placeholder="Dodajte odgovor ili biljesku o rjesenju..."
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
