'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { t, cardStyle, btnPrimary, btnSecondary, selectStyle, inputStyle, CROATIAN_CITIES, Job, Application, Stats } from './shared'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [completingId, setCompletingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Client review state
  const [reviewedJobIds, setReviewedJobIds] = useState<Set<number>>(new Set())
  const [clientReviewModal, setClientReviewModal] = useState<{ jobId: number; clientId: number; clientName: string } | null>(null)
  const [clientReviewRating, setClientReviewRating] = useState(5)
  const [clientReviewComment, setClientReviewComment] = useState('')
  const [submittingClientReview, setSubmittingClientReview] = useState(false)

  // My reviews state (lazy loaded)
  const [myReviews, setMyReviews] = useState<{ id: number; rating: number; comment: string; client_name: string }[]>([])
  const [reviewsLoaded, setReviewsLoaded] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)

  // Client ratings for accepted jobs
  const [clientRatings, setClientRatings] = useState<Record<number, number>>({})
  const [expandedMonthsCleaner, setExpandedMonthsCleaner] = useState<Set<string>>(new Set())

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploaded, setImageUploaded] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileData, setProfileData] = useState<{
    image_verified?: boolean;
    image_pending?: string;
    profile_image?: string;
  } | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  useEffect(() => {
    loadMyApplications()
    fetch(`/api/stats?role=cleaner&userId=${uid}`).then(r => r.json()).then(d => setStats(d))
    fetch(`/api/reviews?cleanerId=${uid}&reviewer_type=cleaner`)
      .then(r => r.json())
      .then(d => {
        const reviewed = new Set<number>(
          (d.reviews || []).map((r: { job_id: number }) => r.job_id)
        )
        setReviewedJobIds(reviewed)
      })
      .catch(() => {})
  }, [uid])

  const loadMyApplications = () => {
    fetch(`/api/applications?cleanerId=${uid}`).then(r => r.json()).then(d => setMyApplications(d.applications || []))
  }

  const loadJobs = () => {
    fetch('/api/jobs?role=cleaner')
      .then(r => r.json())
      .then(d => setJobs(d.jobs || []))
  }

  useEffect(() => { loadJobs() }, [])

  // Fetch client ratings for accepted jobs
  useEffect(() => {
    myApplications
      .filter(a => a.status === 'accepted' && a.client_id)
      .forEach(a => {
        if (a.client_id && !clientRatings[a.client_id]) {
          fetch(`/api/profile?userId=${a.client_id}`)
            .then(r => r.json())
            .then(d => {
              if (d.user?.client_rating) {
                setClientRatings(prev => ({ 
                  ...prev, 
                  [a.client_id!]: d.user.client_rating 
                }))
              }
            })
            .catch(() => {})
        }
      })
  }, [myApplications])

  // Load profile image
  useEffect(() => {
    if (profileLoaded) return
    fetch(`/api/profile?userId=${uid}`)
      .then(r => r.json())
      .then(d => {
        setProfileData(d.user)
        setProfileLoaded(true)
        if (d.user?.profile_image && d.user?.image_verified) {
          setImagePreview(d.user.profile_image)
          setImageUploaded(true)
        } else if (d.user?.image_pending) {
          setImagePreview(d.user.image_pending)
          setImageUploaded(true)
        } else {
          setImagePreview(null)
          setImageUploaded(false)
        }
      })
      .catch(() => {})
  }, [uid, profileLoaded])

  // Lazy load reviews only when profile tab is visited
  useEffect(() => {
    if (tab === 'profile' && !reviewsLoaded && !loadingReviews) {
      setLoadingReviews(true)
      fetch(`/api/reviews?cleanerId=${uid}`)
        .then(r => r.json())
        .then(d => {
          setMyReviews(d.reviews || [])
          setReviewsLoaded(true)
        })
        .finally(() => setLoadingReviews(false))
    }
  }, [tab, reviewsLoaded, loadingReviews, uid])

  // Client-side filtering using useMemo to avoid API calls on every filter change
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (filterCity && job.city !== filterCity) return false
      if (filterUrgent && !job.is_urgent) return false
      if (filterType && job.property_type !== filterType) return false
      if (minPrice && job.price < parseFloat(minPrice)) return false
      if (maxPrice && job.price > parseFloat(maxPrice)) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matches = 
          job.title?.toLowerCase().includes(q) ||
          job.location?.toLowerCase().includes(q) ||
          job.city?.toLowerCase().includes(q) ||
          job.description?.toLowerCase().includes(q) ||
          job.property_type?.toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [jobs, filterCity, filterUrgent, filterType, minPrice, maxPrice, searchQuery])

  const hasActiveFilters = filterCity || filterUrgent || filterType || minPrice || maxPrice || searchQuery

  // Group completed jobs by month
  const groupedMyJobs = useMemo(() => {
    return myApplications
      .filter(a => a.job_status === 'completed' || a.job_status === 'reviewed')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .reduce((groups, app) => {
        const key = new Date(app.created_at).toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' })
        if (!groups[key]) groups[key] = []
        groups[key].push(app)
        return groups
      }, {} as Record<string, typeof myApplications>)
  }, [myApplications])

  // Set first month as default expanded
  useEffect(() => {
    const firstMonth = Object.keys(groupedMyJobs)[0]
    if (firstMonth) setExpandedMonthsCleaner(new Set([firstMonth]))
  }, [myApplications])

  const toggleMonthCleaner = (month: string) => {
    setExpandedMonthsCleaner(prev => {
      const next = new Set(prev)
      if (next.has(month)) next.delete(month)
      else next.add(month)
      return next
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Slika ne smije biti veća od 5MB', type: 'error' })
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), 3000)
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleImageUpload = async () => {
    if (!selectedFile) return
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('userId', uid)
    try {
      const res = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        setImageUploaded(true)
        setSelectedFile(null)
        setProfileLoaded(false)
        setToast({ message: 'Slika uspješno uploadana! Čeka odobrenje admina.', type: 'success' })
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 5000)
      } else {
        setToast({ message: data.error || 'Greška pri uploadu', type: 'error' })
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 3000)
      }
    } catch {
      setToast({ message: 'Mrežna greška', type: 'error' })
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), 3000)
    }
    setUploadingImage(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'IZBRISI RACUN') return
    setDeletingAccount(true)
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid })
      })
      const data = await res.json()
      if (data.success) {
        logout()
      } else {
        setToast({ message: data.error || 'Greška pri brisanju', type: 'error' })
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 3000)
        setDeletingAccount(false)
      }
    } catch {
      setToast({ message: 'Mrežna greška', type: 'error' })
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), 3000)
      setDeletingAccount(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!confirm('Jeste li sigurni da želite izbrisati profilnu sliku? Izgubit ćete badge verifikacije.')) return
    
    try {
      const res = await fetch('/api/profile/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid })
      })
      const data = await res.json()
      if (data.success) {
        setImagePreview(null)
        setImageUploaded(false)
        setSelectedFile(null)
        setProfileLoaded(false)
        setProfileData(prev => prev ? { 
          ...prev, 
          profile_image: undefined,
          image_pending: undefined,
          image_verified: false 
        } : null)
        setToast({ message: 'Slika je izbrisana.', type: 'success' })
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 3000)
      }
    } catch {
      setToast({ message: 'Greška pri brisanju slike', type: 'error' })
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), 3000)
    }
  }

  const clearAllFilters = () => {
    setFilterCity('')
    setFilterUrgent(false)
    setFilterType('')
    setMinPrice('')
    setMaxPrice('')
    setSearchQuery('')
  }

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
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 5000)
        loadMyApplications()
        fetch(`/api/stats?role=cleaner&userId=${uid}`).then(r => r.json()).then(d => setStats(d))
      } else {
        setToast({ message: data.error || 'Greska', type: 'error' })
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 3000)
      }
    } catch {
      setToast({ message: 'Mrezna greska', type: 'error' })
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), 3000)
    }
    setCompletingId(null)
  }

  const submitClientReview = async () => {
    if (!clientReviewModal) return
    setSubmittingClientReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: clientReviewModal.jobId,
          cleanerId: uid,
          clientId: clientReviewModal.clientId,
          rating: clientReviewRating,
          comment: clientReviewComment || null,
          reviewer_type: 'cleaner'
        })
      })
      const data = await res.json()
      if (data.success) {
        setReviewedJobIds(prev => new Set([...prev, clientReviewModal.jobId]))
        setToast({ message: 'Recenzija uspjesno poslana!', type: 'success' })
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 4000)
        setClientReviewModal(null)
        setClientReviewRating(5)
        setClientReviewComment('')
      } else {
        setToast({ message: data.error || 'Greska pri slanju recenzije', type: 'error' })
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 3000)
      }
    } catch {
      setToast({ message: 'Mrezna greska', type: 'error' })
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), 3000)
    }
    setSubmittingClientReview(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${t.border}`, background: t.bgCard }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(12px, 4vw, 16px) clamp(12px, 4vw, 24px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${t.accent} 0%, #059669 100%)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 'clamp(16px, 4vw, 20px)', color: t.text }}>TvojČistač</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hide-on-mobile">
              <span style={{ color: t.textMuted, fontSize: 14 }}>{name}</span>
              {profileData?.image_verified && (
                <span style={{ 
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid #10b981',
                  borderRadius: 100,
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#10b981'
                }}>
                  {'✓'} Verificiran
                </span>
              )}
            </div>
            <button onClick={logout} style={{ ...btnSecondary, padding: '10px 20px', fontSize: 13 }}>Odjava</button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${t.border}`, background: t.bgCard }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 4 }}>
          {[{ k: 'available', l: 'Dostupni oglasi' }, { k: 'my', l: 'Moje prijave' }, { k: 'profile', l: 'Profil' }].map(x => (
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

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(12px, 4vw, 24px)' }}>
        {tab === 'available' && (
          <>
            {/* Search Input */}
            <input
              type="text"
              placeholder="Pretrazi oglase (npr. stan, Zagreb, ciscenje...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, marginBottom: 12, width: '100%' }}
            />

            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
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
              <input
                type="number"
                placeholder="Min €/h"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                style={{ ...inputStyle, width: 100 }}
              />
              <input
                type="number"
                placeholder="Max €/h"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                style={{ ...inputStyle, width: 100 }}
              />
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 14px', color: t.textMuted, fontSize: 13, cursor: 'pointer' }}
                >
                  Ocisti filtere
                </button>
              )}
            </div>

            {/* Results count */}
            <p style={{ color: t.textMuted, fontSize: 13, margin: '8px 0 16px 0' }}>
              Pronadeno {filteredJobs.length} od {jobs.length} oglasa
            </p>

            {/* Jobs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
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
                        <p style={{ color: t.textDim, fontSize: 12, margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {job.client_name}
                          {job.client_rating && job.client_rating > 0 && (
                            <span style={{ color: '#eab308', fontWeight: 600 }}>
                              {'\u2B50'} {Number(job.client_rating).toFixed(1)}
                            </span>
                          )}
                          {job.client_image_verified && (
                            <span style={{ color: '#10b981', fontSize: 11, fontWeight: 700 }}>
                              {'✓'}
                            </span>
                          )}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: t.accent }}>€{Number(job.price).toFixed(0)}/h</div>
                        <div style={{ fontSize: 12, color: t.textDim }}>{job.property_type}</div>
                      </div>
                    </div>
                    {job.description && <p style={{ color: t.textMuted, fontSize: 13, margin: '0 0 12px 0', lineHeight: 1.5 }}>{job.description}</p>}
                    <button 
                      onClick={() => {
                        if (!alreadyApplied && confirm('Jeste li sigurni da se želite prijaviti za ovaj posao?')) {
                          applyToJob(job.id, '')
                        }
                      }} 
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
            {filteredJobs.length === 0 && (
              <div style={{ ...cardStyle, padding: 60, textAlign: 'center' }}>
                <p style={{ color: t.textMuted, margin: 0, fontSize: 16 }}>Nema dostupnih oglasa s ovim filterima</p>
              </div>
            )}
          </>
        )}

        {tab === 'my' && (
          <div>
            {myApplications.length === 0 ? (
              <div style={{ ...cardStyle, padding: 60, textAlign: 'center' }}>
                <p style={{ color: t.textMuted, fontSize: 16, margin: '0 0 8px 0' }}>
                  Nemate jos prijava
                </p>
                <p style={{ color: t.textDim, fontSize: 14, margin: 0 }}>
                  Prijavite se na dostupne poslove u prvom tabu
                </p>
              </div>
            ) : (
              <>
            {/* Accepted Jobs - In Progress */}
            <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 16px 0' }}>
              Prihvaceni oglasi ({myApplications.filter(a => a.status === 'accepted' && a.job_status === 'accepted').length})
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
                        <div style={{ fontSize: 20, fontWeight: 700, color: t.accent }}>€{Number(app.price || 0).toFixed(0)}/h</div>
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
                        {app.client_id && Number(clientRatings[app.client_id]) > 0 && (
                          <div style={{ color: '#eab308', fontSize: 13, fontWeight: 600 }}>
                            {'\u2B50'} Ocjena klijenta: {Number(clientRatings[app.client_id]).toFixed(1)}
                          </div>
                        )}
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

            {/* Completed Jobs */}
            {myApplications.filter(a => a.job_status === 'completed' || a.job_status === 'reviewed').length > 0 && (
              <>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 16px 0' }}>
                  Zavrseni oglasi ({myApplications.filter(a => a.job_status === 'completed' || a.job_status === 'reviewed').length})
                </h3>
                <div>
                  {Object.entries(groupedMyJobs).map(([month, monthApps]) => (
                    <div key={month} style={{ marginBottom: 32 }}>
                      <div 
                        onClick={() => toggleMonthCleaner(month)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '14px 20px',
                          marginBottom: 16, 
                          cursor: 'pointer',
                          background: t.card,
                          border: `1px solid ${t.border}`,
                          borderRadius: 12,
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = t.bgCard}
                        onMouseOut={e => e.currentTarget.style.background = t.card}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 20 }}>{'\uD83D\uDCC5'}</span>
                          <h4 style={{ 
                            fontSize: 16, 
                            fontWeight: 700, 
                            color: t.text, 
                            margin: 0,
                            textTransform: 'capitalize'
                          }}>
                            {month}
                          </h4>
                          <span style={{ 
                            fontSize: 13, 
                            color: t.textMuted,
                            background: t.bgCard,
                            border: `1px solid ${t.border}`,
                            borderRadius: 100,
                            padding: '2px 10px'
                          }}>
                            {monthApps.length} {monthApps.length === 1 ? 'oglas' : 'oglasa'}
                          </span>
                        </div>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: t.accentGlow,
                          border: `1px solid ${t.accent}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: t.accent,
                          fontSize: 14,
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {expandedMonthsCleaner.has(month) ? '\u25B2' : '\u25BC'}
                        </div>
                      </div>
                      {expandedMonthsCleaner.has(month) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {monthApps.map(app => (
                          <div key={app.id} style={{ ...cardStyle, padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <h4 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: '0 0 4px 0' }}>{app.title}</h4>
                                <p style={{ color: t.textMuted, fontSize: 13, margin: 0 }}>{app.location}</p>
                                <p style={{ color: t.textDim, fontSize: 12, margin: '4px 0 0 0' }}>{app.client_name}</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ textAlign: 'right' }}>
<div style={{ fontSize: 18, fontWeight: 700, color: t.accent }}>€{Number(app.price || 0).toFixed(0)}/h</div>
                  <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: 'rgba(16, 185, 129, 0.15)', color: t.accent }}>
                                    Zavrseno
                                  </span>
                                </div>
                                {!reviewedJobIds.has(app.job_id) &&
                                 (app.job_status === 'completed' || app.job_status === 'reviewed') && (
                                  <button
                                    onClick={() => setClientReviewModal({ jobId: app.job_id, clientId: app.client_id!, clientName: app.client_name || 'Klijent' })}
                                    style={{ ...btnSecondary, padding: '10px 16px', fontSize: 13 }}
                                  >
                                    Ocijeni klijenta
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
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
<div style={{ fontSize: 18, fontWeight: 700, color: t.accent }}>€{Number(app.price || 0).toFixed(0)}/h</div>
                  <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
                          Na cekanju
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
              </>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600 }}>
            {/* Profile Image Upload */}
            <div style={{ ...cardStyle, padding: 24 }}>
              <h4 style={{ color: t.text, fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>
                Profilna slika
              </h4>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ 
                  width: 80, height: 80, borderRadius: '50%',
                  background: t.bgCard, border: `2px solid ${t.border}`,
                  overflow: 'hidden', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 32 }}>{'👤'}</span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  {profileData?.image_verified ? (
                    <>
                      <div style={{ 
                        padding: '10px 16px', borderRadius: 10,
                        background: 'rgba(16,185,129,0.1)', 
                        border: '1px solid #10b981',
                        color: '#10b981', fontSize: 13, fontWeight: 600
                      }}>
                        {'✓'} Slika verificirana — badge aktivan
                      </div>
                      <button
                        onClick={handleDeleteImage}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid #ef4444',
                          borderRadius: 10,
                          padding: '8px 16px',
                          color: '#ef4444',
                          fontSize: 13,
                          cursor: 'pointer',
                          marginTop: 8,
                          display: 'block'
                        }}
                      >
                        Izbriši sliku
                      </button>
                    </>
                  ) : profileData?.image_pending ? (
                    <>
                      <div style={{ 
                        padding: '10px 16px', borderRadius: 10,
                        background: 'rgba(234,179,8,0.1)', 
                        border: '1px solid #eab308',
                        color: '#eab308', fontSize: 13, fontWeight: 600
                      }}>
                        {'⏳'} Slika čeka odobrenje admina
                      </div>
                      <button
                        onClick={handleDeleteImage}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid #ef4444',
                          borderRadius: 10,
                          padding: '8px 16px',
                          color: '#ef4444',
                          fontSize: 13,
                          cursor: 'pointer',
                          marginTop: 8,
                          display: 'block'
                        }}
                      >
                        Izbriši sliku
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                      {selectedFile ? (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button
                            onClick={handleImageUpload}
                            disabled={uploadingImage}
                            style={{ ...btnPrimary, padding: '10px 20px', fontSize: 14,
                              opacity: uploadingImage ? 0.7 : 1 }}
                          >
                            {uploadingImage ? 'Uploadam...' : '✓ Spremi promjene'}
                          </button>
                          <button
                            onClick={() => { 
                              setSelectedFile(null)
                              setImagePreview(null)
                              if (fileInputRef.current) fileInputRef.current.value = ''
                            }}
                            style={{ 
                              background: 'none', border: `1px solid ${t.border}`,
                              borderRadius: 10, padding: '10px 16px',
                              color: t.textMuted, fontSize: 14, cursor: 'pointer'
                            }}
                          >
                            Odaberi drugu
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            style={{
                              ...btnPrimary,
                              padding: '10px 20px',
                              fontSize: 14,
                              opacity: uploadingImage ? 0.7 : 1
                            }}
                          >
                            {uploadingImage ? 'Uploadam...' : 'Dodaj profilnu sliku'}
                          </button>
                          <p style={{ color: t.textDim, fontSize: 12, margin: '8px 0 0 0' }}>
                            Max 5MB. Nakon odobrenja admina dobivate badge verifikacije.
                          </p>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info Card */}
            <div style={{ ...cardStyle, padding: 32 }}>
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
<div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.accent }}>{Number(stats.totalEarned || 0).toFixed(0)} EUR</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>Zarada</div>
              </div>
<div style={{ background: t.bgCard, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#eab308' }}>{stats.rating || 5.0}</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>Ocjena</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 4 }}>
                  {[1,2,3,4,5].map(star => (
                    <svg key={star} width="12" height="12" viewBox="0 0 24 24" 
                      fill={star <= Math.round(stats.rating || 0) ? '#eab308' : 'transparent'} 
                      stroke={star <= Math.round(stats.rating || 0) ? '#eab308' : t.textDim} 
                      strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
              </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div style={{ ...cardStyle, padding: 32 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: '0 0 24px 0' }}>Moje recenzije</h3>
              
              {loadingReviews ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/></svg>
                  <p style={{ color: t.textMuted, marginTop: 16 }}>Ucitavam recenzije...</p>
                </div>
              ) : myReviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <p style={{ color: t.textMuted, margin: 0 }}>Nemate jos recenzija</p>
                </div>
              ) : (
                <>
                  {/* Average Rating with Large Stars */}
                  <div style={{ textAlign: 'center', marginBottom: 28, padding: 20, background: t.bgCard, borderRadius: 16 }}>
                    <div style={{ fontSize: 48, fontWeight: 800, color: '#eab308', marginBottom: 8 }}>
                      {(myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                      {[1, 2, 3, 4, 5].map(star => {
                        const avg = myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length
                        return (
                          <svg key={star} width="28" height="28" viewBox="0 0 24 24" fill={star <= Math.round(avg) ? '#eab308' : 'transparent'} stroke={star <= Math.round(avg) ? '#eab308' : t.textDim} strokeWidth="1.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        )
                      })}
                    </div>
                    <div style={{ color: t.textMuted, fontSize: 14 }}>na temelju {myReviews.length} recenzija</div>
                  </div>

                  {/* Rating Breakdown */}
                  <div style={{ marginBottom: 28 }}>
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = myReviews.filter(r => r.rating === star).length
                      const percentage = myReviews.length > 0 ? (count / myReviews.length) * 100 : 0
                      return (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <div style={{ width: 30, fontSize: 13, color: t.textMuted, fontWeight: 600 }}>{star}</div>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" strokeWidth="1.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                          <div style={{ flex: 1, height: 8, background: t.bgCard, borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${percentage}%`, height: '100%', background: '#eab308', borderRadius: 4, transition: 'width 0.3s ease' }} />
                          </div>
                          <div style={{ width: 30, fontSize: 13, color: t.textMuted, textAlign: 'right' }}>{count}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Individual Reviews */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {myReviews.map(review => {
                      // Format name as "Marko K."
                      const nameParts = (review.client_name || 'Anonimno').split(' ')
                      const formattedName = nameParts.length > 1 
                        ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`
                        : nameParts[0]
                      return (
                        <div key={review.id} style={{ background: t.bgCard, borderRadius: 12, padding: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= review.rating ? '#eab308' : 'transparent'} stroke={star <= review.rating ? '#eab308' : t.textDim} strokeWidth="1.5">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                              ))}
                            </div>
                            <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 500 }}>{formattedName}</span>
                          </div>
                          {review.comment && (
                            <p style={{ color: t.textMuted, fontSize: 14, margin: 0, lineHeight: 1.5 }}>{review.comment}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Danger Zone */}
            <div style={{ 
              marginTop: 24,
              padding: 24,
              borderRadius: 16,
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.05)'
            }}>
              <h4 style={{ 
                color: '#ef4444', 
                fontSize: 14, 
                fontWeight: 700, 
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                Opasna zona
              </h4>
              <p style={{ color: t.textMuted, fontSize: 13, margin: '0 0 16px 0', lineHeight: 1.6 }}>
                Brisanje računa je trajno i ne može se poništiti. 
                Svi tvoji podaci, poslovi, recenzije i profilna slika 
                bit će trajno izbrisani.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid #ef4444',
                    borderRadius: 10,
                    padding: '10px 20px',
                    color: '#ef4444',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Izbriši moj račun
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 600, margin: 0 }}>
                    Upiši IZBRISI RACUN za potvrdu:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    placeholder="IZBRISI RACUN"
                    style={{ 
                      ...inputStyle,
                      border: '1px solid #ef4444',
                      fontFamily: 'monospace'
                    }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmText('')
                      }}
                      style={{
                        flex: 1,
                        ...btnSecondary,
                        padding: '10px 16px',
                        fontSize: 13
                      }}
                    >
                      Odustani
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'IZBRISI RACUN' || deletingAccount}
                      style={{
                        flex: 1,
                        background: deleteConfirmText === 'IZBRISI RACUN' 
                          ? '#ef4444' : 'rgba(239,68,68,0.2)',
                        border: 'none',
                        borderRadius: 10,
                        padding: '10px 16px',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: deleteConfirmText === 'IZBRISI RACUN' ? 'pointer' : 'default',
                        opacity: deletingAccount ? 0.7 : 1
                      }}
                    >
                      {deletingAccount ? 'Brišem...' : 'Trajno izbriši'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Client Review Modal */}
      {clientReviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100 }} onClick={() => setClientReviewModal(null)}>
          <div style={{ ...cardStyle, padding: 28, maxWidth: 420, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: '0 0 8px 0', textAlign: 'center' }}>Ocijeni klijenta</h3>
            <p style={{ color: t.textMuted, fontSize: 14, margin: '0 0 24px 0', textAlign: 'center' }}>{clientReviewModal.clientName}</p>
            
            {/* Star Rating */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setClientReviewRating(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill={star <= clientReviewRating ? '#eab308' : 'transparent'} stroke={star <= clientReviewRating ? '#eab308' : t.textDim} strokeWidth="1.5" style={{ transition: 'all 0.15s ease' }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={clientReviewComment}
              onChange={e => setClientReviewComment(e.target.value)}
              placeholder="Dodaj komentar (opcionalno)..."
              style={{
                width: '100%',
                minHeight: 100,
                padding: 16,
                background: t.bgCard,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                color: t.text,
                fontSize: 14,
                resize: 'vertical',
                marginBottom: 20,
                outline: 'none'
              }}
            />

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setClientReviewModal(null)} style={{ ...btnSecondary, flex: 1 }}>Odustani</button>
              <button 
                onClick={submitClientReview} 
                disabled={submittingClientReview}
                style={{ 
                  ...btnPrimary, 
                  flex: 1, 
                  opacity: submittingClientReview ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {submittingClientReview ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/></svg>
                    Saljem...
                  </>
                ) : 'Posalji recenziju'}
              </button>
            </div>
          </div>
        </div>
      )}

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
