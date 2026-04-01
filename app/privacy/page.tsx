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

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text }}>
      {/* Header */}
      <header style={{ padding: '16px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: 24, fontWeight: 800, color: t.accent, textDecoration: 'none' }}>sjaj.hr</Link>
        <Link href="/" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 14 }}>← Natrag na početnu</Link>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 32 }}>Politika privatnosti</h1>
        <p style={{ color: t.textMuted, marginBottom: 32 }}>Zadnje ažuriranje: 1. travnja 2026.</p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>1. Prikupljanje podataka</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8, marginBottom: 16 }}>Prikupljamo sljedeće osobne podatke:</p>
          <ul style={{ color: t.textMuted, lineHeight: 2, paddingLeft: 24 }}>
            <li>Ime i prezime</li>
            <li>Email adresa</li>
            <li>Broj telefona (opcionalno)</li>
            <li>Lokacija nekretnine (za objavu poslova)</li>
            <li>Povijesni podaci o poslovima i recenzijama</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>2. Svrha obrade</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Vaše podatke koristimo isključivo za pružanje usluga platforme: povezivanje klijenata s čistačima, prikazivanje recenzija, kontaktiranje u vezi s poslovima i poboljšanje korisničkog iskustva.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>3. GDPR sukladnost</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8, marginBottom: 16 }}>U skladu s GDPR regulativom imate pravo na:</p>
          <ul style={{ color: t.textMuted, lineHeight: 2, paddingLeft: 24 }}>
            <li><strong>Pristup</strong> - zatražiti kopiju svojih podataka</li>
            <li><strong>Ispravak</strong> - zatražiti ispravak netočnih podataka</li>
            <li><strong>Brisanje</strong> - zatražiti brisanje svih vaših podataka (pravo na zaborav)</li>
            <li><strong>Prenosivost</strong> - zatražiti prijenos podataka drugom pružatelju</li>
            <li><strong>Prigovor</strong> - uložiti prigovor na obradu vaših podataka</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>4. Sigurnost podataka</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Svi podaci su zaštićeni enkripcijom u prijenosu (TLS/SSL) i u mirovanju. Lozinke su hashirane korištenjem bcrypt algoritma. Pristup bazi podataka ograničen je samo na ovlaštene administratore.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>5. Kolačići</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Koristimo samo nužne kolačiće za funkcioniranje platforme. Ne koristimo kolačiće za praćenje ili oglašavanje.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>6. Kontakt za privatnost</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Za sva pitanja vezana uz privatnost i zahtjeve za pristup/brisanje podataka obratite nam se putem <Link href="/podrska" style={{ color: t.accent }}>stranice za podršku</Link>.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${t.border}`, padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
          <Link href="/terms" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Uvjeti korištenja</Link>
          <Link href="/privacy" style={{ color: t.accent, textDecoration: 'none', fontSize: 13 }}>Privatnost</Link>
          <Link href="/conduct" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Pravila ponašanja</Link>
          <Link href="/podrska" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Podrška</Link>
        </div>
        <p style={{ color: t.textDim, fontSize: 12 }}>© 2026 sjaj.hr. Sva prava pridržana.</p>
      </footer>
    </div>
  )
}
