'use client'

import Link from 'next/link'

const t = { bg: '#050505', card: '#111111', border: '#1f1f1f', text: '#ffffff', textMuted: '#a3a3a3', accent: '#10b981', urgent: '#ef4444' }

export default function ConductPage() {
  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text }}>
      <header style={{ padding: '20px 32px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 24, color: t.text, textDecoration: 'none' }}>sjaj.hr</Link>
        <Link href="/" style={{ color: t.accent, textDecoration: 'none', fontSize: 14 }}>← Povratak</Link>
      </header>
      
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 32 }}>Pravila ponašanja</h1>
        
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>1. Standard izvrsnosti</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Čistači s prosječnom ocjenom ispod 4.0 mogu biti suspendirani s platforme. Očekujemo profesionalno ponašanje i kvalitetnu uslugu.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>2. Nulta tolerancija na diskriminaciju</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Zabranjena je svaka vrsta diskriminacije na temelju rase, spola, religije, nacionalnosti ili bilo koje druge osobne karakteristike. Prekršitelji će biti trajno uklonjeni.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>3. Zabrana rada izvan platforme</h2>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${t.urgent}`, padding: 16, borderRadius: 10, marginBottom: 16 }}>
            <p style={{ color: t.urgent, lineHeight: 1.8, margin: 0 }}>
              <strong>Upozorenje:</strong> Dogovaranje poslova izvan platforme rezultira trajnom suspenzijom oba korisnika.
            </p>
          </div>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Svi poslovi moraju biti dogovoreni i evidentirani kroz sjaj.hr platformu. Ovo osigurava sigurnost i zaštitu za sve strane.
          </p>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>4. Poštivanje dogovorenog</h2>
          <ul style={{ color: t.textMuted, lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Dolazak na vrijeme (max 15 min kašnjenja)</li>
            <li>Obavljanje posla prema opisu</li>
            <li>Korištenje odgovarajuće opreme</li>
            <li>Prijava bilo kakvih problema odmah</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: t.accent, marginBottom: 16 }}>5. Sustav upozorenja</h2>
          <p style={{ color: t.textMuted, lineHeight: 1.8 }}>
            Prvo kršenje: Upozorenje<br/>
            Drugo kršenje: Privremena suspenzija (7 dana)<br/>
            Treće kršenje: Trajna suspenzija
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
        <p style={{ color: '#737373', fontSize: 12, margin: 0 }}>© 2026 sjaj.hr. Sva prava pridržana.</p>
      </footer>
    </div>
  )
}
