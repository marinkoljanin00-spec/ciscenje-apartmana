'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

type User = { id: number; email: string; role: 'client' | 'cleaner' }
type Job = { id: number; title: string; location: string; price: number; status: string; created_at: string; cleaner_id?: number; cleaner_name?: string }

// Premium Dark Emerald Theme
const t = {
  bg: '#050505',
  bgGradient: 'linear-gradient(180deg, #050505 0%, #0a0f0d 100%)',
  card: '#0d0d0d',
  cardHover: '#141414',
  input: '#1a1a1a',
  border: '#262626',
  borderHover: '#404040',
  text: '#ffffff',
  textMuted: '#a3a3a3',
  textDim: '#737373',
  emerald: '#10b981',
  emeraldHover: '#059669',
  emeraldDark: '#064e3b',
  emeraldGlow: 'rgba(16, 185, 129, 0.15)',
  emeraldGlowStrong: 'rgba(16, 185, 129, 0.25)',
  yellow: '#fbbf24',
  blue: '#3b82f6',
  red: '#ef4444',
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard'>('landing')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [userRole, setUserRole] = useState<'client' | 'cleaner' | null>(null)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    const role = localStorage.getItem('user_role') as 'client' | 'cleaner' | null
    const name = localStorage.getItem('user_email') || ''
    const id = localStorage.getItem('user_id') || ''
    if (role && id) { setUserRole(role); setUserName(name); setUserId(id); setView('dashboard') }
    setMounted(true)
  }, [])

  const login = (u: User) => {
    localStorage.setItem('user_role', u.role)
    localStorage.setItem('user_id', u.id.toString())
    localStorage.setItem('user_email', u.email)
    setUserRole(u.role); setUserName(u.email); setUserId(u.id.toString()); setView('dashboard')
  }

  const logout = () => {
    localStorage.clear()
    setUserRole(null); setUserName(''); setUserId(''); setJobs([]); setView('landing')
  }

  const goToAuth = (mode: 'login' | 'register') => { setAuthMode(mode); setView('auth') }

  if (!mounted) return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.emerald, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (view === 'landing') return <LandingPage onLogin={() => goToAuth('login')} onRegister={() => goToAuth('register')} />
  if (view === 'auth') return <AuthPage mode={authMode} setMode={setAuthMode} onLogin={login} onBack={() => setView('landing')} />
  if (userRole === 'client') return <ClientDash logout={logout} jobs={jobs} setJobs={setJobs} name={userName} uid={userId} />
  if (userRole === 'cleaner') return <CleanerDash logout={logout} name={userName} uid={userId} />
  return null
}

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════
function LandingPage({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${t.emerald} 0%, ${t.emeraldHover} 100%)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 20px ${t.emeraldGlow}` }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 22, color: t.text, letterSpacing: -0.5 }}>sjaj<span style={{ color: t.emerald }}>.hr</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onLogin} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = t.emerald} onMouseOut={e => e.currentTarget.style.borderColor = t.border}>Prijava</button>
            <button onClick={onRegister} style={{ padding: '10px 20px', background: t.emerald, border: 'none', borderRadius: 10, color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 4px 20px ${t.emeraldGlow}` }} onMouseOver={e => e.currentTarget.style.background = t.emeraldHover} onMouseOut={e => e.currentTarget.style.background = t.emerald}>Registracija</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: 120, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: `radial-gradient(ellipse at center, ${t.emeraldGlow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* Left Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: t.emeraldGlow, border: `1px solid ${t.emeraldDark}`, borderRadius: 100, marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, background: t.emerald, borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              <span style={{ color: t.emerald, fontSize: 13, fontWeight: 600 }}>500+ zadovoljnih klijenata</span>
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
            
            <h1 style={{ fontSize: 56, fontWeight: 800, color: t.text, lineHeight: 1.1, margin: '0 0 24px 0', letterSpacing: -2 }}>
              Cist dom,<br/><span style={{ background: `linear-gradient(135deg, ${t.emerald} 0%, #34d399 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>sretan zivot.</span>
            </h1>
            
            <p style={{ fontSize: 18, color: t.textMuted, lineHeight: 1.7, margin: '0 0 40px 0', maxWidth: 480 }}>
              Pronadi pouzdane profesionalce za ciscenje ili ponudi svoje usluge. Brzo, sigurno i transparentno.
            </p>
            
            <div style={{ display: 'flex', gap: 16, marginBottom: 48 }}>
              <button onClick={onRegister} style={{ padding: '16px 32px', background: `linear-gradient(135deg, ${t.emerald} 0%, ${t.emeraldHover} 100%)`, border: 'none', borderRadius: 14, color: '#000', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 30px ${t.emeraldGlowStrong}`, transition: 'all 0.3s' }}>
                Zapocni besplatno
              </button>
              <button onClick={onLogin} style={{ padding: '16px 32px', background: 'transparent', border: `2px solid ${t.border}`, borderRadius: 14, color: t.text, fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                Prijavi se
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40 }}>
              {[{ n: '500+', l: 'Klijenata' }, { n: '100+', l: 'Cistaca' }, { n: '4.9', l: 'Ocjena' }].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: t.text }}>{s.n}</div>
                  <div style={{ fontSize: 14, color: t.textDim }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Image */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px ${t.border}` }}>
              <Image src="/hero-clean-home.jpg" alt="Cisti dom" width={600} height={450} style={{ width: '100%', height: 'auto', display: 'block' }} />
              {/* Overlay gradient */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top, rgba(5,5,5,0.9), transparent)' }} />
              {/* Floating card */}
              <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, background: 'rgba(13,13,13,0.9)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: 20, border: `1px solid ${t.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, background: t.emeraldGlow, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.emerald} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <div style={{ color: t.text, fontWeight: 600, fontSize: 15 }}>Garancija kvalitete</div>
                    <div style={{ color: t.textDim, fontSize: 13 }}>100% zadovoljstvo ili povrat novca</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative glow */}
            <div style={{ position: 'absolute', top: -20, right: -20, width: 200, height: 200, background: `radial-gradient(circle, ${t.emeraldGlow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', background: t.card }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: t.text, margin: '0 0 16px 0', letterSpacing: -1 }}>Zasto sjaj.hr?</h2>
            <p style={{ fontSize: 18, color: t.textMuted, maxWidth: 500, margin: '0 auto' }}>Jednostavno povezi klijente s profesionalcima za ciscenje</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Verificirani cistaci', desc: 'Svi nasi profesionalci prolaze strogu provjeru i verifikaciju.' },
              { icon: 'M12 2v20m10-10H2', title: 'Transparentne cijene', desc: 'Jasne cijene bez skrivenih troskova. Placate samo ono sto vidite.' },
              { icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3', title: 'Garancija kvalitete', desc: 'Niste zadovoljni? Vracamo novac bez pitanja.' }
            ].map((f, i) => (
              <div key={i} style={{ background: t.bg, borderRadius: 20, padding: 32, border: `1px solid ${t.border}`, transition: 'all 0.3s' }}>
                <div style={{ width: 56, height: 56, background: t.emeraldGlow, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={t.emerald} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon}/></svg>
                </div>
                <h3 style={{ color: t.text, fontSize: 20, fontWeight: 700, margin: '0 0 12px 0' }}>{f.title}</h3>
                <p style={{ color: t.textMuted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, ${t.emeraldGlow} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontSize: 44, fontWeight: 800, color: t.text, margin: '0 0 20px 0', letterSpacing: -1 }}>Spreman za sjaj?</h2>
          <p style={{ fontSize: 18, color: t.textMuted, marginBottom: 40 }}>Pridruzi se stotinama zadovoljnih korisnika vec danas.</p>
          <button onClick={onRegister} style={{ padding: '18px 48px', background: `linear-gradient(135deg, ${t.emerald} 0%, ${t.emeraldHover} 100%)`, border: 'none', borderRadius: 14, color: '#000', fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 40px ${t.emeraldGlowStrong}` }}>
            Kreiraj racun besplatno
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${t.border}`, padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: t.text }}>sjaj<span style={{ color: t.emerald }}>.hr</span></span>
          </div>
          <p style={{ color: t.textDim, fontSize: 14 }}>2026 sjaj.hr. Sva prava pridrzana.</p>
        </div>
      </footer>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// AUTH PAGE
// ═══════════════════════════════════════════════════════════════
function AuthPage({ mode, setMode, onLogin, onBack }: { mode: 'login' | 'register'; setMode: (m: 'login' | 'register') => void; onLogin: (u: User) => void; onBack: () => void }) {
  const [role, setRole] = useState<'client' | 'cleaner'>('client')
  const [email, setEmail] = useState(''); const [pass, setPass] = useState(''); const [name, setName] = useState('')
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true)
    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = mode === 'login' ? { email, password: pass } : { email, password: pass, fullName: name, role }
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.success && data.user) onLogin(data.user)
      else { setErr(data.error || 'Doslo je do greske'); setLoading(false) }
    } catch { setErr('Mrezna greska. Pokusajte ponovno.'); setLoading(false) }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '14px 16px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 12, color: t.text, fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }

  return (
    <div style={{ minHeight: '100vh', background: t.bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Back button */}
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, background: 'none', border: 'none', color: t.textMuted, fontSize: 14, cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
          Natrag na pocetnu
        </button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, background: `linear-gradient(135deg, ${t.emerald} 0%, ${t.emeraldHover} 100%)`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 32px ${t.emeraldGlow}` }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontSize: 28, fontWeight: 800, color: t.text }}>sjaj<span style={{ color: t.emerald }}>.hr</span></span>
          </div>
          <p style={{ color: t.textMuted, fontSize: 15 }}>{mode === 'login' ? 'Dobrodosli natrag!' : 'Kreirajte novi racun'}</p>
        </div>

        {/* Card */}
        <div style={{ background: t.card, borderRadius: 24, border: `1px solid ${t.border}`, padding: 32, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: t.input, borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {(['login', 'register'] as const).map(x => (
              <button key={x} onClick={() => { setMode(x); setErr('') }} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', background: mode === x ? t.emerald : 'transparent', color: mode === x ? '#000' : t.textMuted, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                {x === 'login' ? 'Prijava' : 'Registracija'}
              </button>
            ))}
          </div>

          {err && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 14, marginBottom: 20, color: t.red, fontSize: 14 }}>{err}</div>}

          <form onSubmit={submit}>
            {mode === 'register' && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', color: t.textMuted, fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Ime i prezime</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ivan Horvat" style={inp} />
              </div>
            )}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', color: t.textMuted, fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Email adresa</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vas@email.com" style={inp} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: t.textMuted, fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Lozinka</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} required minLength={6} placeholder="Minimalno 6 znakova" style={inp} />
            </div>
            {mode === 'register' && (
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', color: t.textMuted, fontSize: 13, marginBottom: 12, fontWeight: 500 }}>Registriram se kao:</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {(['client', 'cleaner'] as const).map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)} style={{ flex: 1, padding: 16, borderRadius: 12, border: `2px solid ${role === r ? t.emerald : t.border}`, background: role === r ? t.emeraldGlow : 'transparent', color: role === r ? t.emerald : t.textMuted, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {r === 'client' ? 'Klijent' : 'Cistac'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 16, background: loading ? t.emeraldDark : `linear-gradient(135deg, ${t.emerald} 0%, ${t.emeraldHover} 100%)`, border: 'none', borderRadius: 12, color: '#000', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : `0 8px 32px ${t.emeraldGlow}` }}>
              {loading ? 'Ucitavanje...' : mode === 'login' ? 'Prijavi se' : 'Kreiraj racun'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: t.textDim, fontSize: 13 }}>2026 sjaj.hr. Sva prava pridrzana.</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CLIENT DASHBOARD
// ═══════════════════════════════════════════════════════════════
function ClientDash({ logout, jobs, setJobs, name, uid }: { logout: () => void; jobs: Job[]; setJobs: (j: Job[]) => void; name: string; uid: string }) {
  const [tab, setTab] = useState<'jobs' | 'profile'>('jobs')
  const [title, setTitle] = useState(''); const [loc, setLoc] = useState(''); const [price, setPrice] = useState('')
  const [err, setErr] = useState(''); const [ok, setOk] = useState(''); const [sub, setSub] = useState(false)
  const [phone, setPhone] = useState(''); const [desc, setDesc] = useState(''); const [saving, setSaving] = useState(false); const [pMsg, setPMsg] = useState('')

  useEffect(() => { if (uid) fetch(`/api/jobs?role=client&userId=${uid}`).then(r => r.json()).then(d => setJobs(d.jobs || [])).catch(() => {}) }, [uid, setJobs])
  useEffect(() => { if (uid) fetch(`/api/profile?userId=${uid}`).then(r => r.json()).then(d => { if (d.user) { setPhone(d.user.phone || ''); setDesc(d.user.description || '') }}).catch(() => {}) }, [uid])

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setOk(''); setSub(true)
    try {
      const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, location: loc, price: parseFloat(price), userId: uid }) })
      const d = await res.json()
      if (d.success) { setJobs([{ id: d.job?.id || Date.now(), title, location: loc, price: parseFloat(price), status: 'open', created_at: new Date().toISOString() }, ...jobs]); setTitle(''); setLoc(''); setPrice(''); setOk('Posao uspjesno objavljen!'); setTimeout(() => setOk(''), 4000) }
      else setErr(d.error || 'Greska pri objavi')
    } catch { setErr('Mrezna greska') }
    setSub(false)
  }

  const confirm = async (id: number) => {
    try { const res = await fetch('/api/jobs/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId: id, userId: uid }) }); const d = await res.json(); if (d.success) setJobs(jobs.map(j => j.id === id ? { ...j, status: 'confirmed' } : j)) } catch {}
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setPMsg('')
    try { const res = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, phone, description: desc }) }); const d = await res.json(); setPMsg(d.success ? 'Profil spremljen!' : 'Greska') } catch { setPMsg('Mrezna greska') }
    setSaving(false)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
  const badge = (s: string, cn?: string) => {
    const m: Record<string, { bg: string; c: string; l: string }> = { open: { bg: t.emeraldGlow, c: t.emerald, l: 'Otvoren' }, waiting_for_client: { bg: 'rgba(251,191,36,0.15)', c: t.yellow, l: cn ? `Ceka potvrdu - ${cn}` : 'Ceka potvrdu' }, confirmed: { bg: 'rgba(59,130,246,0.15)', c: t.blue, l: 'Potvrdeno' } }
    const x = m[s] || m.open
    return <span style={{ padding: '6px 14px', borderRadius: 20, background: x.bg, color: x.c, fontSize: 12, fontWeight: 600 }}>{x.l}</span>
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <header style={{ borderBottom: `1px solid ${t.border}`, background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${t.emerald} 0%, ${t.emeraldHover} 100%)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 700, color: t.text, fontSize: 18 }}>sjaj<span style={{ color: t.emerald }}>.hr</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: t.textMuted, fontSize: 14 }}>{name}</span>
            <button onClick={logout} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, color: t.textMuted, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.borderColor = t.red; e.currentTarget.style.color = t.red }} onMouseOut={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted }}>Odjava</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {(['jobs', 'profile'] as const).map(x => (
            <button key={x} onClick={() => setTab(x)} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: tab === x ? t.emerald : t.card, color: tab === x ? '#000' : t.textMuted, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              {x === 'jobs' ? 'Moji Poslovi' : 'Profil'}
            </button>
          ))}
        </div>

        {tab === 'jobs' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
            <div style={{ background: t.card, borderRadius: 20, border: `1px solid ${t.border}`, padding: 28 }}>
              <h2 style={{ color: t.text, fontSize: 20, fontWeight: 700, margin: '0 0 24px 0' }}>Objavi novi posao</h2>
              {ok && <div style={{ background: t.emeraldGlow, border: `1px solid ${t.emerald}`, borderRadius: 12, padding: 14, marginBottom: 20, color: t.emerald, fontSize: 14, fontWeight: 500 }}>{ok}</div>}
              {err && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 14, marginBottom: 20, color: t.red, fontSize: 14 }}>{err}</div>}
              <form onSubmit={create}>
                <div style={{ marginBottom: 16 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Naziv posla</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="npr. Ciscenje stana 60m2" style={inp} /></div>
                <div style={{ marginBottom: 16 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Lokacija</label><input type="text" value={loc} onChange={e => setLoc(e.target.value)} required placeholder="npr. Zagreb, Trnje" style={inp} /></div>
                <div style={{ marginBottom: 24 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Cijena (EUR)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="1" step="0.01" placeholder="50.00" style={inp} /></div>
                <button type="submit" disabled={sub} style={{ width: '100%', padding: 14, background: sub ? t.emeraldDark : `linear-gradient(135deg, ${t.emerald} 0%, ${t.emeraldHover} 100%)`, border: 'none', borderRadius: 12, color: '#000', fontWeight: 700, fontSize: 15, cursor: sub ? 'not-allowed' : 'pointer', boxShadow: `0 4px 20px ${t.emeraldGlow}` }}>{sub ? 'Objavljujem...' : 'Objavi posao'}</button>
              </form>
            </div>

            <div style={{ background: t.card, borderRadius: 20, border: `1px solid ${t.border}`, padding: 28 }}>
              <h2 style={{ color: t.text, fontSize: 20, fontWeight: 700, margin: '0 0 24px 0' }}>Tvoji poslovi ({jobs.length})</h2>
              {jobs.length === 0 ? <p style={{ color: t.textDim, textAlign: 'center', padding: '40px 0' }}>Nemas objavljenih poslova</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {jobs.map(j => (
                    <div key={j.id} style={{ background: t.input, borderRadius: 14, padding: 18, border: `1px solid ${t.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <h3 style={{ color: t.text, fontWeight: 600, fontSize: 16, margin: 0 }}>{j.title}</h3>
                        {badge(j.status, j.cleaner_name)}
                      </div>
                      <p style={{ color: t.textMuted, fontSize: 14, margin: '6px 0' }}>{j.location}</p>
                      <p style={{ color: t.emerald, fontWeight: 700, fontSize: 18, margin: '10px 0 0 0' }}>{Number(j.price).toFixed(2)} EUR</p>
                      {j.status === 'waiting_for_client' && <button onClick={() => confirm(j.id)} style={{ marginTop: 14, padding: '10px 20px', background: t.emerald, border: 'none', borderRadius: 10, color: '#000', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Potvrdi cistaca</button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ background: t.card, borderRadius: 20, border: `1px solid ${t.border}`, padding: 28, maxWidth: 500 }}>
            <h2 style={{ color: t.text, fontSize: 20, fontWeight: 700, margin: '0 0 24px 0' }}>Moj Profil</h2>
            {pMsg && <div style={{ background: pMsg.includes('spremljen') ? t.emeraldGlow : 'rgba(239,68,68,0.1)', border: `1px solid ${pMsg.includes('spremljen') ? t.emerald : 'rgba(239,68,68,0.3)'}`, borderRadius: 12, padding: 14, marginBottom: 20, color: pMsg.includes('spremljen') ? t.emerald : t.red, fontSize: 14 }}>{pMsg}</div>}
            <form onSubmit={saveProfile}>
              <div style={{ marginBottom: 16 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Telefon</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+385 91 234 5678" style={inp} /></div>
              <div style={{ marginBottom: 24 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 500 }}>O meni</label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Kratki opis..." rows={4} style={{ ...inp, resize: 'vertical' }} /></div>
              <button type="submit" disabled={saving} style={{ padding: '12px 28px', background: saving ? t.emeraldDark : t.emerald, border: 'none', borderRadius: 10, color: '#000', fontWeight: 600, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Spremam...' : 'Spremi promjene'}</button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CLEANER DASHBOARD
// ═══════════════════════════════════════════════════════════════
function CleanerDash({ logout, name, uid }: { logout: () => void; name: string; uid: string }) {
  const [tab, setTab] = useState<'available' | 'my' | 'profile'>('available')
  const [jobs, setJobs] = useState<Job[]>([])
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [phone, setPhone] = useState(''); const [desc, setDesc] = useState(''); const [saving, setSaving] = useState(false); const [pMsg, setPMsg] = useState('')

  useEffect(() => { fetch('/api/jobs?role=cleaner').then(r => r.json()).then(d => setJobs(d.jobs || [])).catch(() => {}) }, [])
  useEffect(() => { if (uid) fetch(`/api/jobs/my?userId=${uid}`).then(r => r.json()).then(d => setMyJobs(d.jobs || [])).catch(() => {}) }, [uid])
  useEffect(() => { if (uid) fetch(`/api/profile?userId=${uid}`).then(r => r.json()).then(d => { if (d.user) { setPhone(d.user.phone || ''); setDesc(d.user.description || '') }}).catch(() => {}) }, [uid])

  const accept = async (id: number) => {
    try { const res = await fetch('/api/jobs/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId: id, odrzavateljId: uid }) }); const d = await res.json(); if (d.success) { setJobs(jobs.filter(j => j.id !== id)); const accepted = jobs.find(j => j.id === id); if (accepted) setMyJobs([{ ...accepted, status: 'waiting_for_client' }, ...myJobs]) }} catch {}
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setPMsg('')
    try { const res = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, phone, description: desc }) }); const d = await res.json(); setPMsg(d.success ? 'Profil spremljen!' : 'Greska') } catch { setPMsg('Mrezna greska') }
    setSaving(false)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
  const statusBadge = (s: string) => {
    const m: Record<string, { bg: string; c: string; l: string }> = { waiting_for_client: { bg: 'rgba(251,191,36,0.15)', c: t.yellow, l: 'Ceka potvrdu klijenta' }, confirmed: { bg: 'rgba(59,130,246,0.15)', c: t.blue, l: 'Potvrdeno' } }
    const x = m[s] || { bg: t.emeraldGlow, c: t.emerald, l: s }
    return <span style={{ padding: '6px 14px', borderRadius: 20, background: x.bg, color: x.c, fontSize: 12, fontWeight: 600 }}>{x.l}</span>
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <header style={{ borderBottom: `1px solid ${t.border}`, background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${t.emerald} 0%, ${t.emeraldHover} 100%)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 700, color: t.text, fontSize: 18 }}>sjaj<span style={{ color: t.emerald }}>.hr</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: t.textMuted, fontSize: 14 }}>{name}</span>
            <button onClick={logout} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, color: t.textMuted, fontSize: 13, cursor: 'pointer' }} onMouseOver={e => { e.currentTarget.style.borderColor = t.red; e.currentTarget.style.color = t.red }} onMouseOut={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted }}>Odjava</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {(['available', 'my', 'profile'] as const).map(x => (
            <button key={x} onClick={() => setTab(x)} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: tab === x ? t.emerald : t.card, color: tab === x ? '#000' : t.textMuted, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              {x === 'available' ? 'Dostupni Poslovi' : x === 'my' ? 'Moji Poslovi' : 'Profil'}
            </button>
          ))}
        </div>

        {tab === 'available' && (
          <div>
            <h2 style={{ color: t.text, fontSize: 24, fontWeight: 700, margin: '0 0 24px 0' }}>Dostupni poslovi ({jobs.length})</h2>
            {jobs.length === 0 ? <div style={{ background: t.card, borderRadius: 20, border: `1px solid ${t.border}`, padding: '60px 24px', textAlign: 'center' }}><p style={{ color: t.textDim, fontSize: 16 }}>Nema dostupnih poslova trenutno</p></div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {jobs.map(j => (
                  <div key={j.id} style={{ background: t.card, borderRadius: 18, border: `1px solid ${t.border}`, padding: 24, transition: 'all 0.2s' }}>
                    <h3 style={{ color: t.text, fontWeight: 600, fontSize: 18, margin: '0 0 8px 0' }}>{j.title}</h3>
                    <p style={{ color: t.textMuted, fontSize: 14, margin: '0 0 16px 0' }}>{j.location}</p>
                    <p style={{ color: t.emerald, fontWeight: 700, fontSize: 24, margin: '0 0 20px 0' }}>{Number(j.price).toFixed(2)} EUR</p>
                    <button onClick={() => accept(j.id)} style={{ width: '100%', padding: 14, background: `linear-gradient(135deg, ${t.emerald} 0%, ${t.emeraldHover} 100%)`, border: 'none', borderRadius: 12, color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: `0 4px 20px ${t.emeraldGlow}` }}>Prihvati posao</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'my' && (
          <div>
            <h2 style={{ color: t.text, fontSize: 24, fontWeight: 700, margin: '0 0 24px 0' }}>Moji prihvaceni poslovi ({myJobs.length})</h2>
            {myJobs.length === 0 ? <div style={{ background: t.card, borderRadius: 20, border: `1px solid ${t.border}`, padding: '60px 24px', textAlign: 'center' }}><p style={{ color: t.textDim, fontSize: 16 }}>Nisi jos prihvatio nijedan posao</p></div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {myJobs.map(j => (
                  <div key={j.id} style={{ background: t.card, borderRadius: 18, border: `1px solid ${t.border}`, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <h3 style={{ color: t.text, fontWeight: 600, fontSize: 18, margin: 0 }}>{j.title}</h3>
                      {statusBadge(j.status)}
                    </div>
                    <p style={{ color: t.textMuted, fontSize: 14, margin: '0 0 12px 0' }}>{j.location}</p>
                    <p style={{ color: t.emerald, fontWeight: 700, fontSize: 22, margin: 0 }}>{Number(j.price).toFixed(2)} EUR</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ background: t.card, borderRadius: 20, border: `1px solid ${t.border}`, padding: 28, maxWidth: 500 }}>
            <h2 style={{ color: t.text, fontSize: 20, fontWeight: 700, margin: '0 0 24px 0' }}>Moj Profil</h2>
            {pMsg && <div style={{ background: pMsg.includes('spremljen') ? t.emeraldGlow : 'rgba(239,68,68,0.1)', border: `1px solid ${pMsg.includes('spremljen') ? t.emerald : 'rgba(239,68,68,0.3)'}`, borderRadius: 12, padding: 14, marginBottom: 20, color: pMsg.includes('spremljen') ? t.emerald : t.red, fontSize: 14 }}>{pMsg}</div>}
            <form onSubmit={saveProfile}>
              <div style={{ marginBottom: 16 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Telefon</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+385 91 234 5678" style={inp} /></div>
              <div style={{ marginBottom: 24 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 500 }}>O meni / Iskustvo</label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Opisi svoje iskustvo u ciscenju..." rows={4} style={{ ...inp, resize: 'vertical' }} /></div>
              <button type="submit" disabled={saving} style={{ padding: '12px 28px', background: saving ? t.emeraldDark : t.emerald, border: 'none', borderRadius: 10, color: '#000', fontWeight: 600, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Spremam...' : 'Spremi promjene'}</button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
