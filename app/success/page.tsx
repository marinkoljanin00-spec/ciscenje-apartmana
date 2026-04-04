import Link from "next/link"
import { CheckCircle2, Home, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Registracija uspješna!</CardTitle>
          <CardDescription>
            Vaš račun je uspješno kreiran. Sada možete pristupiti svim funkcijama TvojČistač platforme.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Vaši podaci su sigurno spremljeni u bazu podataka.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Idi na početnu
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth">
                <ArrowRight className="mr-2 h-4 w-4" />
                Prijavi se
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
