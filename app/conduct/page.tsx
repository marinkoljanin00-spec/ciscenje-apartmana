import Link from 'next/link'

const t = {
  bg: '#0a0a0a',
  bgCard: '#141414',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  textDim: '#71717a',
  accent: '#10b981',
  border: '#27272a'
}

export default function ConductPage() {
  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text }}>
      {/* Header */}
      <header style={{ padding: '16px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: 24, fontWeight: 800, color: t.accent, textDecoration: 'none' }}>sjaj.hr</Link>
        <Link href="/" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 14 }}>← Natrag na početnu</Link>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 32 }}>Pravila ponašanja</h1>
        <p style={{ color: t.textMuted, marginBottom: 32 }}>Kodeks ponašanja za sve korisnike platforme sjaj.hr</p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>1. Standard izvrsnosti</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8, marginBottom: 16 }}>
            Čistači moraju održavati prosječnu ocjenu od minimalno <strong style={{ color: t.text }}>4.0 zvjezdice</strong>. Korisnici s nižom ocjenom bit će privremeno suspendirani dok ne poboljšaju kvalitetu usluge kroz dodatnu edukaciju.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>2. Nulta tolerancija na diskriminaciju</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Zabranjena je svaka vrsta diskriminacije na temelju rase, spola, vjere, nacionalnosti, seksualne orijentacije, invaliditeta ili bilo koje druge osobne karakteristike. Kršenje ovog pravila rezultira trajnim uklanjanjem s platforme.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>3. Rad izvan platforme</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Strogo je zabranjeno dogovaranje poslova izvan platforme sjaj.hr. Sva komunikacija i transakcije moraju se odvijati putem službene platforme kako bi se osigurala zaštita obje strane.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>4. Obveze čistača</h2>
          <ul style={{ color: t.textMuted, lineHeight: 2, paddingLeft: 24 }}>
            <li>Dolazak na vrijeme (max 15 min zakašnjenja)</li>
            <li>Profesionalno ponašanje i komunikacija</li>
            <li>Korištenje kvalitetnih sredstava za čišćenje</li>
            <li>Poštivanje privatnosti klijenta</li>
            <li>Prijava bilo kakve štete odmah</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>5. Obveze klijenata</h2>
          <ul style={{ color: t.textMuted, lineHeight: 2, paddingLeft: 24 }}>
            <li>Točan opis posla i stanja nekretnine</li>
            <li>Osiguranje pristupa nekretnini u dogovoreno vrijeme</li>
            <li>Poštovanje čistača kao profesionalca</li>
            <li>Pravodobno plaćanje nakon obavljenog posla</li>
            <li>Poštena i objektivna recenzija</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>6. Posljedice kršenja pravila</h2>
          <ul style={{ color: t.textMuted, lineHeight: 2, paddingLeft: 24 }}>
            <li><strong>Prvo kršenje:</strong> Upozorenje putem emaila</li>
            <li><strong>Drugo kršenje:</strong> Privremena suspenzija (7 dana)</li>
            <li><strong>Treće kršenje:</strong> Trajno uklanjanje s platforme</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>7. Prijava kršenja</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Ako ste svjedočili kršenju pravila ponašanja, molimo prijavite putem <Link href="/podrska" style={{ color: t.accent }}>stranice za podršku</Link>. Sve prijave se obrađuju povjerljivo.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${t.border}`, padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
          <Link href="/terms" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Uvjeti korištenja</Link>
          <Link href="/privacy" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Privatnost</Link>
          <Link href="/conduct" style={{ color: t.accent, textDecoration: 'none', fontSize: 13 }}>Pravila ponašanja</Link>
          <Link href="/podrska" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Podrška</Link>
        </div>
        <p style={{ color: t.textDim, fontSize: 12 }}>© 2026 sjaj.hr. Sva prava pridržana.</p>
      </footer>
    </div>
  )
}
