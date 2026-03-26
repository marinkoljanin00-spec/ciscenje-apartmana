"use client"

import { useAppStore, type User, type Job, getCleanerLevel, getLevelProgress } from "@/lib/store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Phone, Mail, Briefcase, MessageSquare, Award, Lock, ShieldCheck, Trophy, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CleanerProfileDialogProps {
  cleaner: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentJob?: Job | null // The job context from which the profile was opened
}

export function CleanerProfileDialog({
  cleaner,
  open,
  onOpenChange,
  currentJob,
}: CleanerProfileDialogProps) {
  const { getCleanerReviews, getAverageRating, jobs } = useAppStore()

  if (!cleaner) return null

  const reviews = getCleanerReviews(cleaner.email)
  const averageRating = getAverageRating(cleaner.email)
  const completedJobs = jobs.filter(
    (j) => j.cistacica === cleaner.email && j.status === "ZAVRŠENO"
  ).length

  // Contact info is only visible if current job is approved or beyond
  const showContactInfo = currentJob && (
    currentJob.status === "ODOBRENO" || 
    currentJob.status === "U_TIJEKU" || 
    currentJob.status === "ČEKA_RECENZIJU" || 
    currentJob.status === "ZAVRŠENO"
  )

  // Calculate cleaner level
  const levelInfo = getCleanerLevel(completedJobs, averageRating)
  const levelProgress = getLevelProgress(completedJobs, averageRating)

  const getLevelIcon = () => {
    switch (levelInfo.level) {
      case "elite":
        return <Trophy className="w-4 h-4" />
      case "pro":
        return <ShieldCheck className="w-4 h-4" />
      default:
        return <TrendingUp className="w-4 h-4" />
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-chart-4 fill-chart-4" : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] p-0 gap-0 overflow-hidden">
        {/* Header with avatar */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 pb-8">
          <DialogHeader className="items-center text-center">
            <Avatar className="w-24 h-24 border-4 border-background shadow-xl mb-4">
              {cleaner.slika ? (
                <AvatarImage src={cleaner.slika} alt={cleaner.ime} />
              ) : (
                <AvatarImage 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cleaner.email}`}
                  alt={cleaner.ime}
                />
              )}
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {getInitials(cleaner.ime)}
              </AvatarFallback>
            </Avatar>
            <DialogTitle className="text-2xl">{cleaner.ime}</DialogTitle>
            
            {/* Level and Verified Badge */}
            <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
              <Badge 
                variant="outline" 
                className={`gap-1.5 ${levelInfo.bgColor} ${levelInfo.color} ${levelInfo.borderColor}`}
              >
                {getLevelIcon()}
                {levelInfo.label}
              </Badge>
              {levelInfo.verified && (
                <Badge variant="outline" className="gap-1.5 bg-primary/10 text-primary border-primary/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Clean
                </Badge>
              )}
            </div>
            
            <p className="text-muted-foreground mt-2">{cleaner.opis}</p>
            
            {/* Rating badge */}
            {reviews.length > 0 ? (
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                  <Star className="w-4 h-4 text-chart-4 fill-chart-4" />
                  <span className="font-bold">{averageRating.toFixed(1)}</span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({reviews.length} {reviews.length === 1 ? "recenzija" : "recenzija"})
                </span>
              </div>
            ) : (
              <Badge variant="outline" className="mt-3">
                Novi čistač
              </Badge>
            )}
          </DialogHeader>
        </div>

        <div className="p-6 pt-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <Briefcase className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{completedJobs}</p>
                <p className="text-xs text-muted-foreground">Završeno</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <Star className="w-5 h-5 text-chart-4 mx-auto mb-1" />
                <p className="text-xl font-bold">
                  {reviews.length > 0 ? averageRating.toFixed(1) : "-"}
                </p>
                <p className="text-xs text-muted-foreground">Ocjena</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <Award className="w-5 h-5 text-chart-2 mx-auto mb-1" />
                <p className="text-xl font-bold">{reviews.length}</p>
                <p className="text-xs text-muted-foreground">Recenzije</p>
              </CardContent>
            </Card>
          </div>

          {/* Level Progress (if not elite) */}
          {levelProgress.nextLevel && (
            <Card className="border-border/50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Napredak do {levelProgress.nextLevel.label}</span>
                  <Badge variant="outline" className={`${levelProgress.nextLevel.bgColor} ${levelProgress.nextLevel.color} ${levelProgress.nextLevel.borderColor}`}>
                    {levelProgress.nextLevel.label}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Završeni poslovi</span>
                      <span>{completedJobs} / {levelProgress.nextLevel.minJobs}</span>
                    </div>
                    <Progress value={levelProgress.jobsProgress} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Prosječna ocjena</span>
                      <span>{averageRating > 0 ? averageRating.toFixed(1) : "0.0"} / {levelProgress.nextLevel.minRating}</span>
                    </div>
                    <Progress value={levelProgress.ratingProgress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact info */}
          <div className="flex flex-wrap gap-3 mb-6">
            {showContactInfo ? (
              <>
                <Badge variant="outline" className="gap-1.5 py-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {cleaner.email}
                </Badge>
                <Badge variant="outline" className="gap-1.5 py-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {cleaner.mobitel}
                </Badge>
              </>
            ) : (
              <Badge variant="outline" className="gap-1.5 py-1.5 text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
                Kontakt podaci vidljivi nakon odobrenja ponude
              </Badge>
            )}
          </div>

          {/* Reviews section */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Recenzije
            </h3>
            
            {reviews.length === 0 ? (
              <Card className="border-border/50 border-dashed">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Ovaj čistač još nema recenzija.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Budite prvi koji će ostaviti recenziju!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-3">
                  {reviews.map((review) => {
                    const job = jobs.find((j) => j.id === review.oglas_id)
                    return (
                      <Card key={review.id} className="border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              {renderStars(review.ocjena)}
                              <p className="text-xs text-muted-foreground mt-1">
                                {job?.adresa ? `${job.adresa}, ${job.grad}` : "Nepoznata adresa"}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {review.datum}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">
                            {review.komentar}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
