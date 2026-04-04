'use client'
import { useState } from 'react'
import { t, cardStyle, btnPrimary, inputStyle, selectStyle, CROATIAN_CITIES, User } from './shared'

// ═══════════════════════════════════════════════════════════════
// AUTH PAGE - Dark Emerald Theme
// ═══════════════════════════════════════════════════════════════
export function AuthPage({ mode, setMode, onLogin, onBack }: { mode: 'login' | 'register'; setMode: (m: 'login' | 'register') => void; onLogin: (u: User) => void; onBack: () => void }) {
  const [role, setRole] = useState<'client' | 'cleaner'>('client')
  const [email, setEmail] = useState(''); const [pass, setPass] = useState(''); const [name, setName] = useState(''); const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Zagreb')
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true)
    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = mode === 'login' ? { email, password: pass } : { email, password: pass, fullName: name, role, phone, city: role === 'client' ? city : null }
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.success && data.user) onLogin(data.user)
      else { setErr(data.error || 'Doslo je do greske'); setLoading(false) }
    } catch { setErr('Mrezna greska'); setLoading(false) }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: t.bg, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 24,
      position: 'relative'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 600,
        background: `radial-gradient(circle, ${t.accentGlow} 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <button onClick={onBack} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          marginBottom: 32, 
          background: 'none', 
          border: 'none', 
          color: t.textMuted, 
          fontSize: 14, 
          fontWeight: 500, 
          cursor: 'pointer' 
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Natrag
        </button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ 
            display: 'inline-flex', 
            width: 56, 
            height: 56, 
            background: `linear-gradient(135deg, ${t.accent} 0%, #059669 100%)`, 
            borderRadius: 14, 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: `0 0 30px ${t.accentGlow}`
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: t.text, margin: '0 0 8px 0' }}>sjaj.hr</h1>
          <p style={{ color: t.textMuted, fontSize: 15, margin: 0 }}>{mode === 'login' ? 'Dobrodosli natrag!' : 'Kreirajte novi racun'}</p>
        </div>

        <div style={{ ...cardStyle, padding: 28 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: 24, background: t.bgCard, borderRadius: 10, padding: 4 }}>
            {(['login', 'register'] as const).map(x => (
              <button key={x} onClick={() => { setMode(x); setErr('') }} style={{ 
                flex: 1, 
                padding: '12px 0', 
                border: 'none', 
                borderRadius: 8,
                background: mode === x ? t.accent : 'transparent', 
                color: mode === x ? '#000' : t.textMuted, 
                fontWeight: 600, 
                fontSize: 14, 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                {x === 'login' ? 'Prijava' : 'Registracija'}
              </button>
            ))}
          </div>

          {err && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${t.urgent}`, padding: 14, marginBottom: 20, borderRadius: 10, color: t.urgent, fontWeight: 500, fontSize: 14 }}>{err}</div>}

          <form onSubmit={submit}>
            {mode === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: t.textMuted }}>Ime i prezime</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ivan Horvat" style={inputStyle} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: t.textMuted }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vas@email.com" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: t.textMuted }}>Lozinka</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} required minLength={6} placeholder="Min. 6 znakova" style={inputStyle} />
            </div>
            {mode === 'register' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: t.textMuted }}>Mobitel</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+385 91 234 5678" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 10, color: t.textMuted }}>Registriram se kao:</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {(['client', 'cleaner'] as const).map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)} style={{ 
                        flex: 1, 
                        padding: 14, 
                        border: `1px solid ${role === r ? t.accent : t.border}`, 
                        borderRadius: 10,
                        background: role === r ? t.accentGlow : 'transparent', 
                        color: role === r ? t.accent : t.textMuted, 
                        fontWeight: 600, 
                        fontSize: 14, 
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}>
                        {r === 'client' ? 'Klijent' : 'Čistač'}
                      </button>
                    ))}
                  </div>
                </div>
                {role === 'client' && (
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: t.textMuted }}>Grad</label>
                    <select value={city} onChange={e => setCity(e.target.value)} style={selectStyle}>
                      {CROATIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
              </>
            )}
            <button type="submit" disabled={loading} style={{ ...btnPrimary, width: '100%', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Pricekajte...' : mode === 'login' ? 'Prijavi se' : 'Registriraj se'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
