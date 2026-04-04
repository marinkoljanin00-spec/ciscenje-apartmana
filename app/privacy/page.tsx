'use client'

import Link from 'next/link'

const t = { bg: '#050505', card: '#111111', border: '#1f1f1f', text: '#ffffff', textMuted: '#a3a3a3', accent: '#10b981' }

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text }}>
      <header style={{ padding: '20px 32px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 24, color: t.text, textDecoration: 'none' }}>TvojČistač</Link>
        <Link href="/" style={{ color: t.accent, textDecoration: 'none', fontSize: 14 }}>← Povratak</Link>
      </header>
      
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 32 }}>Politika privatnosti</h1>
        
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>1. Prikupljanje podataka</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Prikupljamo samo podatke potrebne za funkcioniranje platforme: ime, email, broj telefona i lokaciju poslova. Podatke o plaćanju ne pohranjujemo.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>2. Korištenje podataka</h2>
          <ul style={{ color: t.textMuted, lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Povezivanje klijenata s čistačima</li>
            <li>Slanje obavijesti o statusu poslova</li>
            <li>Poboljšanje korisničkog iskustva</li>
            <li>Sprječavanje zlouporabe platforme</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>3. GDPR sukladnost</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            U skladu s GDPR uredbom, imate pravo na pristup, ispravak i brisanje svojih podataka. Za sve zahtjeve kontaktirajte nas putem stranice podrške.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>4. Pravo na zaborav</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Možete zatražiti potpuno brisanje svih vaših podataka. Zahtjev će biti obrađen u roku od 30 dana.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>5. Sigurnost podataka</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Svi podaci su enkriptirani i pohranjeni na sigurnim serverima unutar EU. Lozinke su hashirane bcrypt algoritmom.
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
