"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Lock, Mail, Eye, EyeOff, Loader2, User, Briefcase, Sparkles, AlertCircle } from "lucide-react"

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
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        window.location.href = "/"
      } else {
        setLoginError(result.error || "Greška pri prijavi")
        setIsLoginPending(false)
      }
    } catch {
      setLoginError("Mrežna greška. Pokušajte ponovno.")
      setIsLoginPending(false)
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsRegisterPending(true)
    setRegisterError("")
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          fullName: formData.get("fullName"),
          role: formData.get("role"),
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        window.location.href = "/"
      } else {
        setRegisterError(result.error || "Greška pri registraciji")
        setIsRegisterPending(false)
      }
    } catch {
      setRegisterError("Mrežna greška. Pokušajte ponovno.")
      setIsRegisterPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Marketplace Čišćenja</h1>
          <p className="text-muted-foreground mt-2">Pronađite ili ponudite usluge čišćenja</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Prijava</TabsTrigger>
            <TabsTrigger value="register">Registracija</TabsTrigger>
          </TabsList>

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
                        Prijava...
                      </>
                    ) : (
                      "Prijavi se"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Registracija</CardTitle>
                <CardDescription>Kreirajte novi račun</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Ime i prezime</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-name"
                        name="fullName"
                        type="text"
                        placeholder="Ivan Horvat"
                        className="pl-10"
                        required
                        disabled={isRegisterPending}
                      />
                    </div>
                  </div>

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
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Ja sam</Label>
                    <RadioGroup name="role" defaultValue="client" className="grid grid-cols-2 gap-4">
                      <div>
                        <RadioGroupItem value="client" id="role-client" className="peer sr-only" />
                        <Label
                          htmlFor="role-client"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <Briefcase className="mb-3 h-6 w-6" />
                          <span className="text-sm font-medium">Klijent</span>
                          <span className="text-xs text-muted-foreground">Tražim čistača</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="cleaner" id="role-cleaner" className="peer sr-only" />
                        <Label
                          htmlFor="role-cleaner"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <Sparkles className="mb-3 h-6 w-6" />
                          <span className="text-sm font-medium">Čistač</span>
                          <span className="text-xs text-muted-foreground">Nudim usluge</span>
                        </Label>
                      </div>
                    </RadioGroup>
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
                        Registracija...
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
