'use client'

import Link from 'next/link'

const t = { bg: '#050505', card: '#111111', border: '#1f1f1f', text: '#ffffff', textMuted: '#a3a3a3', accent: '#10b981' }

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text }}>
      <header style={{ padding: '20px 32px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 24, color: t.text, textDecoration: 'none' }}>TvojČistač</Link>
        <Link href="/" style={{ color: t.accent, textDecoration: 'none', fontSize: 14 }}>← Povratak</Link>
      </header>
      
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 32 }}>Uvjeti korištenja</h1>
        
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>1. Opće odredbe</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            TvojČistač je platforma koja povezuje klijente s profesionalnim čistačima. Korištenjem naše platforme prihvaćate ove uvjete u cijelosti.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>2. Obveze korisnika</h2>
          <ul style={{ color: t.textMuted, lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Dati točne i istinite podatke pri registraciji</li>
            <li>Ne koristiti platformu za nezakonite aktivnosti</li>
            <li>Poštivati dogovorene termine i cijene</li>
            <li>Komunicirati s poštovanjem prema drugim korisnicima</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>3. Plaćanje i provizija</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Platforma uzima proviziju od 10% na svaki završeni posao. Plaćanje se vrši direktno između klijenta i čistača. TvojČistač ne odgovara za eventualne nesporazume oko plaćanja.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>4. Odgovornost</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            TvojČistač djeluje isključivo kao posrednik. Ne snosimo odgovornost za kvalitetu usluge, štetu nastalu tijekom čišćenja ili bilo kakve sporove između korisnika.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>5. Nadležnost</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Za sve sporove nadležan je sud u Splitu. Primjenjuje se hrvatsko pravo.
          </p>
        </section>

        <p style={{ color: t.textMuted, fontSize: 13, marginTop: 48 }}>Zadnje ažuriranje: Siječanj 2026.</p>
      </main>

      <footer style={{ padding: '24px 32px', borderTop: `1px solid ${t.border}`, textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <Link href="/terms" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Uvjeti korištenja</Link>
          <Link href="/privacy" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Privatnost</Link>
          <Link href="/conduct" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Pravila ponašanja</Link>
          <Link href="/podrska" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Podrška</Link>
        </div>
        <p style={{ color: '#737373', fontSize: 12, margin: 0 }}>© 2026 TvojČistač. Sva prava pridržana.</p>
      </footer>
    </div>
  )
}
