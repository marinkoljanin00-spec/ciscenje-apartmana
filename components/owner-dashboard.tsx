"use client"

import { useState, useRef } from "react"
import { useAppStore, type Job, CROATIAN_CITIES, type CroatianCity, PROPERTY_TYPES, type PropertyType, CITY_COORDINATES, PREMIUM_MULTIPLIER, getFinalPrice, type UserSpol, type SavedProperty } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { JobCard } from "@/components/job-card"
import { Euro, FileText, Plus, Briefcase, Clock, Star, MapPin, Home, Zap, AlertTriangle, Camera, Upload, BadgeCheck, Building2, Trash2, Save } from "lucide-react"
import { LocationPicker } from "@/components/location-picker"
import { DatePicker } from "@/components/ui/date-picker"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import { CleanerProfileDialog } from "@/components/cleaner-profile-dialog"
import { UserAvatar } from "@/components/user-avatar"
import { ProfilePhotoReminder } from "@/components/profile-photo-reminder"
import type { User } from "@/lib/store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
export function OwnerDashboard() {
  const { user, jobs, users, createJob, deleteJob, approveJob, rejectJob, submitReview, updateProfileImage, updateUserSpol, saveProperty, deleteProperty, getSavedProperties, logout, deleteAccount } = useAppStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reviewJob, setReviewJob] = useState<Job | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [selectedCleaner, setSelectedCleaner] = useState<User | null>(null)
  const [selectedCleanerJob, setSelectedCleanerJob] = useState<Job | null>(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

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

  // Form state
  const [adresa, setAdresa] = useState("")
  const [grad, setGrad] = useState<CroatianCity>("Split")
  const [vrstaNekrtnine, setVrstaNekrtnine] = useState<PropertyType>("Apartman")
  const [cijena, setCijena] = useState("")
  const [datum, setDatum] = useState<Date | undefined>(undefined)
  const [vrijemeOd, setVrijemeOd] = useState("09:00")
  const [vrijemeDo, setVrijemeDo] = useState("12:00")
  const [opis, setOpis] = useState("")
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [hitno, setHitno] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("new")
  const [savePropertyName, setSavePropertyName] = useState("")
  const [showSavePropertyDialog, setShowSavePropertyDialog] = useState(false)

  // Get saved properties
  const savedProperties = getSavedProperties()

  // Handle selecting a saved property
  const handleSelectProperty = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
    if (propertyId && propertyId !== "new") {
      const property = savedProperties.find(p => p.id === propertyId)
      if (property) {
        setAdresa(property.adresa)
        setGrad(property.grad)
        setVrstaNekrtnine(property.vrstaNekrtnine)
        setLocation({ lat: property.lat, lon: property.lon })
      }
    } else {
      // Reset if "new" is selected
      setAdresa("")
      setGrad("Split")
      setVrstaNekrtnine("Apartman")
      setLocation(null)
    }
  }

  // Handle saving current property
  const handleSaveProperty = () => {
    if (!savePropertyName || !adresa || !location) return
    
    saveProperty({
      naziv: savePropertyName,
      adresa,
      grad,
      vrstaNekrtnine,
      lat: location.lat,
      lon: location.lon,
    })
    
    setSavePropertyName("")
    setShowSavePropertyDialog(false)
  }

  // Handle address change from reverse geocoding
  const handleAddressChange = (newAddress: string) => {
    setAdresa(newAddress)
  }

  const myOpenJobs = jobs.filter(
    (j) => j.vlasnik === user?.email && j.status === "OTVORENO"
  )
  
  const pendingApprovalJobs = jobs.filter(
    (j) => j.vlasnik === user?.email && j.status === "ČEKA_ODOBRENJE"
  )

  const activeJobs = jobs.filter(
    (j) => j.vlasnik === user?.email && (j.status === "ODOBRENO" || j.status === "U_TIJEKU")
  )

  const waitingReviewJobs = jobs.filter(
    (j) => j.vlasnik === user?.email && j.status === "ČEKA_RECENZIJU"
  )

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adresa || !cijena || !location || !datum) return

    createJob({
      vlasnik: user?.email || "",
      adresa,
      grad,
      vrstaNekrtnine,
      cijena: parseFloat(cijena),
      hitno,
      datum: format(datum, "dd.MM.yyyy."),
      vrijemeOd,
      vrijemeDo,
      opis,
      lat: location.lat,
      lon: location.lon,
    })

    setAdresa("")
    setCijena("")
    setDatum(undefined)
    setVrijemeOd("09:00")
    setVrijemeDo("12:00")
    setOpis("")
    setLocation(null)
    setVrstaNekrtnine("Apartman")
    setHitno(false)
    setSelectedPropertyId("new")
    setSavePropertyName("")
    setShowSavePropertyDialog(false)
    setIsDialogOpen(false)
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewJob) return
    
    submitReview(reviewJob.id, rating, comment)
    setReviewJob(null)
    setRating(5)
    setComment("")
  }

  const handleViewCleanerProfile = (cleanerEmail: string, job: Job) => {
    const cleaner = users.find(u => u.email === cleanerEmail)
    if (cleaner) {
      setSelectedCleaner(cleaner)
      setSelectedCleanerJob(job)
    }
  }

  // Get min date for date picker (today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2 truncate">
            Bok, {user?.ime}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Upravljajte svojim oglasima za čišćenje
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 sm:mb-8">
        <Card className="border-border/50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Otvoreni oglasi</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">
                  {myOpenJobs.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-chart-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Čekaju odobrenje</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">
                  {pendingApprovalJobs.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-chart-5/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-chart-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Čekaju recenziju</p>
                <p className="text-xl md:text-2xl font-bold text-foreground">
                  {waitingReviewJobs.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-full min-h-[60px]" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Nova narudžba
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Kreiraj novi oglas</DialogTitle>
                  <DialogDescription>
                    Popunite detalje za novi posao čišćenja
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateJob} className="space-y-4 mt-4">
                  {/* Saved Properties Selector */}
                  {savedProperties.length > 0 && (
                    <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <Label className="text-primary font-medium">Odaberite spremljenu nekretninu</Label>
                      </div>
                      <Select value={selectedPropertyId} onValueChange={handleSelectProperty}>
                        <SelectTrigger>
                          <SelectValue placeholder="Nova nekretnina" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">
                            <div className="flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              Nova nekretnina
                            </div>
                          </SelectItem>
                          {savedProperties
                            .filter(p => {
                              // Ensure property.id is a non-empty string
                              if (!p.id || typeof p.id !== 'string') return false
                              const trimmed = p.id.trim()
                              return trimmed.length > 0
                            })
                            .map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                <div className="flex items-center gap-2">
                                  <Home className="w-4 h-4" />
                                  <span className="font-medium">{property.naziv}</span>
                                  <span className="text-muted-foreground text-xs">- {property.adresa}, {property.grad}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {selectedPropertyId && selectedPropertyId !== "new" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            deleteProperty(selectedPropertyId)
                            setSelectedPropertyId("new")
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Obrisi spremljenu nekretninu
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                      <Label htmlFor="vrstaNekrtnine">Vrsta nekretnine</Label>
                      <Select value={vrstaNekrtnine} onValueChange={(v) => setVrstaNekrtnine(v as PropertyType)}>
                        <SelectTrigger id="vrstaNekrtnine">
                          <SelectValue placeholder="Odaberite vrstu" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                {type}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grad">Grad</Label>
                      <Select value={grad} onValueChange={(v) => setGrad(v as CroatianCity)}>
                        <SelectTrigger id="grad">
                          <SelectValue placeholder="Odaberite grad" />
                        </SelectTrigger>
                        <SelectContent>
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
                      <Label htmlFor="adresa">Adresa</Label>
                      <Input
                        id="adresa"
                        placeholder="Kliknite na mapu za auto-popunjavanje"
                        value={adresa}
                        onChange={(e) => setAdresa(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Lokacija na mapi</Label>
                    <p className="text-xs text-muted-foreground">Kliknite na mapu - adresa ce se automatski popuniti</p>
                    <LocationPicker
                      value={location}
                      onChange={setLocation}
                      onAddressChange={handleAddressChange}
                      cityCenter={CITY_COORDINATES[grad]}
                    />
                  </div>
                  
                  {/* Save Property Button */}
                  {selectedPropertyId === "new" && location && adresa && (
                    <div className="p-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20">
                      {!showSavePropertyDialog ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => setShowSavePropertyDialog(true)}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Spremi ovu nekretninu za brzo koristenje
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <Label htmlFor="propertyName">Naziv nekretnine</Label>
                          <div className="flex gap-2">
                            <Input
                              id="propertyName"
                              placeholder="npr. Apartman More, Stan Centar..."
                              value={savePropertyName}
                              onChange={(e) => setSavePropertyName(e.target.value)}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleSaveProperty}
                              disabled={!savePropertyName}
                            >
                              Spremi
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowSavePropertyDialog(false)
                                setSavePropertyName("")
                              }}
                            >
                              Odustani
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Datum čišćenja</Label>
                    <DatePicker
                      value={datum}
                      onChange={setDatum}
                      minDate={today}
                      placeholder="Odaberite datum"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vrijemeOd">Vrijeme od</Label>
                      <Input
                        id="vrijemeOd"
                        type="time"
                        value={vrijemeOd}
                        onChange={(e) => setVrijemeOd(e.target.value)}
                        className="text-base"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vrijemeDo">Vrijeme do</Label>
                      <Input
                        id="vrijemeDo"
                        type="time"
                        value={vrijemeDo}
                        onChange={(e) => setVrijemeDo(e.target.value)}
                        className="text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cijena">Osnovna cijena (EUR)</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="cijena"
                        type="number"
                        min="10"
                        step="0.01"
                        placeholder="45.00"
                        value={cijena}
                        onChange={(e) => setCijena(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Premium/Urgent cleaning toggle */}
                  <div className="p-4 rounded-lg border border-chart-4/30 bg-chart-4/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-chart-4/20 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-chart-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Hitno čišćenje</p>
                          <p className="text-xs text-muted-foreground">Prioritetna obrada, brži odaziv</p>
                        </div>
                      </div>
                      <Switch
                        checked={hitno}
                        onCheckedChange={setHitno}
                      />
                    </div>
                    {hitno && cijena && (
                      <div className="pt-3 border-t border-chart-4/20 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-chart-4">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Cijena se automatski povećava za 50%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Osnovna cijena:</span>
                          <span className="text-foreground">{parseFloat(cijena).toFixed(2)} EUR</span>
                        </div>
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-foreground">Konačna cijena:</span>
                          <span className="text-chart-4">{getFinalPrice(parseFloat(cijena), true).toFixed(2)} EUR</span>
                        </div>
                      </div>
)}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opis">Detalji posla</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Textarea
                        id="opis"
                        placeholder="Opišite posao, npr. veličina stana, posebni zahtjevi..."
                        value={opis}
                        onChange={(e) => setOpis(e.target.value)}
                        className="pl-10 min-h-[100px]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Odustani
                    </Button>
                    <Button type="submit" className="flex-1" disabled={!location || !datum || !adresa || !cijena}>
                      Objavi oglas
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approval Jobs */}
      {pendingApprovalJobs.length > 0 && (
        <Card className="border-border/50 mb-8 border-chart-4/30 bg-chart-4/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-chart-4" />
              Zahtjevi za odobrenje
            </CardTitle>
            <CardDescription>Čistači koji čekaju vaše odobrenje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovalJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="owner"
                  onApprove={() => approveJob(job.id)}
                  onReject={() => rejectJob(job.id)}
                  onViewCleanerProfile={() => job.cistacica && handleViewCleanerProfile(job.cistacica, job)}
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
            <CardDescription>Završeni poslovi koji trebaju vašu recenziju</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {waitingReviewJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="owner"
                  onReview={() => setReviewJob(job)}
                  onViewCleanerProfile={() => job.cistacica && handleViewCleanerProfile(job.cistacica, job)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <Card className="border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Aktivni poslovi
            </CardTitle>
            <CardDescription>Poslovi koji su u tijeku</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="owner"
                  onViewCleanerProfile={() => job.cistacica && handleViewCleanerProfile(job.cistacica, job)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Open Jobs List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Otvoreni oglasi</CardTitle>
          <CardDescription>
            Vaši trenutno otvoreni oglasi za čišćenje
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myOpenJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">
                Nemate otvorenih oglasa
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Kreirajte novi oglas da pronađete čistača
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova narudžba
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myOpenJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="owner"
                  onDelete={() => deleteJob(job.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!reviewJob} onOpenChange={(open) => !open && setReviewJob(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ocijenite čistača/icu</DialogTitle>
            <DialogDescription>
              Ocijenite rad čistača/ice za posao na adresi: {reviewJob?.adresa}, {reviewJob?.grad}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitReview} className="space-y-6 mt-4">
            <div className="space-y-3">
              <Label>Ocjena</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= rating
                          ? "text-chart-4 fill-chart-4"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {rating === 1 && "Vrlo loše"}
                {rating === 2 && "Loše"}
                {rating === 3 && "Prosječno"}
                {rating === 4 && "Dobro"}
                {rating === 5 && "Odlično"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Komentar</Label>
              <Textarea
                id="comment"
                placeholder="Napišite kratak komentar o radu čistača/ice..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReviewJob(null)}
                className="flex-1"
              >
                Odustani
              </Button>
              <Button type="submit" className="flex-1">
                <Star className="w-4 h-4 mr-2" />
                Pošalji recenziju
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cleaner Profile Dialog */}
      <CleanerProfileDialog
        cleaner={selectedCleaner}
        open={!!selectedCleaner}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCleaner(null)
            setSelectedCleanerJob(null)
          }
        }}
        currentJob={selectedCleanerJob}
      />

      {/* Owner Profile Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Profilna slika</DialogTitle>
            <DialogDescription>
              Dodajte svoju fotografiju i dobijte badge verifikacije
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            {!user?.slikaVerificiran && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
                <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs text-foreground leading-relaxed">
                  Nakon uploada profilne slike dobit cete{" "}
                  <span className="font-semibold text-primary">badge verifikacije</span>{" "}
                  koji povecava povjerenje cistaca.
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
            <div className="flex justify-center">
              <UserAvatar user={user ?? {}} size="xl" showBadge={true} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-spol">Spol (za bolji avatar ako nemate sliku)</Label>
              <Select
                value={user?.spol ?? "neodređeno"}
                onValueChange={(v) => updateUserSpol(user?.email ?? "", v as UserSpol)}
              >
                <SelectTrigger id="owner-spol">
                  <SelectValue placeholder="Odaberi spol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muški">Muški</SelectItem>
                  <SelectItem value="ženski">Ženski</SelectItem>
                  <SelectItem value="neodređeno">Neodređeno</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                <Label htmlFor="ownerImageUrl">URL slike</Label>
                <div className="flex gap-2">
                  <Input
                    id="ownerImageUrl"
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

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-destructive text-xl">Izbriši račun</DialogTitle>
            <DialogDescription>
              Ovo će trajno obrisati vaš račun i sve povezane podatke
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm font-medium text-destructive mb-2">Upozorenje:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Svi vaši oglasi će biti obrisani</li>
                <li>• Sve recenzije će biti obrisane</li>
                <li>• Vaša profilna slika će biti obrisana</li>
                <li>• Ova akcija se ne može opozvati</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">
                Upišite &quot;IZBRISI MOJ RACUN&quot; da potvrdite:
              </Label>
              <Input
                id="confirm"
                placeholder="IZBRISI MOJ RACUN"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeleteConfirmation("")
              }}
            >
              Odustani
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmation !== "IZBRISI MOJ RACUN"}
              onClick={() => {
                if (user?.email && deleteConfirmation === "IZBRISI MOJ RACUN") {
                  deleteAccount(user.email)
                  logout()
                  setShowDeleteDialog(false)
                  setDeleteConfirmation("")
                }
              }}
            >
              Trajno izbriši
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings/Account section with Delete option */}
      <Card className="border-border/50 border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive text-lg">Opasna zona</CardTitle>
          <CardDescription>Ove akcije se ne mogu opozvati</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Izbriši račun</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Brisanje računa će trajno obrisati sve vaše podatke uključujući oglase, recenzije i profilnu sliku. Ova akcija se ne može opozvati.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Izbriši moj račun
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 10-minute profile photo reminder */}
      <ProfilePhotoReminder onOpenUpload={() => setShowImageDialog(true)} />
    </div>
  )
}
