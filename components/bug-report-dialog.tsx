"use client"

import { useState } from "react"
import { useAppStore, type BugReportPriority } from "@/lib/store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bug, Send, AlertTriangle, AlertCircle, Info } from "lucide-react"

interface BugReportDialogProps {
  children?: React.ReactNode
}

export function BugReportDialog({ children }: BugReportDialogProps) {
  const { user, submitBugReport } = useAppStore()
  const [open, setOpen] = useState(false)
  const [naslov, setNaslov] = useState("")
  const [opis, setOpis] = useState("")
  const [prioritet, setPrioritet] = useState<BugReportPriority>("srednja")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!naslov || !opis || !user) return

    submitBugReport({
      korisnik: user.email,
      naslov,
      opis,
      prioritet,
    })

    setSubmitted(true)
    setTimeout(() => {
      setOpen(false)
      setSubmitted(false)
      setNaslov("")
      setOpis("")
      setPrioritet("srednja")
    }, 2000)
  }

  const prioritetConfig = {
    niska: { label: "Niska", icon: Info, color: "text-muted-foreground", bg: "bg-muted" },
    srednja: { label: "Srednja", icon: AlertCircle, color: "text-chart-4", bg: "bg-chart-4/10" },
    visoka: { label: "Visoka", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Bug className="w-4 h-4" />
            Prijavi problem
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-primary" />
            Prijavi nedostatak
          </DialogTitle>
          <DialogDescription>
            Pomozite nam poboljšati aplikaciju prijavom problema ili prijedloga.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Hvala na prijavi!</h3>
            <p className="text-muted-foreground">
              Vaša prijava je zaprimljena i bit će pregledana u najkraćem mogućem roku.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="naslov">Naslov problema</Label>
              <Input
                id="naslov"
                placeholder="Kratki opis problema"
                value={naslov}
                onChange={(e) => setNaslov(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioritet">Prioritet</Label>
              <Select value={prioritet} onValueChange={(v) => setPrioritet(v as BugReportPriority)}>
                <SelectTrigger id="prioritet">
                  <SelectValue placeholder="Odaberite prioritet" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(prioritetConfig) as BugReportPriority[]).map((key) => {
                    const config = prioritetConfig[key]
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className={`w-4 h-4 ${config.color}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opis">Detaljan opis</Label>
              <Textarea
                id="opis"
                placeholder="Opišite problem detaljno - što ste radili, što se dogodilo, što ste očekivali..."
                value={opis}
                onChange={(e) => setOpis(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Prijava će biti poslana s vašeg računa: <strong>{user?.email}</strong>
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Odustani
              </Button>
              <Button type="submit" className="flex-1 gap-2">
                <Send className="w-4 h-4" />
                Pošalji prijavu
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
