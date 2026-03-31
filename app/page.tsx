'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
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
}

export default function Home() {
  const [view, setView] = useState<'auth' | 'dashboard'>('auth')
  const [userRole, setUserRole] = useState<'client' | 'cleaner' | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role') as 'client' | 'cleaner' | null
    const storedName = localStorage.getItem('user_email') || ''
    if (storedRole) {
      setUserRole(storedRole)
      setUserName(storedName)
      setView('dashboard')
    }
  }, [])

  const handleLoginSuccess = (user: User) => {
    localStorage.setItem('user_role', user.role)
    localStorage.setItem('user_id', user.id.toString())
    localStorage.setItem('user_email', user.email)
    setUserRole(user.role)
    setUserName(user.email)
    setView('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_email')
    setUserRole(null)
    setUserName('')
    setView('auth')
  }

  if (view === 'auth') {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />
  }

  if (view === 'dashboard' && userRole === 'client') {
    return <ClientDashboard onLogout={handleLogout} jobs={jobs} setJobs={setJobs} userName={userName} />
  }

  if (view === 'dashboard' && userRole === 'cleaner') {
    return <CleanerDashboard onLogout={handleLogout} jobs={jobs} userName={userName} />
  }

  return null
}

function ClientDashboard({ onLogout, jobs, setJobs, userName }: { onLogout: () => void; jobs: Job[]; setJobs: (jobs: Job[]) => void; userName: string }) {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, location, price: parseFloat(price) }),
      })
      const data = await res.json()
      if (data.success) {
        // Optimistic UI - dodaj novi posao odmah na listu bez refresha
        const newJob: Job = {
          id: Date.now(),
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
        setError(data.error || 'Greška pri objavi')
      }
    } catch {
      setError('Mrežna greška')
    }
    setSubmitting(false)
  }

  const handleLoad = async () => {
    try {
      const jobsRes = await fetch('/api/jobs?role=client')
      const jobsData = await jobsRes.json()
      setJobs(jobsData.jobs || [])
    } catch {
      // Ignoriraj grešku pri učitavanju
    }
  }

  useEffect(() => {
    handleLoad()
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
          Dobrodošli, {userName.split('@')[0]}! 👋
        </h1>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: '#e2e8f0',
            color: '#1e293b',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Odjavi se
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Form za objavljivanje posla */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginTop: 0, marginBottom: '1rem' }}>
            📋 Objavi novi posao
          </h2>
          <form onSubmit={handleCreateJob}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '0.5rem' }}>
                Naslov
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '0.5rem' }}>
                Lokacija
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '0.5rem' }}>
                Cijena (EUR)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                step="0.01"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {error && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>❌ {error}</div>}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Objavljujem...' : '✅ Objavi posao'}
            </button>
          </form>
        </div>

        {/* Lista poslova */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            maxHeight: '600px',
            overflowY: 'auto',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginTop: 0, marginBottom: '1rem' }}>
            📌 Vaši poslovi ({jobs.length})
          </h2>
          {jobs.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', paddingTop: '1rem' }}>Još niste objavili niti jedan posao.</p>
          ) : (
            <div>
              {jobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    backgroundColor: '#f1f5f9',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    marginBottom: '0.75rem',
                    borderLeft: '4px solid #4f46e5',
                  }}
                >
                  <h3 style={{ color: '#1e293b', fontWeight: '600', margin: '0 0 0.5rem 0' }}>🧹 {job.title}</h3>
                  <p style={{ color: '#64748b', margin: '0.25rem 0' }}>📍 {job.location}</p>
                  <p style={{ color: '#1e293b', fontWeight: '600', margin: '0.25rem 0' }}>💶 {job.price.toFixed(2)} EUR</p>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    ✓ {job.status === 'open' ? 'Otvoreno' : 'Prihvaćeno'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CleanerDashboard({ onLogout, jobs, userName }: { onLogout: () => void; jobs: Job[]; userName: string }) {
  const [jobsList, setJobsList] = useState<Job[]>(jobs)

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobsRes = await fetch('/api/jobs?role=cleaner')
        const jobsData = await jobsRes.json()
        setJobsList(jobsData.jobs || [])
      } catch {
        // Ignoriraj grešku
      }
    }
    loadJobs()
  }, [])

  const handleAccept = async (jobId: number) => {
    try {
      const res = await fetch('/api/jobs/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
      const data = await res.json()
      if (data.success) {
        // Optimistic UI - ukloni posao sa liste
        setJobsList(jobsList.filter((j) => j.id !== jobId))
      }
    } catch {
      // Ignoriraj grešku
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
          Dobrodošli, {userName.split('@')[0]}! 👋
        </h1>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: '#e2e8f0',
            color: '#1e293b',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Odjavi se
        </button>
      </div>

      {/* Dostupni poslovi */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginTop: 0, marginBottom: '1rem' }}>
          🏠 Dostupni poslovi ({jobsList.length})
        </h2>
        {jobsList.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', paddingTop: '1rem' }}>Trenutno nema dostupnih poslova.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {jobsList.map((job) => (
              <div
                key={job.id}
                style={{
                  backgroundColor: '#f1f5f9',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h3 style={{ color: '#1e293b', fontWeight: '600', margin: '0 0 0.5rem 0' }}>🧹 {job.title}</h3>
                <p style={{ color: '#64748b', margin: '0.25rem 0' }}>📍 {job.location}</p>
                <p style={{ color: '#1e293b', fontWeight: '600', margin: '0.75rem 0' }}>💶 {job.price.toFixed(2)} EUR</p>
                <button
                  onClick={() => handleAccept(job.id)}
                  style={{
                    width: '100%',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  ✓ Prihvati posao
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
