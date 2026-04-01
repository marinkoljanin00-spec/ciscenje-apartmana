'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

const ADMIN_KEY = 'SjajGazda99'

const t = {
  bg: '#0a0a0a',
  bgCard: '#141414',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  textDim: '#71717a',
  accent: '#10b981',
  border: '#27272a',
  urgent: '#ef4444'
}

interface Stats {
  totalUsers: number
  totalCleaners: number
  totalClients: number
  totalJobs: number
  completedJobs: number
  totalRevenue: number
  openTickets: number
  avgRating: string
}

interface Ticket {
  id: number
  name: string
  email: string
  subject: string
  message: string
  status: 'open' | 'resolved'
  created_at: string
}

interface Job {
  id: number
  title: string
  price: number
  status: string
  created_at: string
  client_name: string
}

export default function AdminDashboard() {
  const [key, setKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'overview' | 'tickets'>('overview')
  
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch stats
      const statsRes = await fetch(`/api/admin?adminKey=${ADMIN_KEY}`)
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
        setRecentJobs(data.recentJobs || [])
      }

      // Fetch tickets
      const ticketsRes = await fetch(`/api/support?adminKey=${ADMIN_KEY}`)
      if (ticketsRes.ok) {
        const data = await ticketsRes.json()
        setTickets(data.tickets || [])
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (key !== ADMIN_KEY) {
      setError('Pogrešna šifra')
      return
    }
    setAuthenticated(true)
    setError('')
    fetchData()
  }

  const updateTicketStatus = async (ticketId: number, status: 'open' | 'resolved') => {
    try {
      await fetch('/api/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status, adminKey: ADMIN_KEY })
      })
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  // Login screen
  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: t.bgCard, padding: 32, borderRadius: 16, border: `1px solid ${t.border}`, width: '100%', maxWidth: 400 }}>
          <Link href="/" style={{ fontSize: 24, fontWeight: 800, color: t.accent, textDecoration: 'none', display: 'block', textAlign: 'center', marginBottom: 24 }}>sjaj.hr</Link>
          <h1 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>Admin Panel</h1>
          
          <form onSubmit={handleLogin}>
            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${t.urgent}`, borderRadius: 8, padding: 12, color: t.urgent, fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                {error}
              </div>
            )}
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Tajna šifra</label>
              <input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="Unesite admin šifru"
                style={{ width: '100%', padding: '12px 16px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 15 }}
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '14px 24px', background: t.accent, border: 'none', borderRadius: 8, color: '#000', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
            >
              Prijava
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text }}>
      {/* Header */}
      <header style={{ padding: '16px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/" style={{ fontSize: 24, fontWeight: 800, color: t.accent, textDecoration: 'none' }}>sjaj.hr</Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setTab('overview')}
              style={{
                padding: '8px 16px',
                background: tab === 'overview' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                border: `1px solid ${tab === 'overview' ? t.accent : t.border}`,
                borderRadius: 8,
                color: tab === 'overview' ? t.accent : t.textMuted,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              Pregled
            </button>
            <button
              onClick={() => setTab('tickets')}
              style={{
                padding: '8px 16px',
                background: tab === 'tickets' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                border: `1px solid ${tab === 'tickets' ? t.accent : t.border}`,
                borderRadius: 8,
                color: tab === 'tickets' ? t.accent : t.textMuted,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              Podrška
              {tickets.filter(t => t.status === 'open').length > 0 && (
                <span style={{ background: t.urgent, color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 100 }}>
                  {tickets.filter(t => t.status === 'open').length}
                </span>
              )}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={fetchData} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, color: t.textMuted, fontSize: 13, cursor: 'pointer' }}>
            Osvježi
          </button>
          <button onClick={() => setAuthenticated(false)} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, color: t.textMuted, fontSize: 13, cursor: 'pointer' }}>
            Odjava
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ color: t.textMuted }}>Učitavanje...</div>
          </div>
        ) : tab === 'overview' && stats ? (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Ukupno korisnika', value: stats.totalUsers, color: t.accent },
                { label: 'Čistači', value: stats.totalCleaners, color: '#3b82f6' },
                { label: 'Klijenti', value: stats.totalClients, color: '#8b5cf6' },
                { label: 'Ukupno poslova', value: stats.totalJobs, color: '#f59e0b' },
                { label: 'Završenih', value: stats.completedJobs, color: t.accent },
                { label: 'Promet (€)', value: stats.totalRevenue, color: '#10b981' },
                { label: 'Prosječna ocjena', value: stats.avgRating, color: '#eab308' },
                { label: 'Otvorenih tiketa', value: stats.openTickets, color: stats.openTickets > 0 ? t.urgent : t.accent }
              ].map((stat, i) => (
                <div key={i} style={{ background: t.bgCard, padding: 20, borderRadius: 12, border: `1px solid ${t.border}` }}>
                  <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 8 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Recent Jobs */}
            <div style={{ background: t.bgCard, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Nedavni poslovi</h3>
              {recentJobs.length === 0 ? (
                <p style={{ color: t.textMuted }}>Nema poslova</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recentJobs.map(job => (
                    <div key={job.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: t.bg, borderRadius: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{job.title}</div>
                        <div style={{ fontSize: 13, color: t.textMuted }}>{job.client_name || 'Nepoznat klijent'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: t.accent }}>{job.price} €</div>
                        <div style={{ fontSize: 12, color: t.textMuted }}>{job.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : tab === 'tickets' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Centar za podršku</h2>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, color: t.urgent, fontSize: 14, fontWeight: 600 }}>
                  {tickets.filter(t => t.status === 'open').length} otvorenih
                </span>
                <span style={{ padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, color: t.accent, fontSize: 14, fontWeight: 600 }}>
                  {tickets.filter(t => t.status === 'resolved').length} riješenih
                </span>
              </div>
            </div>

            {tickets.length === 0 ? (
              <div style={{ background: t.bgCard, borderRadius: 16, padding: 48, textAlign: 'center', border: `1px solid ${t.border}` }}>
                <p style={{ color: t.textMuted, fontSize: 16, margin: 0 }}>Nema prijava za podršku</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {tickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    style={{ 
                      background: t.bgCard, 
                      borderRadius: 16, 
                      padding: 24, 
                      border: `1px solid ${ticket.status === 'open' ? t.urgent : t.border}`,
                      borderLeftWidth: 4
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: 100, 
                            fontSize: 11, 
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: ticket.status === 'open' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: ticket.status === 'open' ? t.urgent : t.accent
                          }}>
                            {ticket.status === 'open' ? 'Otvoren' : 'Riješen'}
                          </span>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: 100, 
                            fontSize: 11, 
                            fontWeight: 600,
                            background: t.bg,
                            color: t.textMuted
                          }}>
                            {ticket.subject === 'technical' ? 'Tehnički problem' : 
                             ticket.subject === 'cleaner' ? 'Problem s čistačem' : 
                             ticket.subject === 'payment' ? 'Plaćanje' : 
                             ticket.subject === 'account' ? 'Problem s računom' : 'Ostalo'}
                          </span>
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: '0 0 4px 0' }}>{ticket.name}</h4>
                        <a href={`mailto:${ticket.email}`} style={{ color: t.accent, fontSize: 13, textDecoration: 'none' }}>{ticket.email}</a>
                      </div>
                      <div style={{ fontSize: 12, color: t.textMuted }}>
                        {new Date(ticket.created_at).toLocaleDateString('hr-HR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: 16, 
                      background: t.bg, 
                      borderRadius: 10, 
                      marginBottom: 16,
                      fontSize: 14,
                      color: t.text,
                      lineHeight: 1.6
                    }}>
                      {ticket.message}
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      {ticket.status === 'open' ? (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                          style={{
                            padding: '10px 20px',
                            background: t.accent,
                            border: 'none',
                            borderRadius: 8,
                            color: '#000',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Označi kao riješeno
                        </button>
                      ) : (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'open')}
                          style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            border: `1px solid ${t.border}`,
                            borderRadius: 8,
                            color: t.textMuted,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Ponovo otvori
                        </button>
                      )}
                      <a
                        href={`mailto:${ticket.email}?subject=Re: Vaša prijava na sjaj.hr`}
                        style={{
                          padding: '10px 20px',
                          background: 'transparent',
                          border: `1px solid ${t.border}`,
                          borderRadius: 8,
                          color: t.textMuted,
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        Odgovori
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  )
}
