'use client'

import React, { useState, useEffect } from 'react'

type User = { id: number; email: string; role: 'client' | 'cleaner' }
type Job = { id: number; title: string; location: string; price: number; status: string; created_at: string; cleaner_id?: number; cleaner_name?: string }

// Premium Dark Theme
const t = {
  bg: '#09090b',
  card: '#18181b',
  cardHover: '#1f1f23',
  input: '#27272a',
  border: '#3f3f46',
  borderHover: '#52525b',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  textDim: '#71717a',
  emerald: '#10b981',
  emeraldHover: '#059669',
  emeraldDark: '#064e3b',
  emeraldGlow: 'rgba(16, 185, 129, 0.12)',
  yellow: '#fbbf24',
  blue: '#3b82f6',
  red: '#ef4444',
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<'auth' | 'dashboard'>('auth')
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
    setUserRole(null); setUserName(''); setUserId(''); setJobs([]); setView('auth')
  }

  if (!mounted) return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${t.border}`, borderTopColor: t.emerald, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (view === 'auth') return <Auth onLogin={login} />
  if (userRole === 'client') return <ClientDash logout={logout} jobs={jobs} setJobs={setJobs} name={userName} uid={userId} />
  if (userRole === 'cleaner') return <CleanerDash logout={logout} name={userName} uid={userId} />
  return null
}

// ═══════════════════════════════════════════════════════════════
// AUTH PAGE
// ═══════════════════════════════════════════════════════════════
function Auth({ onLogin }: { onLogin: (u: User) => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'client' | 'cleaner'>('client')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true)
    const url = tab === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = tab === 'login' ? { email, password: pass } : { email, password: pass, fullName: name, role }
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.success && data.user) onLogin(data.user)
      else { setErr(data.error || 'Greska'); setLoading(false) }
    } catch { setErr('Mrezna greska'); setLoading(false) }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '14px 16px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 12, color: t.text, fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${t.bg} 0%, #0c1a14 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, background: `linear-gradient(135deg, ${t.emerald} 0%, ${t.emeraldHover} 100%)`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 32px ${t.emeraldGlow}` }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span style={{ fontSize: 28, fontWeight: 800, color: t.text, letterSpacing: -1 }}>CleanPro</span>
          </div>
          <p style={{ color: t.textMuted, fontSize: 15, margin: 0 }}>Profesionalne usluge ciscenja</p>
        </div>

        {/* Card */}
        <div style={{ background: t.card, borderRadius: 20, border: `1px solid ${t.border}`, padding: 32, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: t.input, borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {(['login', 'register'] as const).map(x => (
              <button key={x} onClick={() => { setTab(x); setErr('') }} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', background: tab === x ? t.emerald : 'transparent', color: tab === x ? '#000' : t.textMuted, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                {x === 'login' ? 'Prijava' : 'Registracija'}
              </button>
            ))}
          </div>

          {err && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 14, marginBottom: 20, color: t.red, fontSize: 14 }}>{err}</div>}

          <form onSubmit={submit}>
            {tab === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: t.textMuted, fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Ime i prezime</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ivan Horvat" style={inp} onFocus={e => e.target.style.borderColor = t.emerald} onBlur={e => e.target.style.borderColor = t.border} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: t.textMuted, fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Email adresa</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vas@email.com" style={inp} onFocus={e => e.target.style.borderColor = t.emerald} onBlur={e => e.target.style.borderColor = t.border} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: t.textMuted, fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Lozinka</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} required minLength={6} placeholder="••••••••" style={inp} onFocus={e => e.target.style.borderColor = t.emerald} onBlur={e => e.target.style.borderColor = t.border} />
            </div>
            {tab === 'register' && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', color: t.textMuted, fontSize: 13, marginBottom: 10, fontWeight: 500 }}>Registriram se kao:</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {(['client', 'cleaner'] as const).map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)} style={{ flex: 1, padding: 16, borderRadius: 12, border: `2px solid ${role === r ? t.emerald : t.border}`, background: role === r ? t.emeraldGlow : 'transparent', color: role === r ? t.emerald : t.textMuted, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {r === 'client' ? 'Klijent' : 'Cistac'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 16, background: loading ? t.emeraldDark : `linear-gradient(135deg, ${t.emerald} 0%, ${t.emeraldHover} 100%)`, border: 'none', borderRadius: 12, color: '#000', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: loading ? 'none' : `0 8px 32px ${t.emeraldGlow}` }}>
              {loading ? 'Ucitavanje...' : tab === 'login' ? 'Prijavi se' : 'Registriraj se'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: 24, color: t.textDim, fontSize: 13 }}>CleanPro 2026. Sva prava pridrzana.</p>
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
      if (d.success) { setJobs([{ id: d.job?.id || Date.now(), title, location: loc, price: parseFloat(price), status: 'open', created_at: new Date().toISOString() }, ...jobs]); setTitle(''); setLoc(''); setPrice(''); setOk('Posao objavljen!'); setTimeout(() => setOk(''), 3000) }
      else setErr(d.error || 'Greska')
    } catch { setErr('Mrezna greska') }
    setSub(false)
  }

  const confirm = async (id: number) => {
    try { const res = await fetch('/api/jobs/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId: id, userId: uid }) }); const d = await res.json(); if (d.success) setJobs(jobs.map(j => j.id === id ? { ...j, status: 'confirmed' } : j)) } catch {}
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setPMsg('')
    try { const res = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, phone, description: desc }) }); const d = await res.json(); setPMsg(d.success ? 'Spremljeno!' : 'Greska') } catch { setPMsg('Mrezna greska') }
    setSaving(false)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
  const badge = (s: string, cn?: string) => {
    const m: Record<string, { bg: string; c: string; l: string }> = { open: { bg: t.emeraldGlow, c: t.emerald, l: 'Otvoren' }, waiting_for_client: { bg: 'rgba(251,191,36,0.12)', c: t.yellow, l: cn ? `Ceka potvrdu - ${cn}` : 'Ceka potvrdu' }, confirmed: { bg: 'rgba(59,130,246,0.12)', c: t.blue, l: 'Potvrdeno' } }
    const x = m[s] || m.open
    return <span style={{ padding: '6px 12px', borderRadius: 20, background: x.bg, color: x.c, fontSize: 12, fontWeight: 600 }}>{x.l}</span>
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${t.border}`, background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${t.emerald} 0%, ${t.emeraldHover} 100%)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span style={{ fontWeight: 700, color: t.text, fontSize: 18 }}>CleanPro</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: t.textMuted, fontSize: 14 }}>{name}</span>
            <button onClick={logout} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, color: t.textMuted, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.borderColor = t.red; e.currentTarget.style.color = t.red }} onMouseOut={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted }}>Odjava</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {(['jobs', 'profile'] as const).map(x => (
            <button key={x} onClick={() => setTab(x)} style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: tab === x ? t.emerald : t.card, color: tab === x ? '#000' : t.textMuted, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
              {x === 'jobs' ? 'Moji Poslovi' : 'Profil'}
            </button>
          ))}
        </div>

        {tab === 'jobs' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {/* Create Job */}
            <div style={{ background: t.card, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24 }}>
              <h2 style={{ color: t.text, fontSize: 18, fontWeight: 700, margin: '0 0 20px 0' }}>Objavi novi posao</h2>
              {ok && <div style={{ background: t.emeraldGlow, border: `1px solid ${t.emerald}`, borderRadius: 10, padding: 12, marginBottom: 16, color: t.emerald, fontSize: 14 }}>{ok}</div>}
              {err && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, marginBottom: 16, color: t.red, fontSize: 14 }}>{err}</div>}
              <form onSubmit={create}>
                <div style={{ marginBottom: 14 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 6, fontWeight: 500 }}>Naziv posla</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="npr. Ciscenje stana" style={inp} /></div>
                <div style={{ marginBottom: 14 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 6, fontWeight: 500 }}>Lokacija</label><input type="text" value={loc} onChange={e => setLoc(e.target.value)} required placeholder="npr. Zagreb, Trnje" style={inp} /></div>
                <div style={{ marginBottom: 20 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 6, fontWeight: 500 }}>Cijena (EUR)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="1" step="0.01" placeholder="50.00" style={inp} /></div>
                <button type="submit" disabled={sub} style={{ width: '100%', padding: 14, background: sub ? t.emeraldDark : t.emerald, border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 15, cursor: sub ? 'not-allowed' : 'pointer' }}>{sub ? 'Objavljujem...' : 'Objavi posao'}</button>
              </form>
            </div>

            {/* Jobs List */}
            <div style={{ background: t.card, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24 }}>
              <h2 style={{ color: t.text, fontSize: 18, fontWeight: 700, margin: '0 0 20px 0' }}>Tvoji poslovi ({jobs.length})</h2>
              {jobs.length === 0 ? <p style={{ color: t.textDim, textAlign: 'center', padding: '32px 0' }}>Nemas objavljenih poslova</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {jobs.map(j => (
                    <div key={j.id} style={{ background: t.input, borderRadius: 12, padding: 16, border: `1px solid ${t.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h3 style={{ color: t.text, fontWeight: 600, fontSize: 15, margin: 0 }}>{j.title}</h3>
                        {badge(j.status, j.cleaner_name)}
                      </div>
                      <p style={{ color: t.textMuted, fontSize: 13, margin: '4px 0' }}>{j.location}</p>
                      <p style={{ color: t.emerald, fontWeight: 700, fontSize: 16, margin: '8px 0 0 0' }}>{Number(j.price).toFixed(2)} EUR</p>
                      {j.status === 'waiting_for_client' && <button onClick={() => confirm(j.id)} style={{ marginTop: 12, padding: '8px 16px', background: t.emerald, border: 'none', borderRadius: 8, color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Potvrdi cistaca</button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ background: t.card, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24, maxWidth: 480 }}>
            <h2 style={{ color: t.text, fontSize: 18, fontWeight: 700, margin: '0 0 20px 0' }}>Moj Profil</h2>
            {pMsg && <div style={{ background: pMsg === 'Spremljeno!' ? t.emeraldGlow : 'rgba(239,68,68,0.1)', border: `1px solid ${pMsg === 'Spremljeno!' ? t.emerald : 'rgba(239,68,68,0.3)'}`, borderRadius: 10, padding: 12, marginBottom: 16, color: pMsg === 'Spremljeno!' ? t.emerald : t.red, fontSize: 14 }}>{pMsg}</div>}
            <form onSubmit={saveProfile}>
              <div style={{ marginBottom: 14 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 6, fontWeight: 500 }}>Telefon</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+385 91 234 5678" style={inp} /></div>
              <div style={{ marginBottom: 20 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 6, fontWeight: 500 }}>O meni</label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Kratki opis..." rows={4} style={{ ...inp, resize: 'vertical' }} /></div>
              <button type="submit" disabled={saving} style={{ width: '100%', padding: 14, background: saving ? t.emeraldDark : t.emerald, border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Spremam...' : 'Spremi profil'}</button>
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
  const [avail, setAvail] = useState<Job[]>([]); const [my, setMy] = useState<Job[]>([]); const [acc, setAcc] = useState<number | null>(null)
  const [phone, setPhone] = useState(''); const [desc, setDesc] = useState(''); const [saving, setSaving] = useState(false); const [pMsg, setPMsg] = useState('')

  useEffect(() => {
    Promise.all([fetch('/api/jobs?role=cleaner'), fetch(`/api/jobs/my?userId=${uid}`)]).then(async ([a, m]) => {
      const ad = await a.json(); const md = await m.json()
      setAvail(ad.jobs || []); setMy(md.jobs || [])
    }).catch(() => {})
  }, [uid])

  useEffect(() => { if (uid) fetch(`/api/profile?userId=${uid}`).then(r => r.json()).then(d => { if (d.user) { setPhone(d.user.phone || ''); setDesc(d.user.description || '') }}).catch(() => {}) }, [uid])

  const accept = async (id: number) => {
    setAcc(id)
    try { const res = await fetch('/api/jobs/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId: id, odrzavateljId: uid }) }); const d = await res.json(); if (d.success) { const j = avail.find(x => x.id === id); if (j) { setMy([{ ...j, status: 'waiting_for_client' }, ...my]); setAvail(avail.filter(x => x.id !== id)) }}} catch {}
    setAcc(null)
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setPMsg('')
    try { const res = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, phone, description: desc }) }); const d = await res.json(); setPMsg(d.success ? 'Spremljeno!' : 'Greska') } catch { setPMsg('Mrezna greska') }
    setSaving(false)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }
  const badge = (s: string) => {
    const m: Record<string, { bg: string; c: string; l: string }> = { open: { bg: t.emeraldGlow, c: t.emerald, l: 'Otvoren' }, waiting_for_client: { bg: 'rgba(251,191,36,0.12)', c: t.yellow, l: 'Ceka potvrdu' }, confirmed: { bg: 'rgba(59,130,246,0.12)', c: t.blue, l: 'Potvrdeno' } }
    const x = m[s] || m.open
    return <span style={{ padding: '6px 12px', borderRadius: 20, background: x.bg, color: x.c, fontSize: 12, fontWeight: 600 }}>{x.l}</span>
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <header style={{ borderBottom: `1px solid ${t.border}`, background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${t.emerald} 0%, ${t.emeraldHover} 100%)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span style={{ fontWeight: 700, color: t.text, fontSize: 18 }}>CleanPro</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: t.textMuted, fontSize: 14 }}>{name}</span>
            <button onClick={logout} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, color: t.textMuted, fontSize: 13, cursor: 'pointer' }}>Odjava</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {(['available', 'my', 'profile'] as const).map(x => (
            <button key={x} onClick={() => setTab(x)} style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: tab === x ? t.emerald : t.card, color: tab === x ? '#000' : t.textMuted, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              {x === 'available' ? 'Dostupni' : x === 'my' ? 'Moji' : 'Profil'}
            </button>
          ))}
        </div>

        {tab === 'available' && (
          <div style={{ background: t.card, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24 }}>
            <h2 style={{ color: t.text, fontSize: 18, fontWeight: 700, margin: '0 0 20px 0' }}>Dostupni poslovi ({avail.length})</h2>
            {avail.length === 0 ? <p style={{ color: t.textDim, textAlign: 'center', padding: '32px 0' }}>Nema dostupnih poslova</p> : (
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {avail.map(j => (
                  <div key={j.id} style={{ background: t.input, borderRadius: 12, padding: 20, border: `1px solid ${t.border}` }}>
                    <h3 style={{ color: t.text, fontWeight: 600, fontSize: 16, margin: '0 0 8px 0' }}>{j.title}</h3>
                    <p style={{ color: t.textMuted, fontSize: 13, margin: '4px 0' }}>{j.location}</p>
                    <p style={{ color: t.emerald, fontWeight: 700, fontSize: 20, margin: '12px 0' }}>{Number(j.price).toFixed(2)} EUR</p>
                    <button onClick={() => accept(j.id)} disabled={acc === j.id} style={{ width: '100%', padding: 12, background: acc === j.id ? t.emeraldDark : t.emerald, border: 'none', borderRadius: 8, color: '#000', fontWeight: 600, fontSize: 14, cursor: acc === j.id ? 'not-allowed' : 'pointer' }}>{acc === j.id ? 'Prihvacam...' : 'Prihvati posao'}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'my' && (
          <div style={{ background: t.card, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24 }}>
            <h2 style={{ color: t.text, fontSize: 18, fontWeight: 700, margin: '0 0 20px 0' }}>Moji poslovi ({my.length})</h2>
            {my.length === 0 ? <p style={{ color: t.textDim, textAlign: 'center', padding: '32px 0' }}>Nisi prihvatio nijedan posao</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {my.map(j => (
                  <div key={j.id} style={{ background: t.input, borderRadius: 12, padding: 16, border: `1px solid ${t.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h3 style={{ color: t.text, fontWeight: 600, fontSize: 15, margin: 0 }}>{j.title}</h3>
                      {badge(j.status)}
                    </div>
                    <p style={{ color: t.textMuted, fontSize: 13, margin: '4px 0' }}>{j.location}</p>
                    <p style={{ color: t.emerald, fontWeight: 700, fontSize: 16, margin: '8px 0 0 0' }}>{Number(j.price).toFixed(2)} EUR</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ background: t.card, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24, maxWidth: 480 }}>
            <h2 style={{ color: t.text, fontSize: 18, fontWeight: 700, margin: '0 0 20px 0' }}>Moj Profil</h2>
            {pMsg && <div style={{ background: pMsg === 'Spremljeno!' ? t.emeraldGlow : 'rgba(239,68,68,0.1)', border: `1px solid ${pMsg === 'Spremljeno!' ? t.emerald : 'rgba(239,68,68,0.3)'}`, borderRadius: 10, padding: 12, marginBottom: 16, color: pMsg === 'Spremljeno!' ? t.emerald : t.red, fontSize: 14 }}>{pMsg}</div>}
            <form onSubmit={saveProfile}>
              <div style={{ marginBottom: 14 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 6, fontWeight: 500 }}>Telefon</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+385 91 234 5678" style={inp} /></div>
              <div style={{ marginBottom: 20 }}><label style={{ display: 'block', color: t.textMuted, fontSize: 12, marginBottom: 6, fontWeight: 500 }}>O meni</label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Kratki opis..." rows={4} style={{ ...inp, resize: 'vertical' }} /></div>
              <button type="submit" disabled={saving} style={{ width: '100%', padding: 14, background: saving ? t.emeraldDark : t.emerald, border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Spremam...' : 'Spremi profil'}</button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
