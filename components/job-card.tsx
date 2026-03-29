"use client"

import { type Job, useAppStore, getCleanerLevel, getFinalPrice } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Calendar, Euro, Trash2, Eye, Check, Clock, Play, X, Star, Map, Building2, Phone, Mail, Lock, ShieldCheck, Trophy, TrendingUp, Zap, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { useState } from "react"

const JobLocationMap = dynamic(
  () => import("@/components/job-location-map").then((mod) => mod.JobLocationMap),
  { ssr: false }
)

interface JobCardProps {
  job: Job
  variant?: "owner" | "cleaner" | "detail"
  onDelete?: () => void
  onView?: () => void
  onRequest?: () => void
  onApprove?: () => void
  onReject?: () => void
  onStart?: () => void
  onComplete?: () => void
  onReview?: () => void
  onViewCleanerProfile?: () => void
}

const statusConfig = {
  OTVORENO: {
    label: "Dostupno",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  "ČEKA_ODOBRENJE": {
    label: "Čeka odobrenje",
    className: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  },
  ODOBRENO: {
    label: "Odobreno",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  U_TIJEKU: {
    label: "U tijeku",
    className: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  },
  "ČEKA_RECENZIJU": {
    label: "Čeka recenziju",
    className: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  },
  ZAVRŠENO: {
    label: "Završeno",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export function JobCard({
  job,
  variant = "cleaner",
  onDelete,
  onView,
  onRequest,
  onApprove,
  onReject,
  onStart,
  onComplete,
  onReview,
  onViewCleanerProfile,
}: JobCardProps) {
  const status = statusConfig[job.status]
  const { users, jobs, getAverageRating, getCleanerReviews } = useAppStore()
  const [showMap, setShowMap] = useState(false)
  
  const cleaner = users.find(u => u.email === job.cistacica)
  const owner = users.find(u => u.email === job.vlasnik)

  // Calculate cleaner level if cleaner exists
  const cleanerCompletedJobs = cleaner 
    ? jobs.filter(j => j.cistacica === cleaner.email && j.status === "ZAVRŠENO").length 
    : 0
  const cleanerRating = cleaner ? getAverageRating(cleaner.email) : 0
  const cleanerLevel = cleaner ? getCleanerLevel(cleanerCompletedJobs, cleanerRating) : null
  const cleanerReviews = cleaner ? getCleanerReviews(cleaner.email) : []

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "elite":
        return <Trophy className="w-3 h-3" />
      case "pro":
        return <ShieldCheck className="w-3 h-3" />
      default:
        return <TrendingUp className="w-3 h-3" />
    }
  }

  return (
    <Card className="group border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-14 w-14 rounded-xl flex-shrink-0">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${job.id}`}
              alt="Job avatar"
            />
            <AvatarFallback className="rounded-xl bg-secondary text-secondary-foreground">
              {job.adresa.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-medium", status.className)}
                  >
                    {status.label}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Building2 className="w-3 h-3 mr-1" />
                    {job.vrstaNekrtnine}
                  </Badge>
                  {job.hitno && (
                    <Badge className="text-xs bg-chart-4 text-chart-4-foreground border-0">
                      <Zap className="w-3 h-3 mr-1" />
                      Hitno
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-foreground text-balance leading-tight">
                  {job.adresa}, {job.grad}
                </h3>
              </div>
              <div className={cn(
                "flex flex-col items-end px-3 py-1.5 rounded-lg font-bold flex-shrink-0",
                job.hitno ? "bg-chart-4/10" : "bg-primary/10"
              )}>
                <div className={cn(
                  "flex items-center gap-1 text-lg",
                  job.hitno ? "text-chart-4" : "text-primary"
                )}>
                  <Euro className="w-4 h-4" />
                  {getFinalPrice(job.cijena, job.hitno || false).toFixed(2)}
                </div>
                {job.hitno && (
                  <span className="text-xs text-muted-foreground line-through">
                    {job.cijena.toFixed(2)} EUR
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {job.datum}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {job.vrijemeOd} - {job.vrijemeDo}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {job.grad}
              </span>
            </div>

            {/* Show cleaner info for owner - clickable to view profile */}
            {variant === "owner" && cleaner && job.status !== "OTVORENO" && (
              <div className="mb-3 p-3 rounded-lg bg-secondary/50 space-y-2">
                <button
                  type="button"
                  onClick={onViewCleanerProfile}
                  className="flex items-center gap-2 w-full text-left group/cleaner hover:bg-secondary/50 rounded-lg transition-colors"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover/cleaner:ring-primary/50 transition-all">
                    {cleaner.slika ? (
                      <AvatarImage src={cleaner.slika} alt={cleaner.ime} />
                    ) : (
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cleaner.email}`}
                        alt={cleaner.ime}
                      />
                    )}
                    <AvatarFallback>{cleaner.ime.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm flex-1">
                    <span className="text-muted-foreground">Čistač/ica: </span>
                    <span className="font-medium text-foreground group-hover/cleaner:text-primary transition-colors">
                      {cleaner.ime}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {cleanerLevel && (
                        <>
                          <Badge 
                            variant="outline" 
                            className={`text-xs gap-1 py-0 h-5 ${cleanerLevel.bgColor} ${cleanerLevel.color} ${cleanerLevel.borderColor}`}
                          >
                            {getLevelIcon(cleanerLevel.level)}
                            {cleanerLevel.label}
                          </Badge>
                          {cleanerLevel.verified && (
                            <Badge variant="outline" className="text-xs gap-1 py-0 h-5 bg-primary/10 text-primary border-primary/30">
                              <ShieldCheck className="w-3 h-3" />
                              Verified
                            </Badge>
                          )}
                        </>
                      )}
                      {/* Show rating and reviews count */}
                      {cleanerReviews.length > 0 && (
                        <Badge variant="secondary" className="text-xs gap-1 py-0 h-5">
                          <Star className="w-3 h-3 text-chart-4 fill-chart-4" />
                          {cleanerRating.toFixed(1)}
                          <span className="text-muted-foreground">({cleanerReviews.length})</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-primary font-medium group-hover/cleaner:underline transition-colors">
                      Pogledaj profil
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {cleanerReviews.length} recenzija
                    </span>
                  </div>
                </button>
                
                {/* Contact info - only visible after approval */}
                {(job.status === "ODOBRENO" || job.status === "U_TIJEKU" || job.status === "ČEKA_RECENZIJU" || job.status === "ZAVRŠENO") ? (
                  <div className="pt-2 border-t border-border/50 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span className="text-foreground">{cleaner.mobitel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span className="text-foreground">{cleaner.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Kontakt podaci vidljivi nakon odobrenja</span>
                    </div>
                  </div>
)}
            </div>
            )}

            {/* Show owner info for cleaner */}
            {variant === "cleaner" && owner && job.status !== "OTVORENO" && (
              <div className="mb-3 p-3 rounded-lg bg-secondary/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${owner.email}`}
                      alt={owner.ime}
                    />
                    <AvatarFallback>{owner.ime.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Vlasnik: </span>
                    <span className="font-medium text-foreground">{owner.ime}</span>
                  </div>
                </div>
                
                {/* Contact info - only visible after approval */}
                {(job.status === "ODOBRENO" || job.status === "U_TIJEKU" || job.status === "ČEKA_RECENZIJU" || job.status === "ZAVRŠENO") ? (
                  <div className="pt-2 border-t border-border/50 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span className="text-foreground">{owner.mobitel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span className="text-foreground">{owner.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Kontakt podaci vidljivi nakon odobrenja</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {job.opis && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {job.opis}
              </p>
            )}

            {/* Keywords */}
            {job.keywords && job.keywords.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {job.keywords.slice(0, 5).map((keyword, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="text-xs bg-muted text-muted-foreground hover:bg-muted/80"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}

            {/* Map toggle and display */}
            <div className="mb-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className="text-muted-foreground hover:text-foreground gap-2 p-0 h-auto"
              >
                <Map className="w-4 h-4" />
                {showMap ? "Sakrij mapu" : "Prikaži lokaciju na mapi"}
              </Button>
              {showMap && (
                <div className="mt-3">
                  <JobLocationMap lat={job.lat} lon={job.lon} />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              {/* Owner Actions */}
              {variant === "owner" && job.status === "OTVORENO" && onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Obriši
                </Button>
              )}

              {variant === "owner" && job.status === "ČEKA_ODOBRENJE" && (
                <>
                  {onApprove && (
                    <Button size="sm" onClick={onApprove}>
                      <Check className="w-4 h-4 mr-1.5" />
                      Odobri
                    </Button>
                  )}
                  {onReject && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onReject}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                      <X className="w-4 h-4 mr-1.5" />
                      Odbij
                    </Button>
                  )}
                </>
              )}

              {variant === "owner" && job.status === "ODOBRENO" && (
                <Badge variant="outline" className="bg-primary/5">
                  <Clock className="w-3 h-3 mr-1" />
                  Čeka se početak
                </Badge>
              )}

              {variant === "owner" && job.status === "U_TIJEKU" && (
                <Badge variant="outline" className="bg-chart-4/5 text-chart-4 border-chart-4/20">
                  <Clock className="w-3 h-3 mr-1" />
                  Posao u tijeku
                </Badge>
              )}

              {variant === "owner" && job.status === "ČEKA_RECENZIJU" && onReview && (
                <Button size="sm" onClick={onReview}>
                  <Star className="w-4 h-4 mr-1.5" />
                  Daj recenziju
                </Button>
              )}

              {/* Cleaner Actions */}
              {variant === "cleaner" && job.status === "OTVORENO" && (
                <>
                  {onView && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onView}
                      className="border-border/50"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      Detalji
                    </Button>
                  )}
                  {onRequest && (
                    <Button size="sm" onClick={onRequest}>
                      <Check className="w-4 h-4 mr-1.5" />
                      Prijavi se
                    </Button>
                  )}
                </>
              )}

              {variant === "cleaner" && job.status === "ČEKA_ODOBRENJE" && (
                <Badge variant="outline" className="bg-chart-4/5 text-chart-4 border-chart-4/20">
                  <Clock className="w-3 h-3 mr-1" />
                  Čeka se odobrenje vlasnika
                </Badge>
              )}

              {variant === "cleaner" && job.status === "ODOBRENO" && onStart && (
                <Button size="sm" onClick={onStart}>
                  <Play className="w-4 h-4 mr-1.5" />
                  Započni posao
                </Button>
              )}

              {variant === "cleaner" && job.status === "U_TIJEKU" && onComplete && (
                <Button size="sm" onClick={onComplete}>
                  <Check className="w-4 h-4 mr-1.5" />
                  Završi posao
                </Button>
              )}

              {variant === "cleaner" && job.status === "ČEKA_RECENZIJU" && (
                <Badge variant="outline" className="bg-chart-5/5 text-chart-5 border-chart-5/20">
                  <Star className="w-3 h-3 mr-1" />
                  Čeka se recenzija vlasnika
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
