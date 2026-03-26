"use client"

import { useState, useEffect } from "react"
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
import { useAppStore } from "@/lib/store"
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, Shield } from "lucide-react"
import Image from "next/image"

export function EmailVerification() {
  const { user, verifyEmail, resendVerificationCode, logout } = useAppStore()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showCode, setShowCode] = useState(true)
  const [countdown, setCountdown] = useState(0)
  const [currentCode, setCurrentCode] = useState(user?.verifikacijskiKod || "")

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (code.length !== 6) {
      setError("Kod mora imati 6 znamenki.")
      return
    }

    const verified = verifyEmail(code)
    if (verified) {
      setSuccess(true)
    } else {
      setError("Pogrešan verifikacijski kod. Pokušajte ponovo.")
    }
  }

  const handleResend = () => {
    const newCode = resendVerificationCode()
    setCurrentCode(newCode)
    setCountdown(60)
    setError("")
    setCode("")
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Email verificiran!</CardTitle>
            <CardDescription>
              Vaš email je uspješno verificiran. Sada ćete primati sve obavijesti na vrijeme.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground text-sm mb-4">
              Stranica će se automatski osvježiti...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative inline-flex w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/30 mb-4">
            <Image
              src="/images/cleanup-logo.jpg"
              alt="CLEANUP Logo"
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            CLEANUP
          </h2>
          <p className="text-muted-foreground mt-1">
            Verifikacija email adrese
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="text-center">Potvrdite email</CardTitle>
            <CardDescription className="text-center">
              Poslali smo verifikacijski kod na<br />
              <span className="font-medium text-foreground">{user?.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Demo: Show the code */}
            {showCode && currentCode && (
              <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Demo način</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  U pravoj aplikaciji kod bi stigao na vaš email. Za demo, kod je:
                </p>
                <p className="text-2xl font-mono font-bold text-center text-foreground tracking-wider">
                  {currentCode}
                </p>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verifikacijski kod</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setCode(value)
                  }}
                  className="text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={code.length !== 6}>
                <Shield className="w-4 h-4 mr-2" />
                Verificiraj email
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Niste primili kod?
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={countdown > 0}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${countdown > 0 ? "" : ""}`} />
                {countdown > 0 
                  ? `Pošalji ponovo za ${countdown}s` 
                  : "Pošalji novi kod"
                }
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full gap-2 text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Odjavi se i vrati na prijavu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info text */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          Verifikacija emaila osigurava da primite sve važne obavijesti 
          o vašim poslovima i rezervacijama.
        </p>
      </div>
    </div>
  )
}
