"use client"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TermsOfServiceProps {
  onBack: () => void
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Nazad
        </Button>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-3xl">Uvjeti korištenja (Terms of Service)</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Zadnja ažuriranja: {new Date().toLocaleDateString('hr-HR')}</p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            {/* 1. Prihvaćanje Uvjeta */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">1. Prihvaćanje Uvjeta</h3>
              <p>
                Korištenjem platforme TvojČistač ("Platforma") pristajete na sve uvjete i odredbe ovdje navedene. Ako se ne slažete s bilo kojom od navedenih odredbi, molimo vas da ne koristite Platformu. Vaš neprekidni pristup Platformi predstavlja vašu prihvaćenost svih ažuriranja uvjeta.
              </p>
            </section>

            {/* 2. Opis Službe */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">2. Opis Službe</h3>
              <p>
                TvojČistač je online platforma koja povezuje vlasnike stambenih ili poslovnih prostora ("Vlasnici") s osobama koje pružaju usluge čišćenja ("Čistači"). Platforma olakšava komunikaciju, dogovor i obračun usluga između korisnika. Platforma nije zaposlenik niti pružateljem usluga čišćenja - ona je samo intermedijar.
              </p>
            </section>

            {/* 3. Registracija i Račun */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">3. Registracija i Račun</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Morate biti stariji od 18 godina kako biste se registrirali</li>
                <li>Potrebno je dati točne, cjelovite i aktualne informacije</li>
                <li>Odgovorate za čuvanje lozinke i sve aktivnosti na vašem računu</li>
                <li>TvojČistač nije odgovorna za neovlašteni pristup vašem računu</li>
                <li>Morate odmah obavijestiti TvojČistač o neovlaštenom korištenju računa</li>
              </ul>
            </section>

            {/* 2. Opis Službe */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">2. Opis Službe</h3>
              <p>
                TvojČistač je online platforma koja povezuje vlasnike stambenih ili poslovnih prostora ("Vlasnici") s osobama koje pružaju usluge čišćenja ("Čistači"). Platforma olakšava komunikaciju, dogovor i obračun usluga između korisnika. Platforma nije zaposlenik niti pružateljem usluga čišćenja - ona je samo intermedijar.
              </p>
            </section>

            {/* 3. Registracija i Račun */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">3. Registracija i Račun</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Morate biti stariji od 18 godina kako biste se registrirali</li>
                <li>Potrebno je dati točne, cjelovite i aktualne informacije</li>
                <li>Odgovorate za čuvanje lozinke i sve aktivnosti na vašem računu</li>
                <li>TvojČistač nije odgovorna za neovlašteni pristup vašem računu</li>
                <li>Morate odmah obavijestiti TvojČistač o neovlaštenom korištenju računa</li>
              </ul>
            </section>

            {/* 4. Ponašanje Korisnika */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">4. Ponašanje Korisnika</h3>
              <p className="font-semibold">Ne smijete:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Koristiti lažne ili obmanjujuće podatke</li>
                <li>Haranguizirati, prijetiti ili zlostavljati druge korisnike</li>
                <li>Objavljivati sadržaj koji je nezakonit, opskuran ili nasilne prirode</li>
                <li>Koristiti Platformu u komercijalne svrhe bez dozvole</li>
                <li>Pokušavati zaobići sigurnosne mjere Platforme</li>
                <li>Koristiti bots, skripte ili automatizaciju bez dozvole</li>
              </ul>
            </section>

            {/* 5. Vlasništvo Intelektualnog Svojstva */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">5. Vlasništvo Intelektualnog Svojstva</h3>
              <p>
                Sav sadržaj na Platformi, uključujući logo, dizajn, kod i tekst, jest vlasništvo TvojČistač ili njenih licencijatora. Zabranjeno je kopirati, reproducirati ili distribuirati sadržaj bez pisane dozvole.
              </p>
            </section>

            {/* 6. Odgovornost za Usluge */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">6. Odgovornost za Usluge</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>TvojČistač je samo intermedijar i nije odgovorna za kvalitetu usluga</li>
                <li>Vlasnici i Čistači su odgovorna za svoje interakcije i dogovore</li>
                <li>TvojČistač preporučuje potpisivanje pisanih sporazuma prije početka posla</li>
                <li>Sporovi između korisnika trebali bi biti razriješeni bez sudjelovanja TvojČistač</li>
              </ul>
            </section>

            {/* 7. Odgovornost i Ograničenja */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">7. Odgovornost i Ograničenja</h3>
              <p>
                TvojČistač nije odgovorna za: (a) indirektne, slučajne ili posljedične štete; (b) gubitke podataka; (c) prekid rada Platforme; (d) štete nastale korištenjem Platforme. TvojČistač ne daje nikakva jamstva vezana uz točnost, pouzdanost ili dostupnost Platforme.
              </p>
            </section>

            {/* 8. Naknade i Provizije */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">8. Naknade i Provizije</h3>
              <p>
                Korištenje platforme TvojČistač trenutno je <strong>potpuno besplatno</strong> za sve korisnike — kako za klijente tako i za čistače.
              </p>
              <p>
                U slučaju uvođenja bilo kakve naknade ili promjene uvjeta korištenja, svi registrirani korisnici bit će pravovremeno obaviješteni putem e-mail adrese kojom su se registrirali, prije nego što promjene stupe na snagu.
              </p>
            </section>

            {/* 9. Sigurnost i Zaštita */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">9. Sigurnost i Zaštita</h3>
              <p>
                Preporučujemo da korisnici provode razumnu provjeru prije angažiranja čistačkog servisa. TvojČistač preporučuje potpisivanje ugovora o osiguranju i provođenje provjere背景ung za sve čistače prije dozvoljavanje pristupa vašem prostoru.
              </p>
            </section>

            {/* 10. Prekid i Suspenzija */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">10. Prekid i Suspenzija</h3>
              <p>
                TvojČistač zadržava pravo suspenzije ili brisanja računa bez najave ako korisnik krši ove uvjete. Korisnici mogu zatražiti povraćaj podataka u roku od 30 dana od brisanja računa.
              </p>
            </section>

            {/* 11. Nadležnost i Zakonodavstvo */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">11. Nadležnost i Zakonodavstvo</h3>
              <p>
                Ovi uvjeti pokoravaju se zakonima Republike Hrvatske. Sve spore trebat će se razriješiti pred nadležnim sudom u Republici Hrvatskoj.
              </p>
            </section>

            {/* 12. Kontakt */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">12. Kontakt</h3>
              <p>
                Za pitanja ili prigovore vezane uz ove uvjete, kontaktirajte nas na: <span className="font-semibold">tvojcistac.info@gmail.com</span>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
