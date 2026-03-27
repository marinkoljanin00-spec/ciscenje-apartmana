"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Textarea } from "@/components/ui/textarea"
import { useAppStore, type UserType, type UserSpol } from "@/lib/store"
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  FileText, 
  CheckCircle2,
  Home,
  Star,
  Shield,
  Clock,
  Gift,
  BadgeCheck,
  Eye,
  EyeOff,
} from "lucide-react"
import Image from "next/image"

const SAVED_CREDENTIALS_KEY = "cleanup_saved_credentials"

export function AuthScreen() {
  const { login, register } = useAppStore()

  // Login state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false)

  // Register state
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [regIme, setRegIme] = useState("")
  const [regMobitel, setRegMobitel] = useState("")
  const [regTip, setRegTip] = useState<UserType>("vlasnik")
  const [regSpol, setRegSpol] = useState<UserSpol>("neodređeno")
  const [regOpis, setRegOpis] = useState("")
  const [regError, setRegError] = useState("")
  const [regSuccess, setRegSuccess] = useState("")

  // Load saved credentials on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_CREDENTIALS_KEY)
      if (saved) {
        const { email, password } = JSON.parse(saved)
        setLoginEmail(email)
        setLoginPassword(password)
        setRememberMe(true)
        setHasSavedCredentials(true)
      }
    } catch {
      // ignore
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    const success = login(loginEmail, loginPassword)
    if (success) {
      if (rememberMe) {
        localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify({ email: loginEmail, password: loginPassword }))
      } else {
        localStorage.removeItem(SAVED_CREDENTIALS_KEY)
      }
    } else {
      setLoginError("Pogrešni podaci za prijavu.")
    }
  }

  const handleForgetCredentials = () => {
    localStorage.removeItem(SAVED_CREDENTIALS_KEY)
    setLoginEmail("")
    setLoginPassword("")
    setRememberMe(false)
    setHasSavedCredentials(false)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setRegError("")
    setRegSuccess("")

    if (!regEmail || !regPassword || !regIme || !regMobitel) {
      setRegError("Molimo ispunite sva obavezna polja.")
      return
    }

    const success = register({
      email: regEmail,
      lozinka: regPassword,
      ime: regIme,
      mobitel: regMobitel,
      tip: regTip,
      spol: regSpol,
      opis: regOpis,
    })

    if (success) {
      setRegSuccess("Registracija uspješna!")
    } else {
      setRegError("Email je već zauzet.")
    }
  }

  const features = [
    {
      icon: Home,
      title: "500+ apartmana",
      description: "Aktivnih nekretnina u sustavu"
    },
    {
      icon: Star,
      title: "4.9 prosječna ocjena",
      description: "Zadovoljstvo korisnika"
    },
    {
      icon: Shield,
      title: "Verificirani čistači",
      description: "Provjereni profesionalci"
    },
    {
      icon: Clock,
      title: "Brza usluga",
      description: "Isti dan rezervacije"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Hero section */}
      <div className="relative lg:w-1/2 min-h-[40vh] lg:min-h-screen">
        <Image
          src="/images/hero-apartment.jpg"
          alt="Moderni apartman"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent lg:bg-gradient-to-r" />
        
        <div className="absolute inset-0 flex flex-col justify-end lg:justify-center p-6 lg:p-12">
          <div className="max-w-lg">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/30">
                <Image
                  src="/images/cleanup-logo.jpg"
                  alt="CLEANUP Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">CLEANUP</h2>
                <p className="text-sm text-muted-foreground">Profesionalno čišćenje</p>
              </div>
            </div>

            {/* Free trial banner */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">Prvih 60 dana BESPLATNO</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  100% sigurno, bez skrivenih troškova
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Profesionalno čišćenje apartmana
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground tracking-tight mb-4 text-balance">
              Vaš apartman zaslužuje profesionalnu njegu
            </h1>
            
            <p className="text-muted-foreground text-lg mb-8 hidden lg:block">
              Povezujemo vlasnike nekretnina s verificiranim čistačima. 
              Brzo, pouzdano i transparentno.
            </p>

            {/* Features grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{feature.title}</p>
                    <p className="text-muted-foreground text-xs">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
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
              Platforma za profesionalno čišćenje
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="gap-2">
                <Lock className="w-4 h-4" />
                Prijava
              </TabsTrigger>
              <TabsTrigger value="register" className="gap-2">
                <User className="w-4 h-4" />
                Registracija
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Dobrodošli natrag</CardTitle>
                  <CardDescription>
                    Prijavite se u svoj CLEANUP račun
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="vas@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Lozinka</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="********"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showLoginPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me + forget saved */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember-me"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                        />
                        <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                          Zapamti me
                        </Label>
                      </div>
                      {hasSavedCredentials && (
                        <button
                          type="button"
                          onClick={handleForgetCredentials}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Zaboravi podatke
                        </button>
                      )}
                    </div>

                    {loginError && (
                      <p className="text-sm text-destructive">{loginError}</p>
                    )}
                    <Button type="submit" className="w-full">
                      Uđi u sustav
                    </Button>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Demo računi</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setLoginEmail("demo@cleanup.hr")
                          setLoginPassword("demo123")
                        }}
                      >
                        <Home className="w-3 h-3 mr-1" />
                        Vlasnik
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setLoginEmail("cistac@cleanup.hr")
                          setLoginPassword("demo123")
                        }}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Čistač
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Kreiraj račun</CardTitle>
                  <CardDescription>
                    Pridružite se CLEANUP zajednici
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-ime">Ime</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="reg-ime"
                            placeholder="Vaše ime"
                            value={regIme}
                            onChange={(e) => setRegIme(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-mobitel">Mobitel</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="reg-mobitel"
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9\s]*"
                            placeholder="09x xxx xxxx"
                            value={regMobitel}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9\s]/g, "")
                              setRegMobitel(value)
                            }}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="vas@email.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Lozinka</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reg-password"
                          type={showRegPassword ? "text" : "password"}
                          placeholder="********"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showRegPassword ? "Sakrij lozinku" : "Prikaži lozinku"}
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-tip">Ja sam:</Label>
                      <Select
                        value={regTip}
                        onValueChange={(v) => setRegTip(v as UserType)}
                      >
                        <SelectTrigger id="reg-tip">
                          <SelectValue placeholder="Odaberi tip" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vlasnik">
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4" />
                              Vlasnik nekretnine
                            </div>
                          </SelectItem>
                          <SelectItem value="cistacica">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Čistač/ica
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-spol">Spol</Label>
                      <Select
                        value={regSpol}
                        onValueChange={(v) => setRegSpol(v as UserSpol)}
                      >
                        <SelectTrigger id="reg-spol">
                          <SelectValue placeholder="Odaberi spol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="muški">Muški</SelectItem>
                          <SelectItem value="ženski">Ženski</SelectItem>
                          <SelectItem value="neodređeno">Neodređeno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-opis">Opis / Biografija</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Textarea
                          id="reg-opis"
                          placeholder="Recite nešto o sebi..."
                          value={regOpis}
                          onChange={(e) => setRegOpis(e.target.value)}
                          className="pl-10 min-h-[80px]"
                        />
                      </div>
                    </div>
                    {regError && (
                      <p className="text-sm text-destructive">{regError}</p>
                    )}
                    {regSuccess && (
                      <p className="text-sm text-primary flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {regSuccess}
                      </p>
                    )}
                    <Button type="submit" className="w-full">
                      Kreiraj račun
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Trust badges */}
          <div className="mt-8 flex items-center justify-center gap-6 text-muted-foreground text-xs">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-primary" />
              <span>SSL zaštita</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>GDPR sukladnost</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
