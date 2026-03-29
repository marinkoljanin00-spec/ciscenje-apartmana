"use client"

import { useState, useMemo, useRef } from "react"
import { useAppStore, type Job, CROATIAN_CITIES, type CroatianCity, type UserSpol } from "@/lib/store"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { JobCard } from "@/components/job-card"
import { UserAvatar } from "@/components/user-avatar"
import { ProfilePhotoReminder } from "@/components/profile-photo-reminder"
import {
  Euro,
  CheckCircle2,
  Clock,
  ArrowLeft,
  MapPin,
  Calendar,
  FileText,
  Sparkles,
  Star,
  Play,
  Filter,
  SortAsc,
  Camera,
  Upload,
  X,
  BadgeCheck,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type SortOption = "date_asc" | "date_desc" | "price_asc" | "price_desc"

export function CleanerDashboard() {
  const { user, jobs, requestJob, startJob, completeJob, getAverageRating, getCleanerReviews, updateProfileImage, updateUserSpol } = useAppStore()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter state
  const [filterCity, setFilterCity] = useState<CroatianCity | "all">("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("date_asc")
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const availableJobs = jobs.filter((j) => j.status === "OTVORENO")
  
  // Apply filters and sorting
  const filteredJobs = useMemo(() => {
    let filtered = [...availableJobs]
    
    // Filter by search query (keywords)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(j => {
        const keywordsMatch = (j.keywords || []).some(k => k.includes(query))
        const addressMatch = j.adresa.toLowerCase().includes(query)
        const descMatch = j.opis.toLowerCase().includes(query)
        const cityMatch = j.grad.toLowerCase().includes(query)
        return keywordsMatch || addressMatch || descMatch || cityMatch
      })
    }
    
    // Filter by city
    if (filterCity !== "all") {
      filtered = filtered.filter(j => j.grad === filterCity)
    }
    
    // Filter by price range
    if (minPrice) {
      filtered = filtered.filter(j => j.cijena >= parseFloat(minPrice))
    }
    if (maxPrice) {
      filtered = filtered.filter(j => j.cijena <= parseFloat(maxPrice))
    }
    
    // Sort - prioritize keyword matches at the top
    filtered.sort((a, b) => {
      // First check if items match the search query exactly in keywords
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const aHasExactKeyword = (a.keywords || []).some(k => k === query)
        const bHasExactKeyword = (b.keywords || []).some(k => k === query)
        if (aHasExactKeyword && !bHasExactKeyword) return -1
        if (!aHasExactKeyword && bHasExactKeyword) return 1
      }
      
      // Then apply sorting preference
      switch (sortBy) {
        case "date_asc":
          return new Date(a.datum.split(".").reverse().join("-")).getTime() - 
                 new Date(b.datum.split(".").reverse().join("-")).getTime()
        case "date_desc":
          return new Date(b.datum.split(".").reverse().join("-")).getTime() - 
                 new Date(a.datum.split(".").reverse().join("-")).getTime()
        case "price_asc":
          return a.cijena - b.cijena
        case "price_desc":
          return b.cijena - a.cijena
        default:
          return 0
      }
    })
    
    return filtered
  }, [availableJobs, filterCity, minPrice, maxPrice, sortBy, searchQuery])
  
  const pendingApprovalJobs = jobs.filter(
    (j) => j.cistacica === user?.email && j.status === "ČEKA_ODOBRENJE"
  )

  const approvedJobs = jobs.filter(
    (j) => j.cistacica === user?.email && j.status === "ODOBRENO"
  )

  const inProgressJobs = jobs.filter(
    (j) => j.cistacica === user?.email && j.status === "U_TIJEKU"
  )

  const waitingReviewJobs = jobs.filter(
    (j) => j.cistacica === user?.email && j.status === "ČEKA_RECENZIJU"
  )

  const completedJobs = jobs.filter(
    (j) => j.cistacica === user?.email && j.status === "ZAVRŠENO"
  )

  const totalEarnings = completedJobs.reduce((acc, j) => acc + j.cijena, 0)
  const myReviews = getCleanerReviews(user?.email || "")
  const avgRating = getAverageRating(user?.email || "")

  const handleRequestJob = (jobId: string) => {
    requestJob(jobId, user?.email || "")
    setSelectedJob(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        updateProfileImage(user?.email || "", base64)
        setShowImageDialog(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUrlSubmit = () => {
    if (imageUrl) {
      updateProfileImage(user?.email || "", imageUrl)
      setImageUrl("")
      setShowImageDialog(false)
    }
  }

  const clearFilters = () => {
    setFilterCity("all")
    setMinPrice("")
    setMaxPrice("")
    setSortBy("date_asc")
    setSearchQuery("")
  }

  const hasActiveFilters = filterCity !== "all" || minPrice || maxPrice || sortBy !== "date_asc" || searchQuery

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2 truncate">
            Bok, {user?.ime}!
          </h1>
          <p className="text-muted-foreground">
            Pronađite poslove i zaradite danas
          </p>
        </div>
        
        {/* Profile Image */}
        <button
          type="button"
          onClick={() => setShowImageDialog(true)}
          className="relative group"
          aria-label="Uredi profilnu sliku"
        >
          <UserAvatar user={user ?? {}} size="lg" showBadge={true} className="ring-2 ring-border group-hover:ring-primary transition-all rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-5 h-5 text-foreground" />
          </div>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card className="border-border/50 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Euro className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Moja zarada</p>
                <p className="text-2xl font-bold text-primary">
                  {totalEarnings.toFixed(2)} EUR
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prosječna ocjena</p>
                <p className="text-2xl font-bold text-foreground">
                  {avgRating > 0 ? avgRating.toFixed(1) : "-"} / 5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-chart-5/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-chart-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktivni poslovi</p>
                <p className="text-2xl font-bold text-foreground">
                  {pendingApprovalJobs.length + approvedJobs.length + inProgressJobs.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Završeni poslovi</p>
                <p className="text-2xl font-bold text-foreground">
                  {completedJobs.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approval Jobs */}
      {pendingApprovalJobs.length > 0 && (
        <Card className="border-border/50 mb-8 border-chart-4/30 bg-chart-4/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-chart-4" />
              Čekaju odobrenje
            </CardTitle>
            <CardDescription>Vaši zahtjevi koji čekaju odobrenje vlasnika</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovalJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="cleaner"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Jobs - Ready to Start */}
      {approvedJobs.length > 0 && (
        <Card className="border-border/50 mb-8 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Odobreni poslovi
            </CardTitle>
            <CardDescription>Poslovi koje možete započeti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="cleaner"
                  onStart={() => startJob(job.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Progress Jobs */}
      {inProgressJobs.length > 0 && (
        <Card className="border-border/50 mb-8 border-chart-4/30 bg-chart-4/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-chart-4" />
              Poslovi u tijeku
            </CardTitle>
            <CardDescription>Vaši trenutno aktivni poslovi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inProgressJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="cleaner"
                  onComplete={() => completeJob(job.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waiting for Review */}
      {waitingReviewJobs.length > 0 && (
        <Card className="border-border/50 mb-8 border-chart-5/30 bg-chart-5/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-chart-5" />
              Čekaju recenziju
            </CardTitle>
            <CardDescription>Završeni poslovi koji čekaju recenziju vlasnika</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {waitingReviewJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="cleaner"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Reviews */}
      {myReviews.length > 0 && (
        <Card className="border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-chart-4" />
              Moje recenzije
            </CardTitle>
            <CardDescription>Recenzije od vlasnika</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myReviews.map((review) => (
                <div key={review.id} className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.ocjena
                            ? "text-chart-4 fill-chart-4"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">{review.datum}</span>
                  </div>
                  <p className="text-sm text-foreground">{review.komentar}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Jobs */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Dostupni poslovi
              </CardTitle>
              <CardDescription>
                Pronađeno {filteredJobs.length} od {availableJobs.length} poslova
              </CardDescription>
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtriraj
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <Input
              placeholder="Pretraži: čišćenje split, apartman, pranje..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              💡 Primjeri pretraga: "čišćenje split", "apartman", "pranje", "studio", "zadar" - rezultati se sortiraju po relevanciji
            </p>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-border/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filterCity" className="text-sm">Grad</Label>
                  <Select value={filterCity} onValueChange={(v) => setFilterCity(v as CroatianCity | "all")}>
                    <SelectTrigger id="filterCity">
                      <SelectValue placeholder="Svi gradovi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Svi gradovi
                        </div>
                      </SelectItem>
                      {CROATIAN_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {city}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minPrice" className="text-sm">Min cijena (EUR)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPrice" className="text-sm">Max cijena (EUR)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    min="0"
                    placeholder="1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortBy" className="text-sm">Sortiraj po</Label>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger id="sortBy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_asc">
                        <div className="flex items-center gap-2">
                          <SortAsc className="w-4 h-4" />
                          Datum (najraniji)
                        </div>
                      </SelectItem>
                      <SelectItem value="date_desc">
                        <div className="flex items-center gap-2">
                          <SortAsc className="w-4 h-4 rotate-180" />
                          Datum (najkasniji)
                        </div>
                      </SelectItem>
                      <SelectItem value="price_asc">
                        <div className="flex items-center gap-2">
                          <Euro className="w-4 h-4" />
                          Cijena (najniža)
                        </div>
                      </SelectItem>
                      <SelectItem value="price_desc">
                        <div className="flex items-center gap-2">
                          <Euro className="w-4 h-4" />
                          Cijena (najviša)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                    <X className="w-4 h-4" />
                    Očisti filtre
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">
                {availableJobs.length === 0 ? "Nema dostupnih poslova" : "Nema poslova s odabranim filtrima"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {availableJobs.length === 0 
                  ? "Provjerite ponovno kasnije za nove prilike"
                  : "Pokušajte promijeniti kriterije pretrage"
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 gap-2">
                  <X className="w-4 h-4" />
                  Očisti filtre
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="cleaner"
                  onView={() => setSelectedJob(job)}
                  onRequest={() => handleRequestJob(job.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedJob && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedJob(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Dostupno
                  </Badge>
                </div>
                <DialogTitle className="text-xl">
                  {selectedJob.adresa}, {selectedJob.grad}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4 pt-2 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {selectedJob.datum}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {selectedJob.vrijemeOd} - {selectedJob.vrijemeDo}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {selectedJob.grad}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Price */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10">
                  <span className="text-muted-foreground">Cijena posla</span>
                  <span className="text-2xl font-bold text-primary flex items-center gap-1">
                    <Euro className="w-5 h-5" />
                    {selectedJob.cijena.toFixed(2)}
                  </span>
                </div>

                {/* Description */}
                {selectedJob.opis && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <FileText className="w-4 h-4" />
                      Opis posla
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed pl-6">
                      {selectedJob.opis}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedJob(null)}
                    className="flex-1"
                  >
                    Zatvori
                  </Button>
                  <Button
                    onClick={() => handleRequestJob(selectedJob.id)}
                    className="flex-1"
                  >
                    Prijavi se za posao
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Profilna slika</DialogTitle>
            <DialogDescription>
              Dodajte svoju fotografiju i dobijte badge verifikacije
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 pt-2">
            {/* Badge info banner */}
            {!user?.slikaVerificiran && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
                <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs text-foreground leading-relaxed">
                  Nakon uploada profilne slike dobit cete{" "}
                  <span className="font-semibold text-primary">badge verifikacije</span>{" "}
                  koji povecava povjerenje vlasnika.
                </p>
              </div>
            )}
            {user?.slikaVerificiran && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-chart-2/10 border border-chart-2/20">
                <BadgeCheck className="w-5 h-5 text-chart-2 flex-shrink-0" />
                <p className="text-xs text-foreground font-medium">
                  Profil je verificiran! Badge je prikazan na vasem profilu.
                </p>
              </div>
            )}

            {/* Current image preview */}
            <div className="flex justify-center">
              <UserAvatar user={user ?? {}} size="xl" showBadge={true} />
            </div>

            {/* Gender selector for better default avatar */}
            <div className="space-y-2">
              <Label htmlFor="spol">Spol (za bolji avatar ako nemate sliku)</Label>
              <Select
                value={user?.spol ?? "neodređeno"}
                onValueChange={(v) => updateUserSpol(user?.email ?? "", v as UserSpol)}
              >
                <SelectTrigger id="spol">
                  <SelectValue placeholder="Odaberi spol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muški">Muški</SelectItem>
                  <SelectItem value="ženski">Ženski</SelectItem>
                  <SelectItem value="neodređeno">Neodređeno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Upload button */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                Učitaj sliku s uređaja
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ili</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL slike</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button onClick={handleImageUrlSubmit} disabled={!imageUrl}>
                    Spremi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 10-minute profile photo reminder */}
      <ProfilePhotoReminder onOpenUpload={() => setShowImageDialog(true)} />
    </div>
  )
}
