'use client'

import React, { useState, useEffect, lazy, Suspense } from 'react'

const MapPicker = lazy(() => import('@/components/MapPicker'))

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

// Dark Emerald Theme
const t = {
  bg: '#050505',
  bgCard: '#0a0a0a',
  card: '#111111',
  cardHover: '#1a1a1a',
  border: '#1f1f1f',
  borderLight: '#262626',
  text: '#ffffff',
  textMuted: '#a3a3a3',
  textDim: '#737373',
  accent: '#10b981',
  accentHover: '#059669',
  accentGlow: 'rgba(16, 185, 129, 0.15)',
  urgent: '#ef4444',
}

const cardStyle: React.CSSProperties = { background: t.card, border: `1px solid ${t.border}`, borderRadius: 16 }
const btnPrimary: React.CSSProperties = { padding: '14px 28px', background: t.accent, border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s' }
const btnSecondary: React.CSSProperties = { padding: '14px 28px', background: 'transparent', border: `1px solid ${t.borderLight}`, borderRadius: 10, color: t.text, fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '14px 16px', background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }
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
      <div style={{ color: t.accent, fontSize: 20, fontWeight: 600 }}>Ucitavanje...</div>
    </div>
  )

  if (view === 'landing') return <LandingPage onLogin={() => { setAuthMode('login'); setView('auth') }} onRegister={() => { setAuthMode('register'); setView('auth') }} />
  if (view === 'auth') return <AuthPage mode={authMode} setMode={setAuthMode} onLogin={login} onBack={() => setView('landing')} />
  if (userRole === 'client') return <ClientDash logout={logout} name={userName} uid={userId} />
  if (userRole === 'cleaner') return <CleanerDash logout={logout} name={userName} uid={userId} />
  return null
}

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE - Dark Emerald with Background Image - Single Screen
// ═══════════════════════════════════════════════════════════════
function LandingPage({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
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
          padding: '20px 32px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${t.border}`
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
            <span style={{ fontWeight: 800, fontSize: 24, color: t.text, letterSpacing: -0.5 }}>sjaj.hr</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onLogin} style={btnSecondary}>Prijava</button>
            <button onClick={onRegister} style={btnPrimary}>Registracija</button>
          </div>
        </nav>

        {/* Main Content - All on one screen */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 32px' }}>
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
                <span style={{ color: t.accent, fontSize: 13, fontWeight: 600 }}>PROFESIONALNO CISCENJE NA ZAHTJEV</span>
              </div>
              
              <h1 style={{ 
                fontSize: 'clamp(40px, 7vw, 72px)', 
                fontWeight: 800, 
                color: t.text, 
                lineHeight: 1.1, 
                margin: '0 0 20px 0', 
                letterSpacing: -2 
              }}>
                Cist dom.<br/>
                <span style={{ color: t.accent }}>Sretan zivot.</span>
              </h1>
              
              <p style={{ 
                fontSize: 'clamp(16px, 2vw, 20px)', 
                color: t.textMuted, 
                lineHeight: 1.6, 
                margin: '0 auto 32px', 
                maxWidth: 500 
              }}>
                Pronadi pouzdane profesionalce ili ponudi svoje usluge. Jednostavno, brzo i sigurno.
              </p>
              
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48 }}>
                <button onClick={onRegister} style={{ ...btnPrimary, padding: '16px 32px', fontSize: 16 }}>
                  Zapocni besplatno
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
                { num: '01', icon: '📝', title: 'Objavi posao', desc: 'Opisi sto treba ocistiti, postavi lokaciju i cijenu.' },
                { num: '02', icon: '👥', title: 'Primi prijave', desc: 'Verificirani cistaci se prijavljuju na tvoj posao.' },
                { num: '03', icon: '✨', title: 'Uzivaj u cistoci', desc: 'Odaberi najboljeg i uzivaj u blistavom domu.' }
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
              gap: 48,
              flexWrap: 'wrap'
            }}>
              {[
                { n: '500+', l: 'Klijenata' }, 
                { n: '100+', l: 'Cistaca' }, 
                { n: '4.9', l: 'Ocjena' }
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: t.accent, marginBottom: 4 }}>{s.n}</div>
                  <div style={{ fontSize: 13, color: t.textDim, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ 
          padding: '16px 32px', 
          borderTop: `1px solid ${t.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: t.textDim, fontSize: 13 }}>sjaj.hr 2026</span>
          <span style={{ color: t.textDim, fontSize: 13 }}>Sva prava pridrzana</span>
        </footer>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// AUTH PAGE - Dark Emerald Theme
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
                <div style={{ marginBottom: 24 }}>
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
                        {r === 'client' ? 'Klijent' : 'Cistac'}
                      </button>
                    ))}
                  </div>
                </div>
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

// ═══════════════════════════════════════════════════════════════
// CLIENT DASHBOARD - Dark Emerald Theme
// ═══════════════════════════════════════════════════════════════
function ClientDash({ logout, name, uid }: { logout: () => void; name: string; uid: string }) {
  const [tab, setTab] = useState<'jobs' | 'profile'>('jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [acceptingId, setAcceptingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [acceptedCleaner, setAcceptedCleaner] = useState<{ name: string; email: string; phone: string; rating: number } | null>(null)

  const [title, setTitle] = useState(''); const [location, setLocation] = useState(''); const [price, setPrice] = useState('')
  const [propertyType, setPropertyType] = useState('stan'); const [isUrgent, setIsUrgent] = useState(false); const [desc, setDesc] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null); const [longitude, setLongitude] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false); const [err, setErr] = useState('')

  const handleLocationSelect = (address: string, lat: number, lng: number) => {
    setLocation(address)
    setLatitude(lat)
    setLongitude(lng)
  }

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
    setAcceptingId(app.id)
    try {
      const res = await fetch('/api/applications/accept', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ applicationId: app.id, jobId: app.job_id, cleanerId: app.cleaner_id }) 
      })
      const result = await res.json()
      
      if (result.success && result.cleaner) {
        // Update jobs list
        const jobsRes = await fetch(`/api/jobs?role=client&userId=${uid}`)
        const jobsData = await jobsRes.json()
        setJobs(jobsData.jobs || [])
        
        // Show accepted cleaner info
        setAcceptedCleaner(result.cleaner)
        setApplications([])
        
        // Show toast
        setToast({ message: `Uspjesno ste prihvatili cistaca ${result.cleaner.name}!`, type: 'success' })
        setTimeout(() => setToast(null), 5000)
      } else {
        setToast({ message: result.error || 'Doslo je do greske', type: 'error' })
        setTimeout(() => setToast(null), 3000)
        setSelectedJob(null)
      }
    } catch {
      setToast({ message: 'Mrezna greska', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    }
    setAcceptingId(null)
  }

  const deleteJob = async (jobId: number) => {
    if (!confirm('Jeste li sigurni da zelite obrisati ovaj posao?')) return
    await fetch(`/api/jobs?jobId=${jobId}&userId=${uid}`, { method: 'DELETE' })
    setJobs(jobs.filter(j => j.id !== jobId))
  }

  const createJob = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setSubmitting(true)
    const finalPrice = isUrgent ? Number(price) * 1.5 : Number(price)
    const res = await fetch('/api/jobs', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        title, location, price: Number(price), propertyType, isUrgent, description: desc, userId: uid,
        latitude, longitude
      }) 
    })
    const data = await res.json()
    if (data.success) {
      setJobs([{ ...data.job, price: finalPrice }, ...jobs])
      setTitle(''); setLocation(''); setPrice(''); setDesc(''); setIsUrgent(false); setLatitude(null); setLongitude(null)
      fetch(`/api/stats?role=client&userId=${uid}`).then(r => r.json()).then(d => setStats(d))
    } else { setErr(data.error) }
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${t.border}`, background: t.bgCard }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${t.accent} 0%, #059669 100%)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: t.text }}>sjaj.hr</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: t.textMuted, fontSize: 14 }}>{name}</span>
            <button onClick={logout} style={{ ...btnSecondary, padding: '10px 20px', fontSize: 13 }}>Odjava</button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${t.border}`, background: t.bgCard }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 4 }}>
          {[{ k: 'jobs', l: 'Moji poslovi' }, { k: 'profile', l: 'Profil' }].map(x => (
            <button key={x.k} onClick={() => setTab(x.k as 'jobs' | 'profile')} style={{ 
              padding: '16px 20px', 
              background: 'none', 
              border: 'none', 
              borderBottom: `2px solid ${tab === x.k ? t.accent : 'transparent'}`,
              color: tab === x.k ? t.text : t.textMuted, 
              fontWeight: 600, 
              fontSize: 14, 
              cursor: 'pointer',
              marginBottom: -1
            }}>{x.l}</button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {tab === 'jobs' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Create Job Form */}
            <div style={{ ...cardStyle, padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 20px 0' }}>Novi posao</h3>
              {err && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${t.urgent}`, padding: 12, marginBottom: 16, borderRadius: 10, color: t.urgent, fontSize: 14 }}>{err}</div>}
              <form onSubmit={createJob}>
                <div style={{ marginBottom: 14 }}>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Naslov posla" style={inputStyle} />
                </div>
                
                {/* Location with Map */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 8, fontWeight: 600 }}>Lokacija</label>
                  <Suspense fallback={<div style={{ padding: 20, textAlign: 'center', color: t.textMuted }}>Ucitavam mapu...</div>}>
                    <MapPicker onLocationSelect={handleLocationSelect} theme={t} />
                  </Suspense>
                  {location && (
                    <div style={{ marginTop: 10, padding: 12, background: t.accentGlow, borderRadius: 8, border: `1px solid ${t.accent}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span style={{ color: t.text, fontSize: 14, fontWeight: 500 }}>{location}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} required placeholder="Cijena (EUR)" min="1" style={inputStyle} />
                  <select value={propertyType} onChange={e => setPropertyType(e.target.value)} style={selectStyle}>
                    <option value="stan">Stan</option>
                    <option value="kuca">Kuca</option>
                    <option value="ured">Ured</option>
                    <option value="poslovni">Poslovni prostor</option>
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Opis (opcionalno)" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, cursor: 'pointer' }}>
                  <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} style={{ width: 20, height: 20, accentColor: t.accent }} />
                  <span style={{ color: t.text, fontWeight: 500 }}>Hitno (+50%)</span>
                  {isUrgent && price && <span style={{ color: t.accent, fontSize: 13 }}>= {(Number(price) * 1.5).toFixed(2)} EUR</span>}
                </label>
                <button type="submit" disabled={submitting || !location} style={{ ...btnPrimary, width: '100%', opacity: (!location || submitting) ? 0.6 : 1 }}>{submitting ? 'Objavljujem...' : 'Objavi posao'}</button>
              </form>
            </div>

            {/* Jobs List */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 16px 0' }}>Objavljeni poslovi ({jobs.length})</h3>
              {jobs.length === 0 ? (
                <div style={{ ...cardStyle, padding: 40, textAlign: 'center' }}>
                  <p style={{ color: t.textMuted, margin: 0 }}>Nemate objavljenih poslova</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {jobs.map(job => (
                    <div key={job.id} style={{ ...cardStyle, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <h4 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: 0 }}>{job.title}</h4>
                            {job.is_urgent && <span style={{ background: t.urgent, color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100 }}>HITNO</span>}
                          </div>
                          <p style={{ color: t.textMuted, fontSize: 13, margin: 0 }}>{job.location}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: t.accent }}>{Number(job.price).toFixed(2)} EUR</div>
                          <div style={{ fontSize: 12, color: t.textDim }}>{job.property_type}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: 100, 
                          fontSize: 12, 
                          fontWeight: 600,
                          background: job.status === 'open' ? t.accentGlow : job.status === 'waiting_for_client' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: job.status === 'open' ? t.accent : job.status === 'waiting_for_client' ? '#eab308' : t.accent
                        }}>
                          {job.status === 'open' ? 'Otvoren' : job.status === 'waiting_for_client' ? 'Ceka potvrdu' : 'Potvrdjen'}
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {job.status === 'open' && job.application_count && job.application_count > 0 && (
                            <button onClick={() => loadApplications(job)} style={{ ...btnSecondary, padding: '8px 14px', fontSize: 12 }}>
                              Prijave ({job.application_count})
                            </button>
                          )}
                          {job.status === 'open' && (
                            <button onClick={() => deleteJob(job.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${t.urgent}`, borderRadius: 8, padding: '8px 14px', color: t.urgent, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              Obrisi
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Show cleaner contact info for accepted jobs */}
                      {job.status === 'accepted' && job.cleaner_name && (
                        <div style={{ marginTop: 16, padding: 16, background: t.accentGlow, borderRadius: 12, border: `1px solid ${t.accent}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                            <span style={{ color: t.accent, fontWeight: 600, fontSize: 13 }}>Cistac prihvacen</span>
                          </div>
                          <div style={{ fontWeight: 700, color: t.text, fontSize: 15, marginBottom: 8 }}>{job.cleaner_name}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {job.cleaner_email && (
                              <a href={`mailto:${job.cleaner_email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.textMuted, fontSize: 13, textDecoration: 'none' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                {job.cleaner_email}
                              </a>
                            )}
                            {job.cleaner_phone && (
                              <a href={`tel:${job.cleaner_phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.textMuted, fontSize: 13, textDecoration: 'none' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
                                {job.cleaner_phone}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ ...cardStyle, padding: 32, maxWidth: 500 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: '0 0 24px 0' }}>Moj profil</h3>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 6 }}>Email</label>
              <div style={{ fontSize: 16, color: t.text, fontWeight: 500 }}>{name}</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 6 }}>Uloga</label>
              <div style={{ fontSize: 16, color: t.accent, fontWeight: 600 }}>Klijent</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: t.bgCard, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.text }}>{stats.totalJobs || 0}</div>
                <div style={{ fontSize: 13, color: t.textMuted }}>Ukupno poslova</div>
              </div>
              <div style={{ background: t.bgCard, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.accent }}>{Number(stats.totalSpent || 0).toFixed(0)} EUR</div>
                <div style={{ fontSize: 13, color: t.textMuted }}>Potroseno</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div style={{ 
          position: 'fixed', 
          top: 24, 
          right: 24, 
          padding: '16px 24px', 
          background: toast.type === 'success' ? t.accent : t.urgent, 
          color: toast.type === 'success' ? '#000' : '#fff', 
          borderRadius: 12, 
          fontWeight: 600, 
          fontSize: 14, 
          zIndex: 200,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          {toast.type === 'success' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Applications Modal */}
      {selectedJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100 }} onClick={() => { setSelectedJob(null); setAcceptedCleaner(null) }}>
          <div style={{ ...cardStyle, padding: 28, maxWidth: 500, width: '100%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            
            {/* Show accepted cleaner contact info */}
            {acceptedCleaner ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    background: t.accentGlow, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: t.text, margin: '0 0 8px 0' }}>Cestitamo!</h3>
                  <p style={{ color: t.textMuted, fontSize: 15, margin: 0 }}>Uspjesno ste odabrali cistaca</p>
                </div>

                <div style={{ background: t.bgCard, borderRadius: 16, padding: 24, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <div style={{ 
                      width: 56, 
                      height: 56, 
                      background: `linear-gradient(135deg, ${t.accent} 0%, #059669 100%)`, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 22
                    }}>
                      {acceptedCleaner.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: t.text }}>{acceptedCleaner.name}</div>
                      <div style={{ color: t.accent, fontSize: 14, fontWeight: 600 }}>Ocjena: {acceptedCleaner.rating || 5.0}</div>
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 20 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: t.textMuted, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Kontakt podaci</h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 40, height: 40, background: t.accentGlow, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: t.textMuted }}>Email</div>
                        <a href={`mailto:${acceptedCleaner.email}`} style={{ color: t.text, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>{acceptedCleaner.email}</a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, background: t.accentGlow, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: t.textMuted }}>Telefon</div>
                        <a href={`tel:${acceptedCleaner.phone}`} style={{ color: t.text, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>{acceptedCleaner.phone || 'Nije dostupan'}</a>
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => { setSelectedJob(null); setAcceptedCleaner(null) }} style={{ ...btnPrimary, width: '100%' }}>Zatvori</button>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 20px 0' }}>Prijave za: {selectedJob.title}</h3>
                {applications.length === 0 ? (
                  <p style={{ color: t.textMuted }}>Nema prijava za ovaj posao.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {applications.map(app => (
                      <div key={app.id} style={{ background: t.bgCard, borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontWeight: 600, color: t.text }}>{app.cleaner_name}</div>
                            <div style={{ fontSize: 13, color: t.accent }}>Ocjena: {app.rating || 5.0}</div>
                          </div>
                          <button 
                            onClick={() => acceptApplication(app)} 
                            disabled={acceptingId === app.id}
                            style={{ 
                              ...btnPrimary, 
                              padding: '10px 16px', 
                              fontSize: 13,
                              opacity: acceptingId === app.id ? 0.7 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8
                            }}
                          >
                            {acceptingId === app.id ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/></svg>
                                Prihvacam...
                              </>
                            ) : 'Prihvati'}
                          </button>
                        </div>
                        {app.message && <p style={{ color: t.textMuted, fontSize: 14, margin: 0 }}>{app.message}</p>}
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => { setSelectedJob(null); setAcceptedCleaner(null) }} style={{ ...btnSecondary, width: '100%', marginTop: 20 }}>Zatvori</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CSS Animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CLEANER DASHBOARD - Dark Emerald Theme
// ═══════════════════════════════════════════════════════════════
function CleanerDash({ logout, name, uid }: { logout: () => void; name: string; uid: string }) {
  const [tab, setTab] = useState<'available' | 'my' | 'profile'>('available')
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

  const loadJobs = () => {
    let url = '/api/jobs?role=cleaner'
    if (filterUrgent) url += '&urgent=true'
    if (filterType) url += `&propertyType=${filterType}`
    fetch(url).then(r => r.json()).then(d => setJobs(d.jobs || []))
  }

  useEffect(() => { loadJobs() }, [filterUrgent, filterType])

  const applyToJob = async (jobId: number, message: string) => {
    await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId, cleanerId: uid, message }) })
    fetch(`/api/applications?cleanerId=${uid}`).then(r => r.json()).then(d => setMyApplications(d.applications || []))
    loadJobs()
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${t.border}`, background: t.bgCard }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${t.accent} 0%, #059669 100%)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: t.text }}>sjaj.hr</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: t.textMuted, fontSize: 14 }}>{name}</span>
            <button onClick={logout} style={{ ...btnSecondary, padding: '10px 20px', fontSize: 13 }}>Odjava</button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${t.border}`, background: t.bgCard }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 4 }}>
          {[{ k: 'available', l: 'Dostupni poslovi' }, { k: 'my', l: 'Moje prijave' }, { k: 'profile', l: 'Profil' }].map(x => (
            <button key={x.k} onClick={() => setTab(x.k as 'available' | 'my' | 'profile')} style={{ 
              padding: '16px 20px', 
              background: 'none', 
              border: 'none', 
              borderBottom: `2px solid ${tab === x.k ? t.accent : 'transparent'}`,
              color: tab === x.k ? t.text : t.textMuted, 
              fontWeight: 600, 
              fontSize: 14, 
              cursor: 'pointer',
              marginBottom: -1
            }}>{x.l}</button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {tab === 'available' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: filterUrgent ? t.accentGlow : t.card, border: `1px solid ${filterUrgent ? t.accent : t.border}`, borderRadius: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={filterUrgent} onChange={e => setFilterUrgent(e.target.checked)} style={{ display: 'none' }} />
                <span style={{ color: filterUrgent ? t.accent : t.textMuted, fontWeight: 500, fontSize: 14 }}>Samo hitno</span>
              </label>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...selectStyle, width: 'auto' }}>
                <option value="">Svi tipovi</option>
                <option value="stan">Stan</option>
                <option value="kuca">Kuca</option>
                <option value="ured">Ured</option>
                <option value="poslovni">Poslovni prostor</option>
              </select>
            </div>

            {/* Jobs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {jobs.map(job => {
                const alreadyApplied = myApplications.some(a => a.job_id === job.id)
                return (
                  <div key={job.id} style={{ ...cardStyle, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h4 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: 0 }}>{job.title}</h4>
                          {job.is_urgent && <span style={{ background: t.urgent, color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100 }}>HITNO</span>}
                        </div>
                        <p style={{ color: t.textMuted, fontSize: 13, margin: 0 }}>{job.location}</p>
                        <p style={{ color: t.textDim, fontSize: 12, margin: '4px 0 0 0' }}>{job.client_name}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: t.accent }}>{Number(job.price).toFixed(0)} EUR</div>
                        <div style={{ fontSize: 12, color: t.textDim }}>{job.property_type}</div>
                      </div>
                    </div>
                    {job.description && <p style={{ color: t.textMuted, fontSize: 13, margin: '0 0 12px 0', lineHeight: 1.5 }}>{job.description}</p>}
                    <button 
                      onClick={() => !alreadyApplied && applyToJob(job.id, '')} 
                      disabled={alreadyApplied}
                      style={{ 
                        ...btnPrimary, 
                        width: '100%', 
                        opacity: alreadyApplied ? 0.5 : 1,
                        background: alreadyApplied ? t.textDim : t.accent
                      }}
                    >
                      {alreadyApplied ? 'Vec prijavljeno' : 'Prijavi se'}
                    </button>
                  </div>
                )
              })}
            </div>
            {jobs.length === 0 && (
              <div style={{ ...cardStyle, padding: 60, textAlign: 'center' }}>
                <p style={{ color: t.textMuted, margin: 0, fontSize: 16 }}>Nema dostupnih poslova s ovim filterima</p>
              </div>
            )}
          </>
        )}

        {tab === 'my' && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 16px 0' }}>Moje prijave ({myApplications.length})</h3>
            {myApplications.length === 0 ? (
              <div style={{ ...cardStyle, padding: 40, textAlign: 'center' }}>
                <p style={{ color: t.textMuted, margin: 0 }}>Nemate aktivnih prijava</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myApplications.map(app => (
                  <div key={app.id} style={{ ...cardStyle, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: '0 0 4px 0' }}>{app.title}</h4>
                        <p style={{ color: t.textMuted, fontSize: 13, margin: 0 }}>{app.location}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: t.accent }}>{Number(app.price || 0).toFixed(0)} EUR</div>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: 100, 
                          fontSize: 12, 
                          fontWeight: 600,
                          background: app.status === 'pending' ? 'rgba(234, 179, 8, 0.15)' : app.status === 'accepted' ? t.accentGlow : 'rgba(239, 68, 68, 0.15)',
                          color: app.status === 'pending' ? '#eab308' : app.status === 'accepted' ? t.accent : t.urgent
                        }}>
                          {app.status === 'pending' ? 'Na cekanju' : app.status === 'accepted' ? 'Prihvaceno' : 'Odbijeno'}
                        </span>
                      </div>
                    </div>
                    {app.status === 'accepted' && (
                      <div style={{ marginTop: 12, padding: 12, background: t.accentGlow, borderRadius: 10 }}>
                        <div style={{ fontWeight: 600, color: t.accent, marginBottom: 4 }}>Kontakt klijenta:</div>
                        <div style={{ color: t.text, fontSize: 14 }}>{app.client_name} - {app.client_phone || app.client_email}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ ...cardStyle, padding: 32, maxWidth: 500 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: '0 0 24px 0' }}>Moj profil</h3>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 6 }}>Email</label>
              <div style={{ fontSize: 16, color: t.text, fontWeight: 500 }}>{name}</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 6 }}>Uloga</label>
              <div style={{ fontSize: 16, color: t.accent, fontWeight: 600 }}>Cistac</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div style={{ background: t.bgCard, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.text }}>{stats.completedJobs || 0}</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>Zavrseno</div>
              </div>
              <div style={{ background: t.bgCard, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.accent }}>{Number(stats.totalEarned || 0).toFixed(0)} EUR</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>Zarada</div>
              </div>
              <div style={{ background: t.bgCard, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#eab308' }}>{stats.rating || 5.0}</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>Ocjena</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
