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

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text }}>
      {/* Header */}
      <header style={{ padding: '16px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: 24, fontWeight: 800, color: t.accent, textDecoration: 'none' }}>sjaj.hr</Link>
        <Link href="/" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 14 }}>← Natrag na početnu</Link>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 32 }}>Uvjeti korištenja</h1>
        <p style={{ color: t.textMuted, marginBottom: 32 }}>Zadnje ažuriranje: 1. travnja 2026.</p>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>1. Opći uvjeti</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Korištenjem platforme sjaj.hr prihvaćate ove uvjete korištenja u cijelosti. Platforma služi kao posrednik između klijenata koji traže usluge čišćenja i profesionalnih čistača koji te usluge nude.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>2. Registracija i račun</h2>
          <ul style={{ color: t.textMuted, lineHeight: 2, paddingLeft: 24 }}>
            <li>Morate imati najmanje 18 godina za korištenje platforme</li>
            <li>Odgovorni ste za točnost podataka koje unosite</li>
            <li>Vaša lozinka mora ostati povjerljiva</li>
            <li>Jedan korisnik smije imati samo jedan račun</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>3. Plaćanje i naknade</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Cijene usluga određuju klijenti prilikom objave posla. Platforma ne naplaćuje proviziju. Plaćanje se vrši direktno između klijenta i čistača nakon obavljenog posla.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>4. Odgovornost</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Sjaj.hr djeluje isključivo kao posrednik i ne preuzima odgovornost za kvalitetu obavljenih usluga, štetu nastalu tijekom čišćenja ili sporove između korisnika.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>5. Nadležnost suda</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Za sve sporove proizašle iz korištenja platforme nadležan je Općinski sud u Splitu. Primjenjuje se hrvatsko pravo.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: t.accent }}>6. Kontakt</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Za sva pitanja vezana uz uvjete korištenja obratite nam se putem <Link href="/podrska" style={{ color: t.accent }}>stranice za podršku</Link>.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${t.border}`, padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
          <Link href="/terms" style={{ color: t.accent, textDecoration: 'none', fontSize: 13 }}>Uvjeti korištenja</Link>
          <Link href="/privacy" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Privatnost</Link>
          <Link href="/conduct" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Pravila ponašanja</Link>
          <Link href="/podrska" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Podrška</Link>
        </div>
        <p style={{ color: t.textDim, fontSize: 12 }}>© 2026 sjaj.hr. Sva prava pridržana.</p>
      </footer>
    </div>
  )
}
