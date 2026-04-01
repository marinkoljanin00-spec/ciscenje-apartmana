'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

type User = { id: number; email: string; role: 'client' | 'cleaner' }
type Job = { 
  id: number; title: string; location: string; price: number; status: string; created_at: string; 
  property_type?: string; is_urgent?: boolean; description?: string; cleaner_id?: number; 
  cleaner_name?: string; cleaner_phone?: string; cleaner_email?: string; application_count?: number;
  client_name?: string; latitude?: number; longitude?: number;
}
type Application = {
  id: number; job_id: number; cleaner_id: number; status: string; message?: string; created_at: string;
  cleaner_name?: string; rating?: number; phone?: string; email?: string; bio?: string;
  title?: string; location?: string; price?: number; job_status?: string; is_urgent?: boolean;
  client_name?: string; client_phone?: string; client_email?: string;
}
type Stats = { totalJobs?: number; activeApplications?: number; totalSpent?: number; completedJobs?: number; pendingApplications?: number; totalEarned?: number; rating?: number }

// Clean Bold Theme
const t = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#000000',
  text: '#000000',
  textMuted: '#64748b',
  accent: '#10b981',
  accentHover: '#059669',
  urgent: '#ef4444',
  shadow: '8px 8px 0px #000000',
  shadowSm: '4px 4px 0px #000000',
}

const cardStyle: React.CSSProperties = { background: t.card, border: `2px solid ${t.border}`, borderRadius: 0, boxShadow: t.shadow }
const btnPrimary: React.CSSProperties = { padding: '14px 28px', background: t.accent, border: `2px solid ${t.border}`, borderRadius: 0, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: t.shadowSm, transition: 'all 0.15s' }
const btnSecondary: React.CSSProperties = { padding: '14px 28px', background: t.card, border: `2px solid ${t.border}`, borderRadius: 0, color: t.text, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: t.shadowSm, transition: 'all 0.15s' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '14px 16px', background: t.card, border: `2px solid ${t.border}`, borderRadius: 0, color: t.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard'>('landing')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [userRole, setUserRole] = useState<'client' | 'cleaner' | null>(null)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')

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
    setUserRole(null); setUserName(''); setUserId(''); setView('landing')
  }

  if (!mounted) return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 800 }}>Ucitavanje...</div>
    </div>
  )

  if (view === 'landing') return <LandingPage onLogin={() => { setAuthMode('login'); setView('auth') }} onRegister={() => { setAuthMode('register'); setView('auth') }} />
  if (view === 'auth') return <AuthPage mode={authMode} setMode={setAuthMode} onLogin={login} onBack={() => setView('landing')} />
  if (userRole === 'client') return <ClientDash logout={logout} name={userName} uid={userId} />
  if (userRole === 'cleaner') return <CleanerDash logout={logout} name={userName} uid={userId} />
  return null
}

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE - Clean Bold Style
// ═══════════════════════════════════════════════════════════════
function LandingPage({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      {/* Navbar */}
      <nav style={{ borderBottom: `2px solid ${t.border}`, background: t.card }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: t.accent, border: `2px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ fontWeight: 900, fontSize: 26, color: t.text, letterSpacing: -1 }}>sjaj.hr</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onLogin} style={btnSecondary}>Prijava</button>
            <button onClick={onRegister} style={btnPrimary}>Registracija</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', padding: '8px 16px', background: t.accent, border: `2px solid ${t.border}`, marginBottom: 24 }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>NOVO: Hitno ciscenje dostupno</span>
            </div>
            
            <h1 style={{ fontSize: 64, fontWeight: 900, color: t.text, lineHeight: 1, margin: '0 0 24px 0', letterSpacing: -3 }}>
              Cist dom.<br/>Sretan zivot.
            </h1>
            
            <p style={{ fontSize: 20, color: t.textMuted, lineHeight: 1.6, margin: '0 0 40px 0', maxWidth: 480 }}>
              Pronadi pouzdane profesionalce za ciscenje ili ponudi svoje usluge. Jednostavno, brzo i sigurno.
            </p>
            
            <div style={{ display: 'flex', gap: 16, marginBottom: 60 }}>
              <button onClick={onRegister} style={{ ...btnPrimary, padding: '18px 36px', fontSize: 17 }}>Zapocni besplatno</button>
              <button onClick={onLogin} style={{ ...btnSecondary, padding: '18px 36px', fontSize: 17 }}>Prijavi se</button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 48 }}>
              {[{ n: '500+', l: 'Klijenata' }, { n: '100+', l: 'Cistaca' }, { n: '4.9', l: 'Prosjecna ocjena' }].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 40, fontWeight: 900, color: t.text }}>{s.n}</div>
                  <div style={{ fontSize: 14, color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div style={{ position: 'relative' }}>
            <div style={{ ...cardStyle, overflow: 'hidden' }}>
              <Image src="/hero-interior.jpg" alt="Cisti dom" width={600} height={450} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            {/* Floating badge */}
            <div style={{ position: 'absolute', bottom: -20, left: -20, ...cardStyle, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, background: t.accent, border: `2px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>100% Garancija</div>
                <div style={{ color: t.textMuted, fontSize: 13 }}>Zadovoljstvo ili povrat</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', borderTop: `2px solid ${t.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 48, fontWeight: 900, textAlign: 'center', margin: '0 0 60px 0', letterSpacing: -2 }}>Kako funkcionira?</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { num: '01', title: 'Objavi posao', desc: 'Opisi sto treba ocistiti, postavi cijenu i lokaciju.' },
              { num: '02', title: 'Primi prijave', desc: 'Verificirani cistaci se prijavljuju na tvoj posao.' },
              { num: '03', title: 'Odaberi najboljeg', desc: 'Pregledaj profile, ocjene i odaberi cistaca.' }
            ].map((f, i) => (
              <div key={i} style={{ ...cardStyle, padding: 32 }}>
                <div style={{ fontSize: 64, fontWeight: 900, color: t.accent, lineHeight: 1, marginBottom: 16 }}>{f.num}</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 12px 0' }}>{f.title}</h3>
                <p style={{ color: t.textMuted, fontSize: 16, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', background: t.text }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 48, fontWeight: 900, color: t.card, margin: '0 0 20px 0', letterSpacing: -2 }}>Spreman za sjaj?</h2>
          <p style={{ fontSize: 18, color: '#a3a3a3', marginBottom: 40 }}>Pridruzi se stotinama zadovoljnih korisnika.</p>
          <button onClick={onRegister} style={{ ...btnPrimary, background: t.accent, color: '#fff', padding: '20px 48px', fontSize: 18 }}>
            Kreiraj racun besplatno
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `2px solid ${t.border}`, padding: '24px', background: t.card }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 20 }}>sjaj.hr</span>
          <span style={{ color: t.textMuted, fontSize: 14 }}>2026 Sva prava pridrzana.</span>
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
  const [email, setEmail] = useState(''); const [pass, setPass] = useState(''); const [name, setName] = useState(''); const [phone, setPhone] = useState('')
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true)
    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = mode === 'login' ? { email, password: pass } : { email, password: pass, fullName: name, role, phone }
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.success && data.user) onLogin(data.user)
      else { setErr(data.error || 'Doslo je do greske'); setLoading(false) }
    } catch { setErr('Mrezna greska'); setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, background: 'none', border: 'none', color: t.textMuted, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          ← Natrag
        </button>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 52, height: 52, background: t.accent, border: `2px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
            </div>
            <span style={{ fontSize: 32, fontWeight: 900 }}>sjaj.hr</span>
          </div>
          <p style={{ color: t.textMuted, fontSize: 16 }}>{mode === 'login' ? 'Dobrodosli natrag!' : 'Kreirajte novi racun'}</p>
        </div>

        <div style={{ ...cardStyle, padding: 32 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: 28, border: `2px solid ${t.border}` }}>
            {(['login', 'register'] as const).map(x => (
              <button key={x} onClick={() => { setMode(x); setErr('') }} style={{ flex: 1, padding: '14px 0', border: 'none', background: mode === x ? t.text : t.card, color: mode === x ? t.card : t.text, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                {x === 'login' ? 'PRIJAVA' : 'REGISTRACIJA'}
              </button>
            ))}
          </div>

          {err && <div style={{ background: '#fef2f2', border: `2px solid ${t.urgent}`, padding: 14, marginBottom: 20, color: t.urgent, fontWeight: 600, fontSize: 14 }}>{err}</div>}

          <form onSubmit={submit}>
            {mode === 'register' && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Ime i prezime</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ivan Horvat" style={inputStyle} />
              </div>
            )}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vas@email.com" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Lozinka</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} required minLength={6} placeholder="Min. 6 znakova" style={inputStyle} />
            </div>
            {mode === 'register' && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Mobitel</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+385 91 234 5678" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Registriram se kao:</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {(['client', 'cleaner'] as const).map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)} style={{ flex: 1, padding: 16, border: `2px solid ${t.border}`, background: role === r ? t.text : t.card, color: role === r ? t.card : t.text, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        {r === 'client' ? 'KLIJENT' : 'CISTAC'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <button type="submit" disabled={loading} style={{ ...btnPrimary, width: '100%', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Pricekajte...' : mode === 'login' ? 'PRIJAVI SE' : 'REGISTRIRAJ SE'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CLIENT DASHBOARD
// ═══════════════════════════════════════════════════════════════
function ClientDash({ logout, name, uid }: { logout: () => void; name: string; uid: string }) {
  const [tab, setTab] = useState<'jobs' | 'profile'>('jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])

  // Form state
  const [title, setTitle] = useState(''); const [location, setLocation] = useState(''); const [price, setPrice] = useState('')
  const [propertyType, setPropertyType] = useState('stan'); const [isUrgent, setIsUrgent] = useState(false); const [desc, setDesc] = useState('')
  const [submitting, setSubmitting] = useState(false); const [err, setErr] = useState('')

  useEffect(() => {
    fetch(`/api/jobs?role=client&userId=${uid}`).then(r => r.json()).then(d => setJobs(d.jobs || []))
    fetch(`/api/stats?role=client&userId=${uid}`).then(r => r.json()).then(d => setStats(d))
  }, [uid])

  const loadApplications = async (job: Job) => {
    setSelectedJob(job)
    const res = await fetch(`/api/applications?jobId=${job.id}`)
    const data = await res.json()
    setApplications(data.applications || [])
  }

  const acceptApplication = async (app: Application) => {
    await fetch('/api/applications/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ applicationId: app.id, jobId: app.job_id, cleanerId: app.cleaner_id }) })
    // Reload jobs and close modal
    const res = await fetch(`/api/jobs?role=client&userId=${uid}`)
    const data = await res.json()
    setJobs(data.jobs || [])
    setSelectedJob(null)
  }

  const deleteJob = async (jobId: number) => {
    if (!confirm('Jeste li sigurni da zelite obrisati ovaj posao?')) return
    await fetch(`/api/jobs?jobId=${jobId}&userId=${uid}`, { method: 'DELETE' })
    setJobs(jobs.filter(j => j.id !== jobId))
  }

  const createJob = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setSubmitting(true)
    const finalPrice = isUrgent ? Number(price) * 1.5 : Number(price)
    const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, location, price: Number(price), propertyType, isUrgent, description: desc, userId: uid }) })
    const data = await res.json()
    if (data.success) {
      setJobs([{ ...data.job, price: finalPrice }, ...jobs])
      setTitle(''); setLocation(''); setPrice(''); setDesc(''); setIsUrgent(false)
      fetch(`/api/stats?role=client&userId=${uid}`).then(r => r.json()).then(d => setStats(d))
    } else { setErr(data.error || 'Greska') }
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      {/* Header */}
      <header style={{ background: t.card, borderBottom: `2px solid ${t.border}`, padding: '16px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: t.accent, border: `2px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 900, fontSize: 22 }}>sjaj.hr</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontWeight: 600, color: t.textMuted }}>{name}</span>
            <button onClick={logout} style={{ ...btnSecondary, padding: '10px 20px', fontSize: 14 }}>Odjava</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, border: `2px solid ${t.border}`, width: 'fit-content' }}>
          {[{ k: 'jobs', l: 'Moji poslovi' }, { k: 'profile', l: 'Profil' }].map(x => (
            <button key={x.k} onClick={() => setTab(x.k as 'jobs' | 'profile')} style={{ padding: '14px 28px', border: 'none', background: tab === x.k ? t.text : t.card, color: tab === x.k ? t.card : t.text, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {x.l.toUpperCase()}
            </button>
          ))}
        </div>

        {tab === 'jobs' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
              {[
                { label: 'Ukupno poslova', value: stats.totalJobs || 0 },
                { label: 'Aktivne prijave', value: stats.activeApplications || 0 },
                { label: 'Ukupno potroseno', value: `${Number(stats.totalSpent || 0).toFixed(2)} EUR` }
              ].map((s, i) => (
                <div key={i} style={{ ...cardStyle, padding: 24 }}>
                  <div style={{ color: t.textMuted, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 900 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 32 }}>
              {/* Create Job Form */}
              <div style={{ ...cardStyle, padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 24px 0' }}>NOVI POSAO</h3>
                {err && <div style={{ background: '#fef2f2', border: `2px solid ${t.urgent}`, padding: 12, marginBottom: 16, color: t.urgent, fontWeight: 600, fontSize: 13 }}>{err}</div>}
                <form onSubmit={createJob}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Naslov</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Npr. Ciscenje stana" style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Vrsta objekta</label>
                    <select value={propertyType} onChange={e => setPropertyType(e.target.value)} style={selectStyle}>
                      <option value="stan">Stan</option>
                      <option value="kuca">Kuca</option>
                      <option value="apartman">Apartman</option>
                      <option value="poslovni">Poslovni prostor</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Lokacija</label>
                    <input value={location} onChange={e => setLocation(e.target.value)} required placeholder="Npr. Zagreb, Tresnjevka" style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Cijena (EUR)</label>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="1" placeholder="50" style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Opis (opcionalno)</label>
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Detalji o poslu..." style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button type="button" onClick={() => setIsUrgent(!isUrgent)} style={{ width: 48, height: 28, background: isUrgent ? t.urgent : '#e5e7eb', border: `2px solid ${t.border}`, borderRadius: 0, cursor: 'pointer', position: 'relative' }}>
                      <div style={{ width: 20, height: 20, background: t.card, border: `2px solid ${t.border}`, position: 'absolute', top: 2, left: isUrgent ? 22 : 2, transition: 'left 0.2s' }} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>HITNO CISCENJE (+50%)</span>
                  </div>
                  {isUrgent && price && (
                    <div style={{ background: '#fef9e7', border: `2px solid ${t.border}`, padding: 12, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
                      Konacna cijena: <strong>{(Number(price) * 1.5).toFixed(2)} EUR</strong>
                    </div>
                  )}
                  <button type="submit" disabled={submitting} style={{ ...btnPrimary, width: '100%' }}>
                    {submitting ? 'Objavljujem...' : 'OBJAVI POSAO'}
                  </button>
                </form>
              </div>

              {/* Jobs List */}
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px 0' }}>MOJI POSLOVI ({jobs.length})</h3>
                {jobs.length === 0 ? (
                  <div style={{ ...cardStyle, padding: 40, textAlign: 'center', color: t.textMuted }}>
                    Nemate objavljenih poslova.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {jobs.map(job => (
                      <div key={job.id} style={{ ...cardStyle, padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              {job.is_urgent && <span style={{ background: t.urgent, color: '#fff', padding: '4px 10px', fontSize: 11, fontWeight: 800 }}>HITNO</span>}
                              <span style={{ background: t.accent, color: '#fff', padding: '4px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{job.property_type || 'stan'}</span>
                              <span style={{ background: job.status === 'open' ? '#22c55e' : job.status === 'accepted' ? '#3b82f6' : '#94a3b8', color: '#fff', padding: '4px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{job.status}</span>
                            </div>
                            <h4 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px 0' }}>{job.title}</h4>
                            <p style={{ color: t.textMuted, margin: 0, fontSize: 14 }}>{job.location}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 24, fontWeight: 900 }}>{Number(job.price).toFixed(2)} EUR</div>
                          </div>
                        </div>
                        
                        {job.status === 'accepted' && job.cleaner_name && (
                          <div style={{ background: '#f0fdf4', border: `2px solid ${t.border}`, padding: 16, marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, marginBottom: 8 }}>Prihvaceni cistac:</div>
                            <div style={{ fontWeight: 800, fontSize: 16 }}>{job.cleaner_name}</div>
                            {job.cleaner_phone && <div style={{ color: t.textMuted, fontSize: 14 }}>Tel: {job.cleaner_phone}</div>}
                            {job.cleaner_email && <div style={{ color: t.textMuted, fontSize: 14 }}>Email: {job.cleaner_email}</div>}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 12 }}>
                          {job.status === 'open' && (
                            <button onClick={() => loadApplications(job)} style={{ ...btnSecondary, padding: '10px 20px', fontSize: 13 }}>
                              PRIJAVE ({job.application_count || 0})
                            </button>
                          )}
                          <button onClick={() => deleteJob(job.id)} style={{ ...btnSecondary, padding: '10px 20px', fontSize: 13, color: t.urgent, borderColor: t.urgent }}>
                            OBRISI
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {tab === 'profile' && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ ...cardStyle, padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 24px 0' }}>MOJ PROFIL</h3>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: t.textMuted, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{name}</div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: t.textMuted, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Uloga</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Klijent</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Applications Modal */}
      {selectedJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 1000 }} onClick={() => setSelectedJob(null)}>
          <div style={{ ...cardStyle, maxWidth: 600, width: '100%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 24, borderBottom: `2px solid ${t.border}` }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>PRIJAVE ZA: {selectedJob.title}</h3>
            </div>
            <div style={{ padding: 24 }}>
              {applications.length === 0 ? (
                <p style={{ color: t.textMuted, textAlign: 'center', margin: 0 }}>Nema prijava za ovaj posao.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {applications.map(app => (
                    <div key={app.id} style={{ border: `2px solid ${t.border}`, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{app.cleaner_name}</div>
                          <div style={{ color: t.textMuted, fontSize: 14, marginBottom: 8 }}>Ocjena: {Number(app.rating || 5).toFixed(1)} / 5.0</div>
                          {app.bio && <div style={{ fontSize: 14, marginBottom: 8 }}>{app.bio}</div>}
                          {app.message && <div style={{ background: t.bg, padding: 12, fontSize: 14, fontStyle: 'italic' }}>&quot;{app.message}&quot;</div>}
                        </div>
                        {app.status === 'pending' && (
                          <button onClick={() => acceptApplication(app)} style={{ ...btnPrimary, padding: '10px 20px', fontSize: 13 }}>PRIHVATI</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CLEANER DASHBOARD
// ═══════════════════════════════════════════════════════════════
function CleanerDash({ logout, name, uid }: { logout: () => void; name: string; uid: string }) {
  const [tab, setTab] = useState<'browse' | 'my' | 'profile'>('browse')
  const [jobs, setJobs] = useState<Job[]>([])
  const [myApplications, setMyApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [filterUrgent, setFilterUrgent] = useState(false)
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    loadJobs()
    fetch(`/api/applications?cleanerId=${uid}`).then(r => r.json()).then(d => setMyApplications(d.applications || []))
    fetch(`/api/stats?role=cleaner&userId=${uid}`).then(r => r.json()).then(d => setStats(d))
  }, [uid])

  const loadJobs = async () => {
    let url = '/api/jobs?role=cleaner'
    if (filterUrgent) url += '&urgent=true'
    if (filterType) url += `&propertyType=${filterType}`
    const res = await fetch(url)
    const data = await res.json()
    setJobs(data.jobs || [])
  }

  useEffect(() => { loadJobs() }, [filterUrgent, filterType])

  const applyToJob = async (jobId: number) => {
    const message = prompt('Poruka klijentu (opcionalno):')
    const res = await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId, cleanerId: uid, message }) })
    const data = await res.json()
    if (data.success) {
      alert('Uspjesno ste se prijavili!')
      fetch(`/api/applications?cleanerId=${uid}`).then(r => r.json()).then(d => setMyApplications(d.applications || []))
    } else {
      alert(data.error || 'Greska')
    }
  }

  const hasApplied = (jobId: number) => myApplications.some(a => a.job_id === jobId)

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      {/* Header */}
      <header style={{ background: t.card, borderBottom: `2px solid ${t.border}`, padding: '16px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: t.accent, border: `2px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 900, fontSize: 22 }}>sjaj.hr</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontWeight: 600, color: t.textMuted }}>{name}</span>
            <button onClick={logout} style={{ ...btnSecondary, padding: '10px 20px', fontSize: 14 }}>Odjava</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, border: `2px solid ${t.border}`, width: 'fit-content' }}>
          {[{ k: 'browse', l: 'Dostupni poslovi' }, { k: 'my', l: 'Moje prijave' }, { k: 'profile', l: 'Profil' }].map(x => (
            <button key={x.k} onClick={() => setTab(x.k as 'browse' | 'my' | 'profile')} style={{ padding: '14px 28px', border: 'none', background: tab === x.k ? t.text : t.card, color: tab === x.k ? t.card : t.text, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {x.l.toUpperCase()}
            </button>
          ))}
        </div>

        {tab === 'browse' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
              {[
                { label: 'Odradeni poslovi', value: stats.completedJobs || 0 },
                { label: 'Ukupna zarada', value: `${Number(stats.totalEarned || 0).toFixed(2)} EUR` },
                { label: 'Aktivne prijave', value: stats.pendingApplications || 0 },
                { label: 'Moja ocjena', value: `${Number(stats.rating || 5).toFixed(1)} / 5.0` }
              ].map((s, i) => (
                <div key={i} style={{ ...cardStyle, padding: 24 }}>
                  <div style={{ color: t.textMuted, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 900 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ ...cardStyle, padding: 20, marginBottom: 24, display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>Filteri:</span>
                <button onClick={() => setFilterUrgent(!filterUrgent)} style={{ padding: '8px 16px', border: `2px solid ${t.border}`, background: filterUrgent ? t.urgent : t.card, color: filterUrgent ? '#fff' : t.text, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  SAMO HITNO
                </button>
              </div>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...selectStyle, width: 'auto' }}>
                <option value="">Sve vrste</option>
                <option value="stan">Stan</option>
                <option value="kuca">Kuca</option>
                <option value="apartman">Apartman</option>
                <option value="poslovni">Poslovni prostor</option>
              </select>
            </div>

            {/* Jobs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              {jobs.map(job => (
                <div key={job.id} style={{ ...cardStyle, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {job.is_urgent && <span style={{ background: t.urgent, color: '#fff', padding: '4px 10px', fontSize: 11, fontWeight: 800 }}>HITNO</span>}
                      <span style={{ background: t.accent, color: '#fff', padding: '4px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{job.property_type || 'stan'}</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{Number(job.price).toFixed(2)} EUR</div>
                  </div>
                  <h4 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px 0' }}>{job.title}</h4>
                  <p style={{ color: t.textMuted, margin: '0 0 4px 0', fontSize: 14 }}>{job.location}</p>
                  <p style={{ color: t.textMuted, margin: '0 0 16px 0', fontSize: 13 }}>Klijent: {job.client_name}</p>
                  {job.description && <p style={{ margin: '0 0 16px 0', fontSize: 14, background: t.bg, padding: 12 }}>{job.description}</p>}
                  
                  {hasApplied(job.id) ? (
                    <button disabled style={{ ...btnSecondary, width: '100%', opacity: 0.6 }}>VEC PRIJAVLJENO</button>
                  ) : (
                    <button onClick={() => applyToJob(job.id)} style={{ ...btnPrimary, width: '100%' }}>PRIJAVI SE</button>
                  )}
                </div>
              ))}
            </div>
            {jobs.length === 0 && (
              <div style={{ ...cardStyle, padding: 60, textAlign: 'center', color: t.textMuted }}>
                Nema dostupnih poslova s ovim filterima.
              </div>
            )}
          </>
        )}

        {tab === 'my' && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 24px 0' }}>MOJE PRIJAVE ({myApplications.length})</h3>
            {myApplications.length === 0 ? (
              <div style={{ ...cardStyle, padding: 60, textAlign: 'center', color: t.textMuted }}>
                Nemate aktivnih prijava.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {myApplications.map(app => (
                  <div key={app.id} style={{ ...cardStyle, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          {app.is_urgent && <span style={{ background: t.urgent, color: '#fff', padding: '4px 10px', fontSize: 11, fontWeight: 800 }}>HITNO</span>}
                          <span style={{ background: app.status === 'pending' ? '#f59e0b' : app.status === 'accepted' ? '#22c55e' : '#ef4444', color: '#fff', padding: '4px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                            {app.status === 'pending' ? 'NA CEKANJU' : app.status === 'accepted' ? 'PRIHVACENO' : 'ODBIJENO'}
                          </span>
                        </div>
                        <h4 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px 0' }}>{app.title}</h4>
                        <p style={{ color: t.textMuted, margin: 0, fontSize: 14 }}>{app.location} - {Number(app.price || 0).toFixed(2)} EUR</p>
                      </div>
                    </div>
                    
                    {app.status === 'accepted' && (
                      <div style={{ background: '#f0fdf4', border: `2px solid ${t.border}`, padding: 16, marginTop: 16 }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>Kontakt klijenta:</div>
                        <div style={{ fontWeight: 800 }}>{app.client_name}</div>
                        {app.client_phone && <div style={{ color: t.textMuted, fontSize: 14 }}>Tel: {app.client_phone}</div>}
                        {app.client_email && <div style={{ color: t.textMuted, fontSize: 14 }}>Email: {app.client_email}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ ...cardStyle, padding: 32 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 24px 0' }}>MOJ PROFIL</h3>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: t.textMuted, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{name}</div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: t.textMuted, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Uloga</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Cistac</div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: t.textMuted, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Ocjena</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{Number(stats.rating || 5).toFixed(1)} / 5.0</div>
              </div>
              <div>
                <div style={{ color: t.textMuted, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Ukupna zarada</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{Number(stats.totalEarned || 0).toFixed(2)} EUR</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
