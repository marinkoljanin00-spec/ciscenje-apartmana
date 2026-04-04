'use client'
import { useState, useEffect, useMemo } from 'react'
import { t, cardStyle, btnPrimary, btnSecondary, selectStyle, CROATIAN_CITIES, Job, Application, Stats } from './shared'

// ═══════════════════════════════════════════════════════════════
// CLEANER DASHBOARD - Dark Emerald Theme
// ═══════════════════════════════════════════════════════════════
export function CleanerDash({ logout, name, uid }: { logout: () => void; name: string; uid: string }) {
  const [tab, setTab] = useState<'available' | 'my' | 'profile'>('available')
  const [jobs, setJobs] = useState<Job[]>([])
  const [myApplications, setMyApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [filterUrgent, setFilterUrgent] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [completingId, setCompletingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    loadJobs()
    loadMyApplications()
    fetch(`/api/stats?role=cleaner&userId=${uid}`).then(r => r.json()).then(d => setStats(d))
  }, [uid])

  const loadMyApplications = () => {
    fetch(`/api/applications?cleanerId=${uid}`).then(r => r.json()).then(d => setMyApplications(d.applications || []))
  }

  const loadJobs = () => {
    let url = '/api/jobs?role=cleaner'
    if (filterUrgent) url += '&urgent=true'
    if (filterType) url += `&propertyType=${filterType}`
    fetch(url).then(r => r.json()).then(d => setJobs(d.jobs || []))
  }

  useEffect(() => { loadJobs() }, [filterUrgent, filterType])

  // Client-side city filtering using useMemo to avoid API calls on every dropdown change
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => filterCity ? job.city === filterCity : true)
  }, [jobs, filterCity])

  const applyToJob = async (jobId: number, message: string) => {
    await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId, cleanerId: uid, message }) })
    loadMyApplications()
    loadJobs()
  }

  const completeJob = async (jobId: number) => {
    setCompletingId(jobId)
    try {
      const res = await fetch('/api/jobs/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, cleanerId: uid })
      })
      const data = await res.json()
      if (data.success) {
        setToast({ message: 'Posao je oznacen kao zavrsen! Cestitamo!', type: 'success' })
        setTimeout(() => setToast(null), 5000)
        loadMyApplications()
        fetch(`/api/stats?role=cleaner&userId=${uid}`).then(r => r.json()).then(d => setStats(d))
      } else {
        setToast({ message: data.error || 'Greska', type: 'error' })
        setTimeout(() => setToast(null), 3000)
      }
    } catch {
      setToast({ message: 'Mrezna greska', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    }
    setCompletingId(null)
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
                <option value="kuca">Kuća</option>
                <option value="ured">Ured</option>
                <option value="poslovni">Poslovni prostor</option>
              </select>
              <select value={filterCity} onChange={e => setFilterCity(e.target.value)} style={{ ...selectStyle, width: 'auto' }}>
                <option value="">Svi gradovi</option>
                {CROATIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Jobs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {filteredJobs.map(job => {
                const alreadyApplied = myApplications.some(a => a.job_id === job.id)
                return (
                  <div key={job.id} style={{ ...cardStyle, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: 0 }}>{job.title}</h4>
                          {job.is_urgent && <span style={{ background: t.urgent, color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100 }}>HITNO</span>}
                          {job.city && <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100 }}>{job.city}</span>}
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
            {/* Accepted Jobs - In Progress */}
            <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 16px 0' }}>
              Prihvaceni poslovi ({myApplications.filter(a => a.status === 'accepted' && a.job_status === 'accepted').length})
            </h3>
            {myApplications.filter(a => a.status === 'accepted' && a.job_status === 'accepted').length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {myApplications.filter(a => a.status === 'accepted' && a.job_status === 'accepted').map(app => (
                  <div key={app.id} style={{ ...cardStyle, padding: 20, border: `2px solid ${t.accent}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h4 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: 0 }}>{app.title}</h4>
                          {app.is_urgent && <span style={{ background: t.urgent, color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100 }}>HITNO</span>}
                        </div>
                        <p style={{ color: t.textMuted, fontSize: 13, margin: 0 }}>{app.location}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: t.accent }}>{Number(app.price || 0).toFixed(0)} EUR</div>
                        <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                          U tijeku
                        </span>
                      </div>
                    </div>
                    
                    {/* Client Contact */}
                    <div style={{ padding: 16, background: t.accentGlow, borderRadius: 12, marginBottom: 16 }}>
                      <div style={{ fontWeight: 600, color: t.accent, marginBottom: 8, fontSize: 13 }}>Kontakt klijenta:</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ color: t.text, fontSize: 14, fontWeight: 600 }}>{app.client_name}</div>
                        {app.client_email && (
                          <a href={`mailto:${app.client_email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.textMuted, fontSize: 13, textDecoration: 'none' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            {app.client_email}
                          </a>
                        )}
                        {app.client_phone && (
                          <a href={`tel:${app.client_phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.textMuted, fontSize: 13, textDecoration: 'none' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
                            {app.client_phone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Mark as Complete Button */}
                    <button 
                      onClick={() => completeJob(app.job_id)}
                      disabled={completingId === app.job_id}
                      style={{ 
                        ...btnPrimary, 
                        width: '100%', 
                        padding: '16px 24px',
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        opacity: completingId === app.job_id ? 0.7 : 1
                      }}
                    >
                      {completingId === app.job_id ? (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/></svg>
                          Oznacavam...
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                          Oznaci kao obavljeno
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Applications */}
            <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 16px 0' }}>Prijave na cekanju ({myApplications.filter(a => a.status === 'pending').length})</h3>
            {myApplications.filter(a => a.status === 'pending').length === 0 ? (
              <div style={{ ...cardStyle, padding: 40, textAlign: 'center' }}>
                <p style={{ color: t.textMuted, margin: 0 }}>Nemate prijava na cekanju</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myApplications.filter(a => a.status === 'pending').map(app => (
                  <div key={app.id} style={{ ...cardStyle, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: '0 0 4px 0' }}>{app.title}</h4>
                        <p style={{ color: t.textMuted, fontSize: 13, margin: 0 }}>{app.location}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: t.accent }}>{Number(app.price || 0).toFixed(0)} EUR</div>
                        <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
                          Na cekanju
                        </span>
                      </div>
                    </div>
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
