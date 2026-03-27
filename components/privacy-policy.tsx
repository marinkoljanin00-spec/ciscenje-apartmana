"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PrivacyPolicyProps {
  onBack: () => void
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
            <CardTitle className="text-3xl">Politika Privatnosti (Privacy Policy)</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Zadnja ažuriranja: {new Date().toLocaleDateString('hr-HR')}</p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            {/* 1. Uvod */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">1. Uvod</h3>
              <p>
                CLEANUP ("mi", "nas", "naša") posvećena je zaštiti vaše privatnosti. Ova politika objašnjava kako prikupljamo, koristimo, dijeljenje i štitimo vaše osobne podatke u skladu s GDPR-om i lokalnim zakonima.
              </p>
            </section>

            {/* 2. Podaci Koje Prikupljamo */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">2. Podaci Koje Prikupljamo</h3>
              <p className="font-semibold">Podatke prikupljamo kroz sljedeće kanale:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Registracija:</strong> Ime, email, telefonski broj, adresa, spol (opcionalno)</li>
                <li><strong>Usluge:</strong> Informacije o poslovima, lokaciji, vrsti čišćenja, cijene</li>
                <li><strong>Platni podaci:</strong> Informacije o transakcijama (bez pohrane detaljnih kartičnih podataka)</li>
                <li><strong>Komunikacija:</strong> Poruke između korisnika, recenzije i ocjene</li>
                <li><strong>Tehnički podaci:</strong> IP adresa, tip uređaja, preglednik, cookies</li>
                <li><strong>Fotografie:</strong> Profilne fotografije koje ste učitali</li>
              </ul>
            </section>

            {/* 3. Kako Koristimo Vaše Podatke */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">3. Kako Koristimo Vaše Podatke</h3>
              <p>Vaše podatke koristimo za:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Pružanje i poboljšanje naših usluga</li>
                <li>Olakšavanje komunikacije između korisnika</li>
                <li>Obrada plaćanja i naplate provizija</li>
                <li>Sprječavanje prijevara i zlouporabe</li>
                <li>Poštovanje zakonskih obveza</li>
                <li>Slanje obavijesti i ažuriranja (samo ako ste pristali)</li>
                <li>Analitika i poboljšanje korisničkog iskustva</li>
              </ul>
            </section>

            {/* 4. Deljenje Podataka */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">4. Deljenje Podataka s Trećim Stranama</h3>
              <p>
                Vaše podatke ne prodajemo trećim stranama. Podaci se dijele samo u sljedećim slučajevima:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Sa Vlasnikom ili Čistačem kada obavljate poslove</li>
                <li>Sa davatelja plaćanja (za obradu transakcija)</li>
                <li>Sa dobavljačima usluga koji nam pomažu (hosting, analitika)</li>
                <li>Kada je potrebno po zakonu ili za zaštitu naših prava</li>
              </ul>
            </section>

            {/* 5. Sigurnost Podataka */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">5. Sigurnost Podataka</h3>
              <p>
                Koristimo tehničke i organizacijske mjere za zaštitu vaših podataka, uključujući: enkriptaciju, sigurne servere, ograničeni pristup. Međutim, ni jedne mjere nisu 100% sigurne. Niste odgovorna za sigurnost podataka koji se prenositi preko interneta.
              </p>
            </section>

            {/* 6. Vaša Prava */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">6. Vaša Prava pod GDPR-om</h3>
              <p>Imate pravo na:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Pristup:</strong> Zahtijevati pristup vašim osobnim podacima</li>
                <li><strong>Ispravak:</strong> Zahtijevati ispravljanje netočnih podataka</li>
                <li><strong>Brisanje:</strong> Zahtijevati brisanje vaših podataka ("pravo na zaboravljanje")</li>
                <li><strong>Ograničenje:</strong> Zahtijevati ograničenje obrade podataka</li>
                <li><strong>Prenosivost:</strong> Zahtijevati prenos podataka drugoj organizaciji</li>
                <li><strong>Prigovor:</strong> Prigovoriti obradi podataka</li>
              </ul>
              <p>Za ostvarivanje ovih prava, kontaktirajte nas na: <span className="font-semibold">admin@cleanup.hr</span></p>
            </section>

            {/* 7. Cookies */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">7. Cookies i Praćenje</h3>
              <p>
                Koristimo cookies za: održavanje sesije, pamćenje preferenci, analitiku. Cookies su male datoteke pohranjena na vašem uređaju. Većina preglednika omogućava vam brisanje cookies-a kroz postavke. Neke funkcionalnosti platforme mogu biti onemogućene bez cookies-a.
              </p>
              <p className="mt-2"><strong>Vrste cookies-a:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Nužne:</strong> Za rad platforme (login, sigurnost)</li>
                <li><strong>Analitika:</strong> Za praćenje korištenja Platforme</li>
                <li><strong>Preference:</strong> Za pamćenje vaših izbora (tema, jezik)</li>
              </ul>
            </section>

            {/* 8. Retenција Podataka */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">8. Koliko Dugo Čuvamo Podatke</h3>
              <p>
                Vaše podatke čuvamo dok je vaš račun aktivan ili dok je potrebno za pružanje usluga. Nakon brisanja računa, određeni podaci se čuvaju za razloge: porezna zakondavstva (3 godine), pravilnog rješavanja sporova (1 godina), sprječavanja zlouporabe. Možete zatražiti brisanje prije isteka roka u skladu s GDPR-om.
              </p>
            </section>

            {/* 9. Kontakt Davalca */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">9. Kontakt</h3>
              <p>
                Za pitanja vezana uz vašu privatnost ili da prijavite kršenje, kontaktirajte nas na: <span className="font-semibold">admin@cleanup.hr</span>
              </p>
            </section>

            {/* 10. Promjene */}
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">10. Promjene Politike</h3>
              <p>
                Zadržavamo pravo ažuriranja ove politike. Važne promjene bit će vam prijavljene email-om. Nastavljeni pristup Platformi znači prihvaćanje novih uvjeta.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
