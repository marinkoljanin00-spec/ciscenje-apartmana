'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

const t = { bg: '#050505', bgCard: '#0a0a0a', card: '#111111', border: '#1f1f1f', text: '#ffffff', textMuted: '#a3a3a3', textDim: '#737373', accent: '#10b981', accentGlow: 'rgba(16, 185, 129, 0.15)', urgent: '#ef4444' }
const inputStyle = { width: '100%', padding: '14px 16px', background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const }
const btnPrimary = { padding: '14px 28px', background: t.accent, border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer' }
const cardStyle = { background: t.card, border: `1px solid ${t.border}`, borderRadius: 16 }

type Ticket = { id: number; name: string; email: string; subject: string; message: string; status: string; created_at: string }
type Stats = { users: any[]; jobs: any[]; reviews: any; tickets: any[]; recentJobs: any[]; topCleaners: any[] }

export default function AdminDashboard() {
  const [key, setKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [tab, setTab] = useState<'overview' | 'tickets' | 'slike'>('overview')
  const [pendingImages, setPendingImages] = useState<{
    id: number
    email: string
    full_name: string
    role: string
    image_pending: string
  }[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [approvingId, setApprovingId] = useState<number | null>(null)

  const loadPendingImages = useCallback(async () => {
    setLoadingImages(true)
    try {
      const res = await fetch('/api/admin/pending-images')
      const data = await res.json()
      setPendingImages(data.users || [])
    } catch {}
    setLoadingImages(false)
  }, [])

  const handleImageDecision = async (userId: number, approve: boolean) => {
    setApprovingId(userId)
    try {
      await fetch('/api/admin/approve-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approve })
      })
      setPendingImages(prev => prev.filter(u => u.id !== userId))
    } catch {}
    setApprovingId(null)
  }

  const authenticate = useCallback(async () => {
    if (key !== 'SjajGazda99') {
      setError('Pogrešna šifra')
      return
    }
    setLoading(true)
    setError('')
    
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        fetch(`/api/admin?adminKey=${key}`),
        fetch(`/api/support?adminKey=${key}`)
      ])
      
      if (statsRes.ok && ticketsRes.ok) {
        const statsData = await statsRes.json()
        const ticketsData = await ticketsRes.json()
        setStats(statsData)
        setTickets(ticketsData.tickets || [])
        setAuthenticated(true)
        loadPendingImages()
      } else {
        setError('Greška pri dohvaćanju podataka')
      }
    } catch {
      setError('Mrežna greška')
    }
    setLoading(false)
  }, [key])

  const updateTicketStatus = async (ticketId: number, status: string) => {
    await fetch('/api/support', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, status, adminKey: key })
    })
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status } : t))
  }

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400, ...cardStyle, padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, background: t.accentGlow, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ fontSize: 24 }}>🔐</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: t.text, margin: '0 0 8px 0' }}>Admin Panel</h1>
            <p style={{ color: t.textMuted, fontSize: 14, margin: 0 }}>Unesite administratorsku šifru</p>
          </div>

          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${t.urgent}`, padding: 14, marginBottom: 20, borderRadius: 10, color: t.urgent, fontSize: 14 }}>{error}</div>}

          <form onSubmit={(e) => { e.preventDefault(); authenticate() }}>
            <input 
              type="password" 
              value={key} 
              onChange={e => setKey(e.target.value)} 
              placeholder="Šifra..." 
              style={{ ...inputStyle, marginBottom: 16 }}
            />
            <button type="submit" disabled={loading} style={{ ...btnPrimary, width: '100%', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Provjera...' : 'Pristupi'}
            </button>
          </form>

          <Link href="/" style={{ display: 'block', textAlign: 'center', marginTop: 24, color: t.textMuted, fontSize: 13, textDecoration: 'none' }}>← Povratak na početnu</Link>
        </div>
      </div>
    )
  }

  const clientCount = stats?.users?.find((u: any) => u.role === 'client')?.count || 0
  const cleanerCount = stats?.users?.find((u: any) => u.role === 'cleaner')?.count || 0
  const totalJobs = stats?.jobs?.reduce((acc: number, j: any) => acc + Number(j.count), 0) || 0
  const totalRevenue = stats?.jobs?.reduce((acc: number, j: any) => acc + Number(j.total || 0), 0) || 0
  const avgRating = Number(stats?.reviews?.avg_rating || 0).toFixed(1)
  const openTickets = tickets.filter(t => t.status === 'open').length

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text }}>
      <header style={{ padding: '16px 24px', borderBottom: `1px solid ${t.border}`, background: t.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 800, fontSize: 20, color: t.accent }}>TvojČistač</span>
          <span style={{ color: t.textDim, fontSize: 14 }}>Admin Dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('overview')} style={{ padding: '8px 16px', background: tab === 'overview' ? t.accentGlow : 'transparent', border: `1px solid ${tab === 'overview' ? t.accent : t.border}`, borderRadius: 8, color: tab === 'overview' ? t.accent : t.textMuted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Pregled</button>
          <button onClick={() => setTab('tickets')} style={{ padding: '8px 16px', background: tab === 'tickets' ? t.accentGlow : 'transparent', border: `1px solid ${tab === 'tickets' ? t.accent : t.border}`, borderRadius: 8, color: tab === 'tickets' ? t.accent : t.textMuted, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            Podrška {openTickets > 0 && <span style={{ background: t.urgent, color: '#fff', fontSize: 11, padding: '2px 6px', borderRadius: 100 }}>{openTickets}</span>}
          </button>
          <button onClick={() => setTab('slike')} style={{ padding: '8px 16px', background: tab === 'slike' ? t.accentGlow : 'transparent', border: `1px solid ${tab === 'slike' ? t.accent : t.border}`, borderRadius: 8, color: tab === 'slike' ? t.accent : t.textMuted, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            Slike {pendingImages.length > 0 && <span style={{ background: t.urgent, color: '#fff', fontSize: 11, padding: '2px 6px', borderRadius: 100 }}>{pendingImages.length}</span>}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {tab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Klijenti', value: clientCount, color: t.accent },
                { label: 'Čistači', value: cleanerCount, color: '#3b82f6' },
                { label: 'Ukupno poslova', value: totalJobs, color: '#8b5cf6' },
                { label: 'Ukupni promet', value: `${totalRevenue}€`, color: '#f59e0b' },
                { label: 'Prosječna ocjena', value: avgRating, color: '#ec4899' },
                { label: 'Otvoreni tiketi', value: openTickets, color: t.urgent }
              ].map((s, i) => (
                <div key={i} style={{ ...cardStyle, padding: 24 }}>
                  <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Recent Jobs & Top Cleaners */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ ...cardStyle, padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px 0' }}>Nedavni poslovi</h3>
                {stats?.recentJobs?.length === 0 ? (
                  <p style={{ color: t.textMuted }}>Nema poslova</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {stats?.recentJobs?.slice(0, 5).map((job: any) => (
                      <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: t.bgCard, borderRadius: 10 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{job.title}</div>
                          <div style={{ fontSize: 12, color: t.textDim }}>{job.client_name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: t.accent }}>{job.price}€</div>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: job.status === 'open' ? t.accentGlow : job.status === 'reviewed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)', color: job.status === 'open' ? t.accent : job.status === 'reviewed' ? t.accent : '#3b82f6' }}>{job.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ ...cardStyle, padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px 0' }}>Top čistači</h3>
                {stats?.topCleaners?.length === 0 ? (
                  <p style={{ color: t.textMuted }}>Nema čistača</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {stats?.topCleaners?.map((cleaner: any, i: number) => (
                      <div key={cleaner.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: t.bgCard, borderRadius: 10 }}>
                        <div style={{ width: 32, height: 32, background: i === 0 ? '#f59e0b' : i === 1 ? '#a1a1aa' : i === 2 ? '#cd7f32' : t.border, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: i < 3 ? '#000' : t.textMuted }}>{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{cleaner.full_name}</div>
                          <div style={{ fontSize: 12, color: t.textDim }}>{cleaner.review_count} recenzija</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: '#f59e0b' }}>⭐ {Number(cleaner.rating).toFixed(1)}</div>
                          <div style={{ fontSize: 12, color: t.accent }}>{cleaner.total_earned}€</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {tab === 'tickets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Tiketi podrške</h2>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: 8, color: t.urgent, fontSize: 14, fontWeight: 600 }}>{openTickets} otvorenih</span>
                <span style={{ padding: '8px 16px', background: t.accentGlow, borderRadius: 8, color: t.accent, fontSize: 14, fontWeight: 600 }}>{tickets.filter(t => t.status === 'resolved').length} riješenih</span>
              </div>
            </div>

            {tickets.length === 0 ? (
              <div style={{ ...cardStyle, padding: 48, textAlign: 'center' }}>
                <p style={{ color: t.textMuted }}>Nema tiketa</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {tickets.map(ticket => (
                  <div key={ticket.id} style={{ ...cardStyle, padding: 24, borderLeftWidth: 4, borderLeftColor: ticket.status === 'open' ? t.urgent : t.accent }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: ticket.status === 'open' ? 'rgba(239, 68, 68, 0.15)' : t.accentGlow, color: ticket.status === 'open' ? t.urgent : t.accent }}>{ticket.status === 'open' ? 'OTVOREN' : 'RIJEŠEN'}</span>
                          <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: t.bgCard, color: t.textMuted }}>{ticket.subject}</span>
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>{ticket.name}</h4>
                        <a href={`mailto:${ticket.email}`} style={{ color: t.accent, fontSize: 13, textDecoration: 'none' }}>{ticket.email}</a>
                      </div>
                      <div style={{ fontSize: 12, color: t.textDim }}>{new Date(ticket.created_at).toLocaleDateString('hr-HR')}</div>
                    </div>
                    
                    <div style={{ padding: 16, background: t.bgCard, borderRadius: 10, marginBottom: 16, color: t.text, fontSize: 14, lineHeight: 1.6 }}>{ticket.message}</div>
                    
                    <div style={{ display: 'flex', gap: 12 }}>
                      {ticket.status === 'open' ? (
                        <button onClick={() => updateTicketStatus(ticket.id, 'resolved')} style={{ ...btnPrimary, padding: '10px 20px', fontSize: 13 }}>Označi kao riješeno</button>
                      ) : (
                        <button onClick={() => updateTicketStatus(ticket.id, 'open')} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, color: t.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Ponovo otvori</button>
                      )}
                      <a href={`mailto:${ticket.email}?subject=Re: Vaša prijava na TvojČistač`} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, color: t.textMuted, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Odgovori</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'slike' && (
          <div>
            <h3 style={{ color: t.text, fontSize: 18, fontWeight: 700, margin: '0 0 20px 0' }}>
              Slike na čekanju ({pendingImages.length})
            </h3>
            
            {loadingImages ? (
              <div style={{ textAlign: 'center', padding: 60, color: t.textMuted }}>
                Učitavam...
              </div>
            ) : pendingImages.length === 0 ? (
              <div style={{ ...cardStyle, padding: 60, textAlign: 'center' }}>
                <p style={{ color: t.textMuted, margin: 0 }}>Nema slika na čekanju</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingImages.map(user => (
                  <div key={user.id} style={{ 
                    ...cardStyle, padding: 20,
                    display: 'flex', alignItems: 'center', gap: 16 
                  }}>
                    <img
                      src={user.image_pending}
                      alt={user.full_name}
                      style={{ 
                        width: 80, height: 80, borderRadius: '50%',
                        objectFit: 'cover', 
                        border: `2px solid ${t.accent}`,
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: t.text, fontWeight: 700, fontSize: 15 }}>
                        {user.full_name}
                      </div>
                      <div style={{ color: t.textMuted, fontSize: 13 }}>
                        {user.email}
                      </div>
                      <span style={{
                        display: 'inline-block', marginTop: 6,
                        fontSize: 11, fontWeight: 600,
                        padding: '2px 10px', borderRadius: 100,
                        background: user.role === 'cleaner' 
                          ? 'rgba(16,185,129,0.1)' 
                          : 'rgba(59,130,246,0.1)',
                        color: user.role === 'cleaner' ? t.accent : '#3b82f6'
                      }}>
                        {user.role === 'cleaner' ? 'Čistač' : 'Klijent'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleImageDecision(user.id, true)}
                        disabled={approvingId === user.id}
                        style={{
                          ...btnPrimary, padding: '10px 20px', fontSize: 13,
                          opacity: approvingId === user.id ? 0.7 : 1
                        }}
                      >
                        Odobri
                      </button>
                      <button
                        onClick={() => handleImageDecision(user.id, false)}
                        disabled={approvingId === user.id}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid #ef4444',
                          borderRadius: 10, padding: '10px 20px',
                          color: '#ef4444', fontSize: 13,
                          fontWeight: 600, cursor: 'pointer',
                          opacity: approvingId === user.id ? 0.7 : 1
                        }}
                      >
                        Odbij
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
