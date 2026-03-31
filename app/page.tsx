'use client'
// Build: 2026-03-31-v3-fixed

import React, { useState, useEffect, useLayoutEffect } from 'react'
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
  const [view, setView] = useState<'auth' | 'dashboard'>('auth')
  const [userRole, setUserRole] = useState<'client' | 'cleaner' | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showCookieBanner, setShowCookieBanner] = useState(false)

  useLayoutEffect(() => {
    // Prvo provjeri localStorage prije rendera
    const storedRole = localStorage.getItem('user_role') as 'client' | 'cleaner' | null
    const storedName = localStorage.getItem('user_email') || ''
    const hasConsent = localStorage.getItem('cookie_consent')
    
    if (!hasConsent) {
      setShowCookieBanner(true)
    }
    
    if (storedRole) {
      setUserRole(storedRole)
      setUserName(storedName)
      setView('dashboard')
    }
    setIsCheckingAuth(false)
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

  // Ne prikazuj ništa dok provjeravamo auth
  if (isCheckingAuth) {
    return (
      <>
        <CookieBanner onConsent={() => setShowCookieBanner(false)} />
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#0a0a0a', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ color: '#10b981', fontSize: '1.25rem' }}>Učitavanje...</div>
        </div>
      </>
    )
  }

  if (view === 'auth') {
    return (
      <>
        <CookieBanner onConsent={() => setShowCookieBanner(false)} />
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      </>
    )
  }

  if (view === 'dashboard' && userRole === 'client') {
    return <ClientDashboard onLogout={handleLogout} jobs={jobs} setJobs={setJobs} userName={userName} />
  }

  if (view === 'dashboard' && userRole === 'cleaner') {
    return <CleanerDashboard onLogout={handleLogout} userName={userName} />
  }

  return null
}

function ClientDashboard({ onLogout, jobs, setJobs, userName }: { onLogout: () => void; jobs: Job[]; setJobs: (jobs: Job[]) => void; userName: string }) {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobsRes = await fetch('/api/jobs?role=client')
        const jobsData = await jobsRes.json()
        setJobs(jobsData.jobs || [])
      } catch {
        // Ignoriraj grešku
      }
    }
    loadJobs()
  }, [setJobs])

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
        setError(data.error || 'Greška pri objavi')
      }
    } catch {
      setError('Mrežna greška')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#e5e5e5' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#111111', 
        borderBottom: '1px solid #1f1f1f',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#10b981', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            S
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ffffff' }}>SJAJ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#a3a3a3' }}>{userName}</span>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            Odjava
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#ffffff', 
          marginBottom: '2rem' 
        }}>
          Dashboard Klijenta
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Form za objavljivanje posla */}
          <div style={{
            backgroundColor: '#111111',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid #1f1f1f'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#10b981', 
              marginTop: 0, 
              marginBottom: '1.5rem' 
            }}>
              Objavi novi posao
            </h2>
            <form onSubmit={handleCreateJob}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#a3a3a3', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  NASLOV POSLA
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="npr. Čišćenje stana"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #262626',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    color: '#ffffff',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#a3a3a3', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  LOKACIJA
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="npr. Zagreb, Centar"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #262626',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    color: '#ffffff',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#a3a3a3', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  CIJENA (EUR)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  step="0.01"
                  placeholder="50.00"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #262626',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    color: '#ffffff',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
              {error && (
                <div style={{ 
                  color: '#ef4444', 
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  backgroundColor: '#10b981',
                  color: '#000000',
                  border: 'none',
                  padding: '0.875rem',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {submitting ? 'Objavljujem...' : 'Objavi posao'}
              </button>
            </form>
          </div>

          {/* Lista poslova */}
          <div style={{
            backgroundColor: '#111111',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid #1f1f1f',
            maxHeight: '500px',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#10b981', 
              marginTop: 0, 
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              Vaši poslovi
              <span style={{ 
                backgroundColor: '#10b981', 
                color: '#000000', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px',
                fontSize: '0.875rem'
              }}>
                {jobs.length}
              </span>
            </h2>
            {jobs.length === 0 ? (
              <p style={{ color: '#525252', textAlign: 'center', paddingTop: '2rem' }}>
                Još niste objavili niti jedan posao.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      backgroundColor: '#0a0a0a',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid #262626'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ color: '#ffffff', fontWeight: '600', margin: 0, fontSize: '1rem' }}>{job.title}</h3>
                      <span style={{
                        backgroundColor: job.status === 'open' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: job.status === 'open' ? '#10b981' : '#3b82f6',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {job.status === 'open' ? 'Otvoreno' : 'Prihvaćeno'}
                      </span>
                    </div>
                    <p style={{ color: '#a3a3a3', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>{job.location}</p>
                    <p style={{ color: '#10b981', fontWeight: '600', margin: '0.5rem 0 0 0' }}>{job.price.toFixed(2)} EUR</p>
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

function CleanerDashboard({ onLogout, userName }: { onLogout: () => void; userName: string }) {
  const [jobsList, setJobsList] = useState<Job[]>([])

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
        setJobsList(jobsList.filter((j) => j.id !== jobId))
      }
    } catch {
      // Ignoriraj grešku
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#e5e5e5' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#111111', 
        borderBottom: '1px solid #1f1f1f',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#10b981', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            color: '#000000',
            fontWeight: 'bold'
          }}>
            S
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ffffff' }}>SJAJ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#a3a3a3' }}>{userName}</span>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Odjava
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#ffffff', 
          marginBottom: '2rem' 
        }}>
          Dostupni poslovi
        </h1>

        <div style={{
          backgroundColor: '#111111',
          padding: '1.5rem',
          borderRadius: '1rem',
          border: '1px solid #1f1f1f'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#10b981', 
              margin: 0
            }}>
              Poslovi na čekanju
            </h2>
            <span style={{ 
              backgroundColor: '#10b981', 
              color: '#000000', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {jobsList.length}
            </span>
          </div>
          
          {jobsList.length === 0 ? (
            <p style={{ color: '#525252', textAlign: 'center', paddingTop: '2rem' }}>
              Trenutno nema dostupnih poslova.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {jobsList.map((job) => (
                <div
                  key={job.id}
                  style={{
                    backgroundColor: '#0a0a0a',
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #262626'
                  }}
                >
                  <h3 style={{ color: '#ffffff', fontWeight: '600', margin: '0 0 0.5rem 0' }}>{job.title}</h3>
                  <p style={{ color: '#a3a3a3', margin: '0.25rem 0', fontSize: '0.875rem' }}>{job.location}</p>
                  <p style={{ color: '#10b981', fontWeight: '700', margin: '0.75rem 0', fontSize: '1.25rem' }}>{job.price.toFixed(2)} EUR</p>
                  <button
                    onClick={() => handleAccept(job.id)}
                    style={{
                      width: '100%',
                      backgroundColor: '#10b981',
                      color: '#000000',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Prihvati posao
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
