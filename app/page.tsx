'use client'

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
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role') as 'client' | 'cleaner' | null
    if (storedRole) {
      setUserRole(storedRole)
      setView('dashboard')
    }
  }, [])

  const handleLoginSuccess = (user: User) => {
    localStorage.setItem('user_role', user.role)
    localStorage.setItem('user_id', user.id.toString())
    localStorage.setItem('user_email', user.email)
    setUserRole(user.role)
    setView('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_email')
    setUserRole(null)
    setView('auth')
  }

  if (view === 'auth') {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />
  }

  if (view === 'dashboard' && userRole === 'client') {
    return <ClientDashboard onLogout={handleLogout} jobs={jobs} setJobs={setJobs} />
  }

  if (view === 'dashboard' && userRole === 'cleaner') {
    return <CleanerDashboard onLogout={handleLogout} jobs={jobs} />
  }

  return null
}

function ClientDashboard({ onLogout, jobs, setJobs }: { onLogout: () => void; jobs: Job[]; setJobs: (jobs: Job[]) => void }) {
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
        setTitle('')
        setLocation('')
        setPrice('')
        const jobsRes = await fetch('/api/jobs?role=client')
        const jobsData = await jobsRes.json()
        setJobs(jobsData.jobs || [])
      } else {
        setError(data.error || 'Greska')
      }
    } catch {
      setError('Mrezna greska')
    }
    setSubmitting(false)
  }

  const handleLoad = async () => {
    const jobsRes = await fetch('/api/jobs?role=client')
    const jobsData = await jobsRes.json()
    setJobs(jobsData.jobs || [])
  }

  useEffect(() => {
    handleLoad()
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Moji poslovi</h1>
          <button onClick={onLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Odjava</button>
        </div>

        <form onSubmit={handleCreateJob} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2>Objavi novi posao</h2>
          <input type="text" placeholder="Naslov" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
          <input type="text" placeholder="Lokacija" value={location} onChange={(e) => setLocation(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
          <input type="number" placeholder="Cijena (EUR)" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={submitting} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{submitting ? 'Objavljujem...' : 'Objavi posao'}</button>
        </form>

        <div>
          <h2>Objavljeni poslovi</h2>
          {jobs.length === 0 ? (
            <p>Nema objavljenih poslova</p>
          ) : (
            jobs.map((j) => (
              <div key={j.id} style={{ backgroundColor: 'white', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                <div style={{ fontWeight: 'bold' }}>{j.title}</div>
                <div>Lokacija: {j.location}</div>
                <div>Cijena: {j.price} EUR</div>
                <div>Status: {j.status}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function CleanerDashboard({ onLogout, jobs }: { onLogout: () => void; jobs: Job[] }) {
  const [jobsList, setJobsList] = useState<Job[]>(jobs)

  useEffect(() => {
    const loadJobs = async () => {
      const res = await fetch('/api/jobs?role=cleaner')
      const data = await res.json()
      setJobsList(data.jobs || [])
    }
    loadJobs()
  }, [])

  const handleAccept = async (jobId: number) => {
    try {
      await fetch('/api/jobs/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
      setJobsList(jobsList.filter((j) => j.id !== jobId))
    } catch {
      console.error('Greska pri prihvacanju posla')
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Dostupni poslovi</h1>
          <button onClick={onLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Odjava</button>
        </div>

        {jobsList.length === 0 ? (
          <p>Nema dostupnih poslova</p>
        ) : (
          jobsList.map((j) => (
            <div key={j.id} style={{ backgroundColor: 'white', padding: '1.5rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{j.title}</div>
              <div>Lokacija: {j.location}</div>
              <div>Cijena: {j.price} EUR</div>
              <button onClick={() => handleAccept(j.id)} style={{ marginTop: '1rem', backgroundColor: '#10b981', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Prihvati posao</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
