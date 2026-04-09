'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { t, cardStyle, btnPrimary, btnSecondary, inputStyle, selectStyle, CROATIAN_CITIES, Job, Application, Stats } from './shared'
import { DatePicker } from './date-picker'

// ═══════════════════════════════════════════════════════════════
// CLIENT DASHBOARD - Dark Emerald Theme
// ═══════════════════════════════════════════════════════════════
export function ClientDash({ logout, name, uid }: { logout: () => void; name: string; uid: string }) {
  const [tab, setTab] = useState<'active' | 'completed' | 'profile'>('active')
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [acceptingId, setAcceptingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [acceptedCleaner, setAcceptedCleaner] = useState<{ name: string; email: string; phone: string; rating: number } | null>(null)
  
  // Review modal state
  const [reviewJob, setReviewJob] = useState<Job | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // Client profile tab state
  const [profileData, setProfileData] = useState<{ 
    created_at?: string; 
    client_rating?: number;
    profile_image?: string;
    image_pending?: string;
    image_verified?: boolean;
  } | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Cleaner profile modal state
  const [cleanerProfile, setCleanerProfile] = useState<{ 
    user: { id: number; full_name: string; rating: number; completed_jobs: number; created_at: string }; 
    reviews: { id: number; rating: number; comment: string; created_at: string }[];
    applicationToAccept?: Application;
  } | null>(null)
  const [cleanerProfileCache] = useState<Map<number, { user: { id: number; full_name: string; rating: number; completed_jobs: number; created_at: string }; reviews: { id: number; rating: number; comment: string; created_at: string }[] }>>(new Map())
  const [loadingCleanerProfile, setLoadingCleanerProfile] = useState(false)
  const [applicationSort, setApplicationSort] = useState<'rating' | 'newest'>('rating')
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploaded, setImageUploaded] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(''); const [location, setLocation] = useState(''); const [price, setPrice] = useState('')
  const [propertyType, setPropertyType] = useState('stan'); const [isUrgent, setIsUrgent] = useState(false); const [desc, setDesc] = useState('')
  const [jobCity, setJobCity] = useState('Zagreb')
  const [scheduledDate, setScheduledDate] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false); const [err, setErr] = useState('')

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
    fetch(`/api/jobs?role=client&userId=${uid}`).then(r => r.json()).then(d => setJobs(d.jobs || []))
    fetch(`/api/stats?role=client&userId=${uid}`).then(r => r.json()).then(d => setStats(d))
  }, [uid])

  // Lazy load profile data when profile tab opens
  useEffect(() => {
    if (tab === 'profile' && !profileLoaded) {
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
    }
  }, [tab, profileLoaded, uid])

  // Show profile image reminder toast after 60 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!imagePreview && !profileData?.profile_image && !profileData?.image_pending) {
        setToast({
          message: '📸 Dodajte profilnu sliku i dobijte badge verifikacije — korisnici s fotografijom izgledaju pouzdanije!',
          type: 'success'
        })
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 8000)
      }
    }, 60000)
    return () => clearTimeout(timer)
  }, [profileData, imagePreview])

  const loadApplications = async (job: Job) => {
    setSelectedJob(job)
    const res = await fetch(`/api/applications?jobId=${job.id}`)
    const data = await res.json()
    setApplications(data.applications || [])
  }

  const fetchCleanerProfile = async (cleanerId: number, app: Application) => {
    // Check cache first
    if (cleanerProfileCache.has(cleanerId)) {
      const cached = cleanerProfileCache.get(cleanerId)!
      setCleanerProfile({ ...cached, applicationToAccept: app })
      return
    }
    
    setLoadingCleanerProfile(true)
    try {
      const [profileRes, reviewsRes] = await Promise.all([
        fetch(`/api/profile?userId=${cleanerId}`),
        fetch(`/api/reviews?cleanerId=${cleanerId}`)
      ])
      const cleanerProfileRes = await profileRes.json()
      const reviewsData = await reviewsRes.json()
      
      const data = {
        user: cleanerProfileRes.user || { id: cleanerId, full_name: app.cleaner_name || 'Nepoznato', rating: app.rating || 0, completed_jobs: 0, created_at: '' },
        reviews: (reviewsData.reviews || []).slice(0, 5)
      }
      
      // Cache the result
      cleanerProfileCache.set(cleanerId, data)
      setCleanerProfile({ ...data, applicationToAccept: app })
    } catch {
      setCleanerProfile({ 
        user: { id: cleanerId, full_name: app.cleaner_name || 'Nepoznato', rating: app.rating || 0, completed_jobs: 0, created_at: '' }, 
        reviews: [],
        applicationToAccept: app
      })
    }
    setLoadingCleanerProfile(false)
  }

  const acceptApplication = async (app: Application) => {
    setAcceptingId(app.id)
    try {
      const res = await fetch('/api/applications/accept', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ applicationId: app.id, jobId: app.job_id, cleanerId: app.cleaner_id }) 
      })
      const result = await res.json()
      
      if (result.success && result.cleaner) {
        // Update jobs list
        const jobsRes = await fetch(`/api/jobs?role=client&userId=${uid}`)
        const jobsData = await jobsRes.json()
        setJobs(jobsData.jobs || [])
        
        // Show accepted cleaner info
        setAcceptedCleaner(result.cleaner)
        setApplications([])
        
        // Show toast
        setToast({ message: `Uspjesno ste prihvatili cistaca ${result.cleaner.name}!`, type: 'success' })
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 5000)
      } else {
        setToast({ message: result.error || 'Doslo je do greske', type: 'error' })
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 3000)
        setSelectedJob(null)
      }
    } catch {
      setToast({ message: 'Mrezna greska', type: 'error' })
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), 3000)
    }
    setAcceptingId(null)
  }

  const deleteJob = async (jobId: number) => {
    if (!confirm('Jeste li sigurni da zelite obrisati ovaj posao?')) return
    await fetch(`/api/jobs?jobId=${jobId}&userId=${uid}`, { method: 'DELETE' })
    setJobs(jobs.filter(j => j.id !== jobId))
  }

  const submitReview = async () => {
    if (!reviewJob) return
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: reviewJob.id,
          clientId: parseInt(uid),
          cleanerId: reviewJob.cleaner_id,
          rating: reviewRating,
          comment: reviewComment || null,
          reviewer_type: 'client'
        })
      })
      const data = await res.json()
      if (data.success) {
        setToast({ message: 'Hvala na recenziji!', type: 'success' })
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 5000)
        // Refresh jobs
        const jobsRes = await fetch(`/api/jobs?role=client&userId=${uid}`)
        const jobsData = await jobsRes.json()
        setJobs(jobsData.jobs || [])
        setReviewJob(null)
        setReviewRating(5)
        setReviewComment('')
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
    setSubmittingReview(false)
  }

  // Group completed jobs by month
  const groupedCompletedJobs = useMemo(() => {
    return jobs
      .filter(j => j.status === 'reviewed')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .reduce((groups, job) => {
        const key = new Date(job.created_at).toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' })
        if (!groups[key]) groups[key] = []
        groups[key].push(job)
        return groups
      }, {} as Record<string, typeof jobs>)
  }, [jobs])

  // Set first month as default expanded
  useEffect(() => {
    const firstMonth = Object.keys(groupedCompletedJobs)[0]
    if (firstMonth) setExpandedMonths(new Set([firstMonth]))
  }, [jobs])

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => {
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

  const createJob = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setSubmitting(true)
    const finalPrice = isUrgent ? Number(price) * 1.5 : Number(price)
    const res = await fetch('/api/jobs', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        title, location, price: Number(price), propertyType, isUrgent, description: desc, userId: uid, city: jobCity, scheduledDate
      })
    })
    const data = await res.json()
    if (data.success) {
      setJobs([{ ...data.job, price: finalPrice, city: jobCity }, ...jobs])
      setTitle(''); setLocation(''); setPrice(''); setDesc(''); setIsUrgent(false); setJobCity('Zagreb'); setScheduledDate(null)
      fetch(`/api/stats?role=client&userId=${uid}`).then(r => r.json()).then(d => setStats(d))
    } else { setErr(data.error) }
    setSubmitting(false)
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
          {[{ k: 'active', l: 'Aktivni oglasi' }, { k: 'completed', l: 'Zavrseni' }, { k: 'profile', l: 'Profil' }].map(x => (
            <button key={x.k} onClick={() => setTab(x.k as 'active' | 'completed' | 'profile')} style={{ 
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
        {tab === 'active' && (
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 24 }} className="client-dash-grid">
            {/* Create Job Form */}
            <div style={{ ...cardStyle, padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 20px 0' }}>Novi oglas</h3>
              {err && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${t.urgent}`, padding: 12, marginBottom: 16, borderRadius: 10, color: t.urgent, fontSize: 14 }}>{err}</div>}
              <form onSubmit={createJob}>
                <div style={{ marginBottom: 14 }}>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Naslov posla" style={inputStyle} />
                </div>
                
                {/* Opis posla */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: t.textMuted }}>Opis posla</label>
                  <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Opis (opcionalno)" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                
                {/* Date Picker */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 10, color: t.textMuted }}>Datum čišćenja</label>
                  <DatePicker 
                    value={scheduledDate} 
                    onChange={setScheduledDate}
                    placeholder="Odaberi datum"
                  />
                </div>

                {/* Location Input */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 8, fontWeight: 600 }}>Lokacija</label>
                  <input 
                    type="text" 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    required 
                    placeholder="Unesite adresu (npr. Zagreb, Ilica 10)" 
                    style={inputStyle} 
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: t.textMuted }}>Cijena po satu (€/h)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} required placeholder="npr. 15" min="1" style={inputStyle} />
                  <select value={propertyType} onChange={e => setPropertyType(e.target.value)} style={selectStyle}>
                    <option value="stan">Stan</option>
                    <option value="kuca">Kuća</option>
                    <option value="ured">Ured</option>
                    <option value="poslovni">Poslovni prostor</option>
                  </select>
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: t.textMuted }}>Grad</label>
                  <select value={jobCity} onChange={e => setJobCity(e.target.value)} style={selectStyle}>
                    {CROATIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ 
                  marginBottom: 20, 
                  padding: 16, 
                  borderRadius: 12,
                  border: `1px solid ${isUrgent ? t.accent : t.border}`,
                  background: isUrgent ? t.accentGlow : 'transparent',
                  cursor: 'pointer'
                }} onClick={() => setIsUrgent(!isUrgent)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="checkbox" checked={isUrgent} 
                        onChange={e => setIsUrgent(e.target.checked)}
                        onClick={e => e.stopPropagation()}
                        style={{ width: 18, height: 18, accentColor: t.accent }} />
                      <span style={{ color: t.text, fontWeight: 700, fontSize: 15 }}>
                        {'\u26A1'} Hitno oglašavanje
                      </span>
                    </div>
                    {isUrgent && price && (
                      <span style={{ color: t.accent, fontWeight: 700, fontSize: 15 }}>
                        €{(Number(price) * 1.5).toFixed(0)}/h
                      </span>
                    )}
                  </div>
                  <p style={{ color: t.textMuted, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                    Vaš oglas se ističe i prikazuje prvi čistačima. 
                    Cijena je <strong style={{ color: t.accent }}>50% viša</strong> od osnovne, 
                    ali imate <strong style={{ color: t.text }}>znatno veće šanse</strong> za 
                    brzi pronalazak čistača — idealno za hitne situacije.
                  </p>
                </div>
                <button type="submit" disabled={submitting || !location} style={{ ...btnPrimary, width: '100%', opacity: (!location || submitting) ? 0.6 : 1 }}>{submitting ? 'Objavljujem...' : 'Objavi oglas'}</button>
              </form>
            </div>

            {/* Jobs List - Active only */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 16px 0' }}>Aktivni oglasi ({jobs.filter(j => !['reviewed'].includes(j.status)).length})</h3>
              
              {/* Unreviewed jobs banner */}
              {(() => {
                const unreviewedCount = jobs.filter(j => j.status === 'completed').length
                return unreviewedCount > 0 ? (
                  <div style={{ 
                    background: 'rgba(234, 179, 8, 0.1)', 
                    border: '1px solid #eab308',
                    borderRadius: 12, 
                    padding: '14px 20px',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ color: '#eab308', fontWeight: 600 }}>
                      {unreviewedCount === 1 
                        ? '\u2B50 Imate 1 završeni posao koji čeka recenziju'
                        : `\u2B50 Imate ${unreviewedCount} završenih oglasa koji čekaju recenziju`}
                    </span>
                  </div>
                ) : null
              })()}
              
              {jobs.filter(j => !['reviewed'].includes(j.status)).length === 0 ? (
                <div style={{ ...cardStyle, padding: 40, textAlign: 'center' }}>
                  <p style={{ color: t.textMuted, margin: 0 }}>Nemate aktivnih oglasa</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {jobs.filter(j => !['reviewed'].includes(j.status)).map(job => (
                    <div key={job.id} style={{ ...cardStyle, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <h4 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: 0 }}>{job.title}</h4>
                            {job.is_urgent && <span style={{ background: t.urgent, color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100 }}>HITNO</span>}
                            {job.city && <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100 }}>{job.city}</span>}
                          </div>
                          <p style={{ color: t.textMuted, fontSize: 13, margin: 0 }}>{job.location}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: t.accent }}>€{Number(job.price).toFixed(0)}/h</div>
                          <div style={{ fontSize: 12, color: t.textDim }}>{job.property_type}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: 100, 
                          fontSize: 12, 
                          fontWeight: 600,
                          background: job.status === 'open' ? t.accentGlow : job.status === 'accepted' ? 'rgba(59, 130, 246, 0.15)' : job.status === 'completed' ? 'rgba(234, 179, 8, 0.15)' : t.accentGlow,
                          color: job.status === 'open' ? t.accent : job.status === 'accepted' ? '#3b82f6' : job.status === 'completed' ? '#eab308' : t.accent
                        }}>
                          {job.status === 'open' ? 'Otvoren' : job.status === 'accepted' ? 'U tijeku' : job.status === 'completed' ? 'Ceka recenziju' : 'Zavrseno'}
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {job.status === 'open' && job.application_count && job.application_count > 0 && (
                            <button onClick={() => loadApplications(job)} style={{ ...btnSecondary, padding: '8px 14px', fontSize: 12 }}>
                              Prijave ({job.application_count})
                            </button>
                          )}
                          {job.status === 'open' && (
                            <button onClick={() => deleteJob(job.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${t.urgent}`, borderRadius: 8, padding: '8px 14px', color: t.urgent, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              Obrisi
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Show cleaner contact info for accepted/completed jobs */}
                      {(job.status === 'accepted' || job.status === 'completed') && job.cleaner_name && (
                        <div style={{ marginTop: 16, padding: 16, background: job.status === 'completed' ? 'rgba(234, 179, 8, 0.1)' : t.accentGlow, borderRadius: 12, border: `1px solid ${job.status === 'completed' ? '#eab308' : t.accent}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={job.status === 'completed' ? '#eab308' : t.accent} strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                              <span style={{ color: job.status === 'completed' ? '#eab308' : t.accent, fontWeight: 600, fontSize: 13 }}>
                                {job.status === 'completed' ? 'Posao zavrsen - ocijeni cistaca' : 'Posao u tijeku'}
                              </span>
                            </div>
                            {job.status === 'completed' && (
                              <button onClick={() => setReviewJob(job)} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700, background: '#eab308', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                                Ocijeni
                              </button>
                            )}
                          </div>
                          <div style={{ fontWeight: 700, color: t.text, fontSize: 15, marginBottom: 8 }}>{job.cleaner_name}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {job.cleaner_email && (
                              <a href={`mailto:${job.cleaner_email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.textMuted, fontSize: 13, textDecoration: 'none' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                {job.cleaner_email}
                              </a>
                            )}
                            {job.cleaner_phone && (
                              <a href={`tel:${job.cleaner_phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.textMuted, fontSize: 13, textDecoration: 'none' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
                                {job.cleaner_phone}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'completed' && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 16px 0' }}>Zavrseni oglasi ({jobs.filter(j => j.status === 'reviewed').length})</h3>
            {jobs.filter(j => j.status === 'reviewed').length === 0 ? (
              <div style={{ ...cardStyle, padding: 40, textAlign: 'center' }}>
                <p style={{ color: t.textMuted, margin: 0 }}>Nemate zavrsenih oglasa</p>
              </div>
            ) : (
              <div>
                {Object.entries(groupedCompletedJobs).map(([month, monthJobs]) => (
                  <div key={month} style={{ marginBottom: 32 }}>
                    <div 
                      onClick={() => toggleMonth(month)}
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
                          {monthJobs.length} {monthJobs.length === 1 ? 'oglas' : 'oglasa'}
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
                        {expandedMonths.has(month) ? '\u25B2' : '\u25BC'}
                      </div>
                    </div>
                    {expandedMonths.has(month) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                      {monthJobs.map(job => (
                        <div key={job.id} style={{ ...cardStyle, padding: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                              <h4 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: '0 0 4px 0' }}>{job.title}</h4>
                              <p style={{ color: t.textMuted, fontSize: 13, margin: 0 }}>{job.location}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 18, fontWeight: 700, color: t.accent }}>€{Number(job.price).toFixed(0)}/h</div>
                              <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: t.accentGlow, color: t.accent }}>
                                Zavrseno
                              </span>
                            </div>
                          </div>
                          <div style={{ padding: 12, background: t.bgCard, borderRadius: 10 }}>
                            <div style={{ color: t.textMuted, fontSize: 13 }}>Cistac: <span style={{ color: t.text, fontWeight: 600 }}>{job.cleaner_name}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ maxWidth: 500 }}>
            {/* Profile Image Upload */}
            <div style={{ ...cardStyle, padding: 24, marginBottom: 20 }}>
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
                          {!profileData?.image_verified && !profileData?.image_pending && !imagePreview && (
                            <div style={{
                              display: 'flex', alignItems: 'flex-start', gap: 10,
                              background: 'rgba(16, 185, 129, 0.08)',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                              borderRadius: 12, padding: '12px 14px', marginBottom: 14,
                            }}>
                              <span style={{ fontSize: 18, lineHeight: 1.2 }}>✓</span>
                              <div>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#10b981' }}>
                                  Dobijte badge verifikacije
                                </p>
                                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>
                                  Uploadajte profilnu sliku — nakon odobrenja admina dobivate zeleni ✓ badge koji gradi povjerenje.
                                </p>
                              </div>
                            </div>
                          )}
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

            {/* Account Info Card */}
            <div style={{ ...cardStyle, padding: 32, marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: '0 0 24px 0' }}>Moj profil</h3>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 6 }}>Email</label>
                <div style={{ fontSize: 16, color: t.text, fontWeight: 500 }}>{name}</div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 6 }}>Uloga</label>
                <div style={{ fontSize: 16, color: t.accent, fontWeight: 600 }}>Klijent</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 6 }}>Član od</label>
                <div style={{ fontSize: 16, color: t.text, fontWeight: 500 }}>
                  {profileData?.created_at 
                    ? new Date(profileData.created_at).toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : profileLoaded ? 'N/A' : 'Učitavam...'}
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ ...cardStyle, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.text }}>{stats.totalJobs || 0}</div>
                <div style={{ fontSize: 13, color: t.textMuted }}>Ukupno oglasa</div>
              </div>
              <div style={{ ...cardStyle, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.accent }}>{Number(stats.totalSpent || 0).toFixed(0)} EUR</div>
                <div style={{ fontSize: 13, color: t.textMuted }}>Potrošeno</div>
              </div>
            </div>

            {/* Client Rating Card */}
            {profileData?.client_rating && profileData.client_rating > 0 && (
              <div style={{ ...cardStyle, padding: 20, marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 8 }}>
                  Vaša ocjena kao klijent
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#eab308', marginBottom: 8 }}>
                  {Number(profileData.client_rating).toFixed(1)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                  {[1,2,3,4,5].map(star => (
                    <svg key={star} width="20" height="20" viewBox="0 0 24 24"
                      fill={star <= Math.round(profileData.client_rating!) ? '#eab308' : 'transparent'}
                      stroke={star <= Math.round(profileData.client_rating!) ? '#eab308' : t.textDim}
                      strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: t.textDim, marginTop: 8 }}>
                  Ocjena od čistača
                </div>
              </div>
            )}

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

      {/* Applications Modal */}
      {selectedJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100 }} onClick={() => { setSelectedJob(null); setAcceptedCleaner(null) }}>
          <div style={{ ...cardStyle, padding: 20, maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            
            {/* Show accepted cleaner contact info */}
            {acceptedCleaner ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    background: t.accentGlow, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 8px 0' }}>Cestitamo!</h3>
                  <p style={{ color: t.textMuted, fontSize: 15, margin: 0 }}>Uspjesno ste odabrali cistaca</p>
                </div>

                <div style={{ background: t.bgCard, borderRadius: 16, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ 
                      width: 44, 
                      height: 44, 
                      background: `linear-gradient(135deg, ${t.accent} 0%, #059669 100%)`, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 18
                    }}>
                      {acceptedCleaner.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>{acceptedCleaner.name}</div>
                      <div style={{ color: t.accent, fontSize: 13, fontWeight: 600 }}>Ocjena: {acceptedCleaner.rating || 5.0}</div>
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 16 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Kontakt podaci</h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, background: t.accentGlow, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: t.textMuted }}>Email</div>
                        <a href={`mailto:${acceptedCleaner.email}`} style={{ color: t.text, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>{acceptedCleaner.email}</a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, background: t.accentGlow, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: t.textMuted }}>Telefon</div>
                        <a href={`tel:${acceptedCleaner.phone}`} style={{ color: t.text, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>{acceptedCleaner.phone || 'Nije dostupan'}</a>
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => { setSelectedJob(null); setAcceptedCleaner(null) }} style={{ ...btnPrimary, width: '100%' }}>Zatvori</button>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 16px 0' }}>Prijave za: {selectedJob.title}</h3>
                {applications.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <select 
                      value={applicationSort} 
                      onChange={e => setApplicationSort(e.target.value as 'rating' | 'newest')} 
                      style={{ ...selectStyle, padding: '10px 14px', fontSize: 13 }}
                    >
                      <option value="rating">Najbolja ocjena</option>
                      <option value="newest">Najnovije</option>
                    </select>
                  </div>
                )}
                {applications.length === 0 ? (
                  <p style={{ color: t.textMuted }}>Nema prijava za ovaj posao.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[...applications]
                      .sort((a, b) => applicationSort === 'rating' 
                        ? (b.rating || 0) - (a.rating || 0) 
                        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                      )
                      .map(app => (
                      <div key={app.id} style={{ background: t.bgCard, borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div>
                            <button 
                              onClick={() => fetchCleanerProfile(app.cleaner_id, app)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                padding: 0, 
                                fontWeight: 600, 
                                color: t.accent, 
                                fontSize: 15,
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                textUnderlineOffset: 3
                              }}
                            >
                              {app.cleaner_name}
                            </button>
                            {app.image_verified && (
                              <span style={{ 
                                background: 'rgba(16,185,129,0.15)',
                                border: '1px solid #10b981',
                                borderRadius: 100,
                                padding: '2px 6px',
                                fontSize: 10,
                                fontWeight: 700,
                                color: '#10b981',
                                marginLeft: 6
                              }}>
                                {'✓'} Verificiran
                              </span>
                            )}
                            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
                              Ocjena: <span style={{ color: t.accent, fontWeight: 600 }}>{app.rating || 5.0}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => acceptApplication(app)} 
                            disabled={acceptingId === app.id}
                            style={{ 
                              ...btnPrimary, 
                              padding: '10px 16px', 
                              fontSize: 13,
                              opacity: acceptingId === app.id ? 0.7 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8
                            }}
                          >
                            {acceptingId === app.id ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/></svg>
                                Prihvacam...
                              </>
                            ) : 'Prihvati'}
                          </button>
                        </div>
                        {app.message && <p style={{ color: t.textMuted, fontSize: 14, margin: 0 }}>{app.message}</p>}
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => { setSelectedJob(null); setAcceptedCleaner(null) }} style={{ ...btnSecondary, width: '100%', marginTop: 20 }}>Zatvori</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cleaner Profile Modal */}
      {cleanerProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 150 }} onClick={() => setCleanerProfile(null)}>
          <div style={{ ...cardStyle, padding: 28, maxWidth: 480, width: '100%', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            {loadingCleanerProfile ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/></svg>
                <p style={{ color: t.textMuted, marginTop: 16 }}>Ucitavam profil...</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: '0 0 24px 0', textAlign: 'center' }}>Profil cistaca</h3>
                
                {/* Profile Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    background: `linear-gradient(135deg, ${t.accent} 0%, #059669 100%)`, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 26
                  }}>
                    {cleanerProfile.user.full_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: t.text, marginBottom: 6 }}>{cleanerProfile.user.full_name}</div>
                    {/* Visual star rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} width="18" height="18" viewBox="0 0 24 24" fill={star <= Math.round(cleanerProfile.user.rating || 0) ? '#eab308' : 'transparent'} stroke={star <= Math.round(cleanerProfile.user.rating || 0) ? '#eab308' : t.textDim} strokeWidth="1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                      <span style={{ marginLeft: 6, color: t.textMuted, fontSize: 14 }}>({cleanerProfile.user.rating?.toFixed(1) || '0.0'})</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  <div style={{ background: t.bgCard, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: t.accent }}>{cleanerProfile.user.completed_jobs || 0}</div>
                    <div style={{ fontSize: 12, color: t.textMuted }}>Zavrsenih oglasa</div>
                  </div>
                  <div style={{ background: t.bgCard, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>
                      {cleanerProfile.user.created_at 
                        ? new Date(cleanerProfile.user.created_at).toLocaleDateString('hr-HR', { month: 'short', year: 'numeric' })
                        : 'N/A'
                      }
                    </div>
                    <div style={{ fontSize: 12, color: t.textMuted }}>Clan od</div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: t.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Recenzije ({cleanerProfile.reviews.length})
                  </h4>
                  {cleanerProfile.reviews.length === 0 ? (
                    <div style={{ background: t.bgCard, borderRadius: 12, padding: 20, textAlign: 'center' }}>
                      <p style={{ color: t.textDim, fontSize: 14, margin: 0 }}>Nema recenzija</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {cleanerProfile.reviews.map(review => (
                        <div key={review.id} style={{ background: t.bgCard, borderRadius: 12, padding: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= review.rating ? '#eab308' : 'transparent'} stroke={star <= review.rating ? '#eab308' : t.textDim} strokeWidth="1.5">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                              ))}
                            </div>
                            <span style={{ fontSize: 12, color: t.textDim }}>
                              {new Date(review.created_at).toLocaleDateString('hr-HR')}
                            </span>
                          </div>
                          {review.comment && (
                            <p style={{ color: t.textMuted, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setCleanerProfile(null)} style={{ ...btnSecondary, flex: 1 }}>Zatvori</button>
                  {cleanerProfile.applicationToAccept && (
                    <button 
                      onClick={() => {
                        if (cleanerProfile.applicationToAccept) {
                          acceptApplication(cleanerProfile.applicationToAccept)
                          setCleanerProfile(null)
                        }
                      }} 
                      disabled={acceptingId === cleanerProfile.applicationToAccept.id}
                      style={{ 
                        ...btnPrimary, 
                        flex: 1,
                        opacity: acceptingId === cleanerProfile.applicationToAccept.id ? 0.7 : 1
                      }}
                    >
                      {acceptingId === cleanerProfile.applicationToAccept.id ? 'Prihvacam...' : 'Prihvati ovog cistaca'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100 }} onClick={() => setReviewJob(null)}>
          <div style={{ ...cardStyle, padding: 28, maxWidth: 450, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                background: 'rgba(234, 179, 8, 0.15)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#eab308" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: t.text, margin: '0 0 8px 0' }}>Ocijeni cistaca</h3>
              <p style={{ color: t.textMuted, fontSize: 15, margin: 0 }}>{reviewJob.cleaner_name}</p>
            </div>

            {/* Star Rating */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  type="button"
                  onClick={() => setReviewRating(star)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    padding: 4,
                    transition: 'transform 0.15s'
                  }}
                  onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill={star <= reviewRating ? '#eab308' : 'transparent'} stroke={star <= reviewRating ? '#eab308' : t.textDim} strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              ))}
            </div>

            {/* Comment */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, color: t.textMuted, marginBottom: 8, fontWeight: 600 }}>Komentar (opcionalno)</label>
              <textarea 
                value={reviewComment} 
                onChange={e => setReviewComment(e.target.value)} 
                placeholder="Podijelite svoje iskustvo..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setReviewJob(null)} style={{ ...btnSecondary, flex: 1 }}>Odustani</button>
              <button 
                onClick={submitReview} 
                disabled={submittingReview}
                style={{ ...btnPrimary, flex: 1, background: '#eab308', opacity: submittingReview ? 0.7 : 1 }}
              >
                {submittingReview ? 'Saljem...' : 'Posalji recenziju'}
              </button>
            </div>
          </div>
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
