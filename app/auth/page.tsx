"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

export default function AuthPage() {
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)

  const [loginError, setLoginError] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [isLoginPending, setIsLoginPending] = useState(false)
  const [isRegisterPending, setIsRegisterPending] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoginPending(true)
    setLoginError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        window.location.href = "/dashboard"
      } else {
        setLoginError(data.error || "Greška pri prijavi.")
        setIsLoginPending(false)
      }
    } catch {
      setLoginError("Nije moguće spojiti se na server.")
      setIsLoginPending(false)
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsRegisterPending(true)
    setRegisterError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        window.location.href = "/dashboard"
      } else {
        setRegisterError(data.error || "Greška pri registraciji.")
        setIsRegisterPending(false)
      }
    } catch {
      setRegisterError("Nije moguće spojiti se na server.")
      setIsRegisterPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Sjaj Čistoće</h1>
          <p className="text-muted-foreground mt-1">Prijavite se ili registrirajte</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Prijava</TabsTrigger>
            <TabsTrigger value="register">Registracija</TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Prijava</CardTitle>
                <CardDescription>Unesite svoje podatke za prijavu</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="vas@email.com"
                        className="pl-10"
                        required
                        disabled={isLoginPending}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Lozinka</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="********"
                        className="pl-10 pr-10"
                        required
                        disabled={isLoginPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showLoginPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {loginError}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoginPending}>
                    {isLoginPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Prijava u tijeku...
                      </>
                    ) : (
                      "Prijavi se"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REGISTER */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Registracija</CardTitle>
                <CardDescription>Kreirajte novi korisnički račun</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        name="email"
                        type="email"
                        placeholder="vas@email.com"
                        className="pl-10"
                        required
                        disabled={isRegisterPending}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Lozinka</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-password"
                        name="password"
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Najmanje 6 znakova"
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                        disabled={isRegisterPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showRegPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Potvrdi lozinku</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-confirm"
                        name="confirmPassword"
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Ponovite lozinku"
                        className="pl-10"
                        required
                        minLength={6}
                        disabled={isRegisterPending}
                      />
                    </div>
                  </div>

                  {registerError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {registerError}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isRegisterPending}>
                    {isRegisterPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registracija u tijeku...
                      </>
                    ) : (
                      "Registriraj se"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
