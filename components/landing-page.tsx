'use client'
import { useState, useEffect } from 'react'
import { t, cardStyle, btnPrimary, btnSecondary } from './shared'
import { useCountUp } from '@/hooks/useCountUp'

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE - Dark Emerald with Background Image - Single Screen
// ═══════════════════════════════════════════════════════════════
export function LandingPage({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  const [platformStats, setPlatformStats] = useState({
    totalClients: 0,
    totalCleaners: 0,
    avgRating: 5.0
  })

  const clientsEnd = platformStats.totalClients ? parseInt(String(platformStats.totalClients)) + 20 : 0
  const cleanersEnd = platformStats.totalCleaners ? parseInt(String(platformStats.totalCleaners)) + 20 : 0
  const ratingEnd = platformStats.avgRating > 0 ? platformStats.avgRating : 5.0

  const { count: clientsCount, ref: clientsRef } = useCountUp({ end: clientsEnd, duration: 2500, decimals: 0, suffix: '+' })
  const { count: cleanersCount, ref: cleanersRef } = useCountUp({ end: cleanersEnd, duration: 2500, decimals: 0, suffix: '+' })
  const { count: ratingCount, ref: ratingRef } = useCountUp({ end: ratingEnd, duration: 2000, decimals: 1, suffix: '' })

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setPlatformStats(d))
      .catch(() => {})
  }, [])

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: t.bg,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Background Image with Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(/hero-interior.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.15,
        zIndex: 0
      }} />
      
      {/* Gradient Overlays */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(180deg, ${t.bg} 0%, transparent 30%, transparent 60%, ${t.bg} 100%)`,
        zIndex: 1
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '50%',
        bottom: 0,
        background: `linear-gradient(90deg, ${t.bg} 0%, transparent 100%)`,
        zIndex: 1
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Navbar */}
        <nav style={{ 
          padding: 'clamp(12px, 4vw, 20px) clamp(16px, 4vw, 32px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${t.border}`,
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 42, 
              height: 42, 
              background: `linear-gradient(135deg, ${t.accent} 0%, #059669 100%)`, 
              borderRadius: 10, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: `0 0 20px ${t.accentGlow}`
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 24, color: t.text, letterSpacing: -0.5 }}>TvojČistač</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onLogin} style={btnSecondary}>Prijava</button>
            <button onClick={onRegister} style={btnPrimary}>Registracija</button>
          </div>
        </nav>

        {/* Main Content - All on one screen */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            
            {/* Hero Text */}
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ 
                display: 'inline-block', 
                padding: '8px 16px', 
                background: t.accentGlow, 
                border: `1px solid ${t.accent}`,
                borderRadius: 100,
                marginBottom: 24 
              }}>
                <span style={{ color: t.accent, fontSize: 13, fontWeight: 600 }}>PROFESIONALNO ČIŠĆENJE NA ZAHTJEV</span>
              </div>
              
              <h1 style={{ 
                fontSize: 'clamp(40px, 7vw, 72px)', 
                fontWeight: 800, 
                color: t.text, 
                lineHeight: 1.1, 
                margin: '0 0 20px 0', 
                letterSpacing: -2 
              }}>
                Čist dom.<br/>
                <span style={{ color: t.accent }}>Sretan život.</span>
              </h1>
              
              <p style={{ 
                fontSize: 'clamp(16px, 2vw, 20px)', 
                color: t.textMuted, 
                lineHeight: 1.6, 
                margin: '0 auto 32px', 
                maxWidth: 500 
              }}>
                Pronađi pouzdane profesionalce ili ponudi svoje usluge. Jednostavno, brzo i sigurno.
              </p>
              
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48 }}>
                <button onClick={onRegister} style={{ ...btnPrimary, padding: '16px 32px', fontSize: 16 }}>
                  Započni besplatno
                </button>
                <button onClick={onLogin} style={{ ...btnSecondary, padding: '16px 32px', fontSize: 16 }}>
                  Prijavi se
                </button>
              </div>
            </div>

            {/* Steps - 3 Columns */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: 20,
              marginBottom: 48
            }}>
              {[
                { num: '01', icon: '📝', title: 'Objavi posao', desc: 'Opiši što treba očistiti, postavi lokaciju i cijenu.' },
                { num: '02', icon: '👥', title: 'Primi prijave', desc: 'Verificirani čistači se prijavljuju na tvoj posao.' },
                { num: '03', icon: '✨', title: 'Uživaj u čistoći', desc: 'Odaberi najboljeg i uživaj u blistavom domu.' }
              ].map((step, i) => (
                <div key={i} style={{ 
                  ...cardStyle, 
                  padding: 28,
                  background: `linear-gradient(180deg, ${t.card} 0%, ${t.bgCard} 100%)`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    fontSize: 48, 
                    fontWeight: 900, 
                    color: t.accent, 
                    opacity: 0.15,
                    lineHeight: 1 
                  }}>{step.num}</div>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{step.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 8px 0' }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: t.textMuted, margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 'clamp(24px, 6vw, 48px)',
              flexWrap: 'wrap'
            }}>
              <div ref={clientsRef} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: t.accent, marginBottom: 4 }}>{clientsEnd > 0 ? clientsCount : '-'}</div>
                <div style={{ fontSize: 13, color: t.textDim, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>Klijenata</div>
              </div>
              <div ref={cleanersRef} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: t.accent, marginBottom: 4 }}>{cleanersEnd > 0 ? cleanersCount : '-'}</div>
                <div style={{ fontSize: 13, color: t.textDim, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>Čistača</div>
              </div>
              <div ref={ratingRef} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: t.accent, marginBottom: 4 }}>{ratingCount}</div>
                <div style={{ fontSize: 13, color: t.textDim, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>Ocjena</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ 
          padding: 'clamp(16px, 4vw, 24px) clamp(16px, 4vw, 32px)', 
          borderTop: `1px solid ${t.border}`,
          background: t.bgCard
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: t.accent }}>TvojČistač</div>
              <div style={{ color: t.textDim, fontSize: 12 }}>Tvoj dom, naša briga.</div>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="/terms" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Uvjeti korištenja</a>
              <a href="/privacy" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Privatnost</a>
              <a href="/conduct" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Pravila ponašanja</a>
              <a href="/podrska" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Podrška</a>
            </div>
          </div>
          <div style={{ maxWidth: 1200, margin: '16px auto 0', paddingTop: 16, borderTop: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <a href="mailto:tvojcistac.info@gmail.com" style={{ color: t.accent, textDecoration: 'none', fontSize: 13 }}>tvojcistac.info@gmail.com</a>
            <span style={{ color: t.textDim, fontSize: 12 }}>© 2026 TvojČistač. Sva prava pridržana.</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
