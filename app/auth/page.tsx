"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
  Sparkles, 
  Lock, 
  Mail, 
  Eye,
  EyeOff,
  Loader2,
  Home,
  Star,
  Shield,
  Clock,
  Gift,
} from "lucide-react"
import Image from "next/image"
import { loginUser, registerUser } from "@/lib/auth-actions"

export default function AuthPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Login state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Register state
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirmPassword, setRegConfirmPassword] = useState("")
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [regError, setRegError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    startTransition(async () => {
      const result = await loginUser(loginEmail, loginPassword)
      
      if (result.success) {
        router.push("/")
        router.refresh()
      } else {
        setLoginError(result.error || "Pogrešni podaci za prijavu.")
      }
    })
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setRegError("")
    setRegSuccess("")

    if (!regEmail || !regPassword) {
      setRegError("Molimo ispunite sva polja.")
      return
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Lozinke se ne podudaraju.")
      return
    }

    if (regPassword.length < 6) {
      setRegError("Lozinka mora imati najmanje 6 znakova.")
      return
    }

    startTransition(async () => {
      try {
        const result = await registerUser(regEmail, regPassword)
        // If we get here (no redirect), it means an error occurred
        if (result?.error) {
          setRegError(result.error)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Nepoznata greška"
        setRegError(`Server greška: ${errorMessage}`)
      }
    })
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
                  alt="sjaj.hr Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">sjaj.hr</h2>
                <p className="text-sm text-muted-foreground">Vaš apartman zaslužuje sjaj</p>
              </div>
            </div>

            {/* Free trial banner */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">Prvih 30 dana BESPLATNO</p>
                <p className="text-sm text-muted-foreground">
                  Uživaj u svim funkcijama potpuno besplatno.
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
            <div className="relative inline-flex w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/30 mb-4 lg:hidden">
              <Image
                src="/images/cleanup-logo.jpg"
                alt="sjaj.hr Logo"
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              sjaj.hr
            </h2>
            <p className="text-muted-foreground mt-1">
              Prijavi se ili kreiraj račun
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="gap-2">
                <Lock className="w-4 h-4" />
                Prijava
              </TabsTrigger>
              <TabsTrigger value="register" className="gap-2">
                <Mail className="w-4 h-4" />
                Registracija
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Dobrodošli natrag</CardTitle>
                  <CardDescription>
                    Prijavite se u svoj sjaj.hr račun
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
                          disabled={isPending}
                          required
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
                          disabled={isPending}
                          required
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

                    {loginError && (
                      <p className="text-sm text-destructive">{loginError}</p>
                    )}
                    
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? (
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
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Kreiraj račun</CardTitle>
                  <CardDescription>
                    Pridružite se sjaj.hr zajednici
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
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
                          disabled={isPending}
                          required
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
                          placeholder="Najmanje 6 znakova"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="pl-10 pr-10"
                          disabled={isPending}
                          required
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
                      <Label htmlFor="reg-confirm-password">Potvrdi lozinku</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reg-confirm-password"
                          type={showRegPassword ? "text" : "password"}
                          placeholder="Ponovite lozinku"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="pl-10"
                          disabled={isPending}
                          required
                        />
                      </div>
                    </div>

                    {regError && (
                      <p className="text-sm text-destructive">{regError}</p>
                    )}
                    
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? (
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
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Registracijom prihvaćate naše uvjete korištenja i politiku privatnosti.
          </p>
        </div>
      </div>
    </div>
  )
}
