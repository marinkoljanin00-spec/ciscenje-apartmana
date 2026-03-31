'use client'
// v5 - tabs, profile, booking flow

import React, { useState, useEffect } from 'react'
import AuthPage from './auth/page'

type User = {
  id: number
  email: string
  role: 'client' | 'cleaner'
}

type Job = {
  id: number
  title: string
  location: string
  price: number
  status: string
  created_at: string
  cleaner_id?: number
  cleaner_name?: string
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<'auth' | 'dashboard'>('auth')
  const [userRole, setUserRole] = useState<'client' | 'cleaner' | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role') as 'client' | 'cleaner' | null
    const storedName = localStorage.getItem('user_email') || ''
    const storedId = localStorage.getItem('user_id') || ''
    
    if (storedRole && storedId) {
      setUserRole(storedRole)
      setUserName(storedName)
      setUserId(storedId)
      setView('dashboard')
    }
    
    setMounted(true)
  }, [])

  const handleLoginSuccess = (user: User) => {
    localStorage.setItem('user_role', user.role)
    localStorage.setItem('user_id', user.id.toString())
    localStorage.setItem('user_email', user.email)
    setUserRole(user.role)
    setUserName(user.email)
    setUserId(user.id.toString())
    setView('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_email')
    setUserRole(null)
    setUserName('')
    setUserId('')
    setJobs([])
    setView('auth')
  }

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>Učitavanje...</p>
      </div>
    )
  }

  if (view === 'auth') {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />
  }

  if (view === 'dashboard' && userRole === 'client') {
    return <ClientDashboard onLogout={handleLogout} jobs={jobs} setJobs={setJobs} userName={userName} userId={userId} />
  }

  if (view === 'dashboard' && userRole === 'cleaner') {
    return <CleanerDashboard onLogout={handleLogout} userName={userName} userId={userId} />
  }

  return <AuthPage onLoginSuccess={handleLoginSuccess} />
}

// ============ CLIENT DASHBOARD ============
function ClientDashboard({ onLogout, jobs, setJobs, userName, userId }: { 
  onLogout: () => void
  jobs: Job[]
  setJobs: (jobs: Job[]) => void
  userName: string
  userId: string 
}) {
  const [activeTab, setActiveTab] = useState<'jobs' | 'profile'>('jobs')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [description, setDescription] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await fetch(`/api/jobs?role=client&userId=${userId}`)
        const data = await res.json()
        setJobs(data.jobs || [])
      } catch { /* ignore */ }
    }
    if (userId) loadJobs()
  }, [setJobs, userId])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/profile?userId=${userId}`)
        const data = await res.json()
        if (data.user) {
          setPhone(data.user.phone || '')
          setGender(data.user.gender || '')
          setDescription(data.user.description || '')
        }
      } catch { /* ignore */ }
    }
    if (userId) loadProfile()
  }, [userId])

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, location, price: parseFloat(price), userId }),
      })
      const data = await res.json()

      if (data.success) {
        const newJob: Job = {
          id: data.job?.id || Date.now(),
          title,
          location,
          price: parseFloat(price),
          status: 'open',
          created_at: new Date().toISOString(),
        }
        setJobs([newJob, ...jobs])
        setTitle('')
        setLocation('')
        setPrice('')
      } else {
        setError(data.error || 'Greška pri objavi posla.')
      }
    } catch {
      setError('Mrežna greška.')
    }
    setSubmitting(false)
  }

  const handleConfirmJob = async (jobId: number) => {
    try {
      const res = await fetch('/api/jobs/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, userId }),
      })
      const data = await res.json()
      if (data.success) {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'confirmed' } : j))
      }
    } catch { /* ignore */ }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMessage('')

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone, gender, description }),
      })
      const data = await res.json()
      setProfileMessage(data.success ? 'Profil spremljen!' : 'Greška pri spremanju.')
    } catch {
      setProfileMessage('Mrežna greška.')
    }
    setProfileSaving(false)
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '2px solid #000000',
    padding: '1.5rem',
    boxShadow: '4px 4px 0 #000000',
  }

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #000000',
    fontSize: '1rem',
    boxSizing: 'border-box',
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.75rem 1.5rem',
    backgroundColor: active ? '#000000' : '#ffffff',
    color: active ? '#ffffff' : '#000000',
    border: '2px solid #000000',
    fontWeight: '600',
    cursor: 'pointer',
    marginRight: '-2px',
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #000000', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Klijent: {userName}</h1>
        <button onClick={onLogout} style={{ ...buttonStyle, backgroundColor: '#dc2626' }}>Odjava</button>
      </header>

      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex' }}>
          <button style={tabStyle(activeTab === 'jobs')} onClick={() => setActiveTab('jobs')}>Moji Poslovi</button>
          <button style={tabStyle(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>Moj Profil</button>
        </div>

        {activeTab === 'jobs' && (
          <>
            <div style={{ ...cardStyle, marginBottom: '2rem' }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Objavi novi posao</h2>
              <form onSubmit={handleCreateJob}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Naziv posla</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="npr. Čišćenje stana" required style={inputStyle} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Lokacija</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="npr. Zagreb, Trešnjevka" required style={inputStyle} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Cijena (EUR)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="50" required min="1" style={inputStyle} />
                </div>
                {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}
                <button type="submit" disabled={submitting} style={buttonStyle}>{submitting ? 'Objavljujem...' : 'Objavi posao'}</button>
              </form>
            </div>

            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Moji poslovi ({jobs.length})</h2>
            {jobs.length === 0 ? (
              <p style={{ color: '#64748b' }}>Nemate objavljenih poslova.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {jobs.map((job) => (
                  <div key={job.id} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{job.title}</h3>
                        <p style={{ margin: '0 0 0.25rem 0', color: '#64748b' }}>{job.location}</p>
                        <p style={{ margin: '0', fontWeight: '700' }}>{Number(job.price).toFixed(2)} EUR</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          backgroundColor: job.status === 'open' ? '#fef3c7' : job.status === 'waiting_for_client' ? '#dbeafe' : '#d1fae5',
                          color: job.status === 'open' ? '#92400e' : job.status === 'waiting_for_client' ? '#1e40af' : '#065f46',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          border: '2px solid #000000',
                        }}>
                          {job.status === 'open' ? 'Otvoren' : job.status === 'waiting_for_client' ? 'Čeka potvrdu' : 'Potvrđen'}
                        </span>
                        {job.status === 'waiting_for_client' && (
                          <div style={{ marginTop: '0.75rem' }}>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>Čistač: {job.cleaner_name || 'Nepoznato'}</p>
                            <button onClick={() => handleConfirmJob(job.id)} style={{ ...buttonStyle, backgroundColor: '#16a34a', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Potvrdi</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'profile' && (
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Moj Profil</h2>
            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Telefon</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+385 91 234 5678" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Spol</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
                  <option value="">Odaberi...</option>
                  <option value="male">Muško</option>
                  <option value="female">Žensko</option>
                  <option value="other">Ostalo</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Opis</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Recite nešto o sebi..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              {profileMessage && <p style={{ color: profileMessage.includes('Greška') ? '#dc2626' : '#16a34a', marginBottom: '1rem' }}>{profileMessage}</p>}
              <button type="submit" disabled={profileSaving} style={buttonStyle}>{profileSaving ? 'Spremam...' : 'Spremi profil'}</button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

// ============ CLEANER DASHBOARD ============
function CleanerDashboard({ onLogout, userName, userId }: { onLogout: () => void; userName: string; userId: string }) {
  const [activeTab, setActiveTab] = useState<'available' | 'my' | 'profile'>('available')
  const [availableJobs, setAvailableJobs] = useState<Job[]>([])
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [accepting, setAccepting] = useState<number | null>(null)

  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [description, setDescription] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const resAvailable = await fetch('/api/jobs?role=cleaner')
        const dataAvailable = await resAvailable.json()
        setAvailableJobs(dataAvailable.jobs || [])

        const resMy = await fetch(`/api/jobs/my?userId=${userId}`)
        const dataMy = await resMy.json()
        setMyJobs(dataMy.jobs || [])
      } catch { /* ignore */ }
    }
    loadJobs()
  }, [userId])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/profile?userId=${userId}`)
        const data = await res.json()
        if (data.user) {
          setPhone(data.user.phone || '')
          setGender(data.user.gender || '')
          setDescription(data.user.description || '')
        }
      } catch { /* ignore */ }
    }
    if (userId) loadProfile()
  }, [userId])

  const handleAccept = async (jobId: number) => {
    setAccepting(jobId)
    try {
      const res = await fetch('/api/jobs/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, odrzavateljId: userId }),
      })
      const data = await res.json()
      if (data.success) {
        const acceptedJob = availableJobs.find(j => j.id === jobId)
        if (acceptedJob) {
          setAvailableJobs(availableJobs.filter(j => j.id !== jobId))
          setMyJobs([{ ...acceptedJob, status: 'waiting_for_client' }, ...myJobs])
        }
      }
    } catch { /* ignore */ }
    setAccepting(null)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMessage('')

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone, gender, description }),
      })
      const data = await res.json()
      setProfileMessage(data.success ? 'Profil spremljen!' : 'Greška pri spremanju.')
    } catch {
      setProfileMessage('Mrežna greška.')
    }
    setProfileSaving(false)
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '2px solid #000000',
    padding: '1.5rem',
    boxShadow: '4px 4px 0 #000000',
  }

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #000000',
    fontSize: '1rem',
    boxSizing: 'border-box',
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.75rem 1.5rem',
    backgroundColor: active ? '#000000' : '#ffffff',
    color: active ? '#ffffff' : '#000000',
    border: '2px solid #000000',
    fontWeight: '600',
    cursor: 'pointer',
    marginRight: '-2px',
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #000000', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Čistač: {userName}</h1>
        <button onClick={onLogout} style={{ ...buttonStyle, backgroundColor: '#dc2626' }}>Odjava</button>
      </header>

      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex' }}>
          <button style={tabStyle(activeTab === 'available')} onClick={() => setActiveTab('available')}>Dostupni Poslovi</button>
          <button style={tabStyle(activeTab === 'my')} onClick={() => setActiveTab('my')}>Moji Poslovi</button>
          <button style={tabStyle(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>Moj Profil</button>
        </div>

        {activeTab === 'available' && (
          <>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Dostupni poslovi ({availableJobs.length})</h2>
            {availableJobs.length === 0 ? (
              <p style={{ color: '#64748b' }}>Nema dostupnih poslova.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {availableJobs.map((job) => (
                  <div key={job.id} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{job.title}</h3>
                        <p style={{ margin: '0 0 0.25rem 0', color: '#64748b' }}>{job.location}</p>
                        <p style={{ margin: '0', fontWeight: '700', fontSize: '1.25rem' }}>{Number(job.price).toFixed(2)} EUR</p>
                      </div>
                      <button onClick={() => handleAccept(job.id)} disabled={accepting === job.id} style={{ ...buttonStyle, backgroundColor: '#16a34a' }}>
                        {accepting === job.id ? 'Prihvaćam...' : 'Prihvati'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'my' && (
          <>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Moji prihvaćeni poslovi ({myJobs.length})</h2>
            {myJobs.length === 0 ? (
              <p style={{ color: '#64748b' }}>Niste prihvatili nijedan posao.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myJobs.map((job) => (
                  <div key={job.id} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{job.title}</h3>
                        <p style={{ margin: '0 0 0.25rem 0', color: '#64748b' }}>{job.location}</p>
                        <p style={{ margin: '0', fontWeight: '700' }}>{Number(job.price).toFixed(2)} EUR</p>
                      </div>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: job.status === 'waiting_for_client' ? '#dbeafe' : '#d1fae5',
                        color: job.status === 'waiting_for_client' ? '#1e40af' : '#065f46',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        border: '2px solid #000000',
                      }}>
                        {job.status === 'waiting_for_client' ? 'Čeka potvrdu klijenta' : 'Potvrđen'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'profile' && (
          <div style={cardStyle}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Moj Profil</h2>
            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Telefon</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+385 91 234 5678" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Spol</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
                  <option value="">Odaberi...</option>
                  <option value="male">Muško</option>
                  <option value="female">Žensko</option>
                  <option value="other">Ostalo</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Opis</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Recite nešto o sebi, iskustvu..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              {profileMessage && <p style={{ color: profileMessage.includes('Greška') ? '#dc2626' : '#16a34a', marginBottom: '1rem' }}>{profileMessage}</p>}
              <button type="submit" disabled={profileSaving} style={buttonStyle}>{profileSaving ? 'Spremam...' : 'Spremi profil'}</button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
