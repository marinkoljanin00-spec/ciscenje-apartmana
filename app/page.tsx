'use client'

import React, { useState, useEffect } from 'react'
import AuthPage from './auth/page'
import { CookieBanner } from '@/components/CookieBanner'

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
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<'auth' | 'dashboard'>('auth')
  const [userRole, setUserRole] = useState<'client' | 'cleaner' | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [jobs, setJobs] = useState<Job[]>([])

  // Mounted check to avoid hydration errors
  useEffect(() => {
    setMounted(true)
    
    // Check localStorage after mount - PERSISTENT STATE
    const storedRole = localStorage.getItem('user_role') as 'client' | 'cleaner' | null
    const storedName = localStorage.getItem('user_email') || ''
    const storedId = localStorage.getItem('user_id') || ''
    
    if (storedRole && storedId) {
      setUserRole(storedRole)
      setUserName(storedName)
      setUserId(storedId)
      setView('dashboard')
    }
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
    setView('auth')
  }

  // Don't render until mounted - prevents hydration errors
  if (!mounted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f1f5f9', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ color: '#000000', fontSize: '1.25rem', fontWeight: '600' }}>Ucitavanje sucelja...</div>
      </div>
    )
  }

  if (view === 'auth') {
    return (
      <>
        <CookieBanner onConsent={() => {}} />
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      </>
    )
  }

  if (view === 'dashboard' && userRole === 'client') {
    return <ClientDashboard onLogout={handleLogout} jobs={jobs} setJobs={setJobs} userName={userName} userId={userId} />
  }

  if (view === 'dashboard' && userRole === 'cleaner') {
    return <CleanerDashboard onLogout={handleLogout} userName={userName} userId={userId} />
  }

  return null
}

function ClientDashboard({ onLogout, jobs, setJobs, userName, userId }: { onLogout: () => void; jobs: Job[]; setJobs: (jobs: Job[]) => void; userName: string; userId: string }) {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await fetch(`/api/jobs?role=client&userId=${userId}`)
        const data = await res.json()
        setJobs(data.jobs || [])
      } catch {
        // ignore
      }
    }
    if (userId) loadJobs()
  }, [setJobs, userId])

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
        setError(data.error || 'Greska pri objavi')
      }
    } catch {
      setError('Mrezna greska')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#ffffff', 
        border: '2px solid #000000',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#000000', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            color: '#ffffff',
            fontWeight: 'bold'
          }}>
            S
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#000000' }}>SJAJ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#525252', fontWeight: '500' }}>{userName}</span>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              border: '2px solid #000000',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Odjava
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#000000', 
          marginBottom: '2rem' 
        }}>
          Dashboard Klijenta
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Form */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '1.5rem',
            border: '2px solid #000000',
            boxShadow: '4px 4px 0 #000000'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#000000', 
              marginTop: 0, 
              marginBottom: '1.5rem' 
            }}>
              Objavi novi posao
            </h2>
            <form onSubmit={handleCreateJob}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#000000', fontWeight: '600', marginBottom: '0.5rem' }}>
                  NASLOV
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="npr. Ciscenje stana"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#ffffff',
                    border: '2px solid #000000',
                    fontSize: '1rem',
                    color: '#000000',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#000000', fontWeight: '600', marginBottom: '0.5rem' }}>
                  LOKACIJA
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="npr. Zagreb"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#ffffff',
                    border: '2px solid #000000',
                    fontSize: '1rem',
                    color: '#000000',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#000000', fontWeight: '600', marginBottom: '0.5rem' }}>
                  CIJENA (EUR)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  step="0.01"
                  placeholder="50"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#ffffff',
                    border: '2px solid #000000',
                    fontSize: '1rem',
                    color: '#000000',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {error && (
                <div style={{ 
                  color: '#dc2626', 
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '2px solid #dc2626'
                }}>
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: '2px solid #000000',
                  padding: '0.875rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? 'Objavljujem...' : 'OBJAVI POSAO'}
              </button>
            </form>
          </div>

          {/* Jobs list */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '1.5rem',
            border: '2px solid #000000',
            boxShadow: '4px 4px 0 #000000',
            maxHeight: '500px',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#000000', 
              marginTop: 0, 
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              Vasi poslovi
              <span style={{ 
                backgroundColor: '#000000', 
                color: '#ffffff', 
                padding: '0.25rem 0.75rem'
              }}>
                {jobs.length}
              </span>
            </h2>
            {jobs.length === 0 ? (
              <p style={{ color: '#525252', textAlign: 'center', paddingTop: '2rem' }}>
                Nemate objavljenih poslova.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      backgroundColor: '#f1f5f9',
                      padding: '1rem',
                      border: '2px solid #000000'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ color: '#000000', fontWeight: '700', margin: 0 }}>{job.title}</h3>
                      <span style={{
                        backgroundColor: job.status === 'open' ? '#22c55e' : '#3b82f6',
                        color: '#ffffff',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {job.status === 'open' ? 'OTVORENO' : 'PRIHVACENO'}
                      </span>
                    </div>
                    <p style={{ color: '#525252', margin: '0.5rem 0 0 0' }}>{job.location}</p>
                    <p style={{ color: '#000000', fontWeight: '700', margin: '0.5rem 0 0 0' }}>{job.price.toFixed(2)} EUR</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function CleanerDashboard({ onLogout, userName, userId }: { onLogout: () => void; userName: string; userId: string }) {
  const [jobsList, setJobsList] = useState<Job[]>([])

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await fetch('/api/jobs?role=cleaner')
        const data = await res.json()
        setJobsList(data.jobs || [])
      } catch {
        // ignore
      }
    }
    loadJobs()
  }, [])

  const handleAccept = async (jobId: number) => {
    try {
      const res = await fetch('/api/jobs/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, odrzavateljId: userId }),
      })
      const data = await res.json()
      if (data.success) {
        setJobsList(jobsList.filter((j) => j.id !== jobId))
      }
    } catch {
      // ignore
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#ffffff', 
        border: '2px solid #000000',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#000000', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            color: '#ffffff',
            fontWeight: 'bold'
          }}>
            S
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#000000' }}>SJAJ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#525252', fontWeight: '500' }}>{userName}</span>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              border: '2px solid #000000',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Odjava
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#000000', 
          marginBottom: '2rem' 
        }}>
          Dostupni poslovi
        </h1>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          border: '2px solid #000000',
          boxShadow: '4px 4px 0 #000000'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#000000', 
              margin: 0
            }}>
              Poslovi na cekanju
            </h2>
            <span style={{ 
              backgroundColor: '#000000', 
              color: '#ffffff', 
              padding: '0.25rem 0.75rem',
              fontWeight: '600'
            }}>
              {jobsList.length}
            </span>
          </div>
          
          {jobsList.length === 0 ? (
            <p style={{ color: '#525252', textAlign: 'center', paddingTop: '2rem' }}>
              Nema dostupnih poslova.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {jobsList.map((job) => (
                <div
                  key={job.id}
                  style={{
                    backgroundColor: '#f1f5f9',
                    padding: '1.25rem',
                    border: '2px solid #000000'
                  }}
                >
                  <h3 style={{ color: '#000000', fontWeight: '700', margin: '0 0 0.5rem 0' }}>{job.title}</h3>
                  <p style={{ color: '#525252', margin: '0.25rem 0' }}>{job.location}</p>
                  <p style={{ color: '#000000', fontWeight: '700', margin: '0.75rem 0', fontSize: '1.25rem' }}>{job.price.toFixed(2)} EUR</p>
                  <button
                    onClick={() => handleAccept(job.id)}
                    style={{
                      width: '100%',
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      border: '2px solid #000000',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    PRIHVATI POSAO
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
