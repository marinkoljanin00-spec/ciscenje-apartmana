"use client"

import { useEffect, useState } from "react"

type User = {
  id: number
  email: string
  full_name: string
  role: string
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
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [mounted, setMounted] = useState(false)

  // Wait for component to mount before doing anything
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Small delay to ensure router is initialized
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" })
        const data = await res.json()
        
        if (data.user) {
          setUser(data.user)
          const jobsRes = await fetch(`/api/jobs?role=${data.user.role}`, { credentials: "include" })
          const jobsData = await jobsRes.json()
          setJobs(jobsData.jobs || [])
          setLoading(false)
        } else {
          // Use location.replace instead of href to avoid history issues
          if (typeof window !== "undefined") {
            window.location.replace("/auth")
          }
        }
      } catch {
        if (typeof window !== "undefined") {
          window.location.replace("/auth")
        }
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [mounted])

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f4f8" }}>
        <p style={{ fontSize: "1.125rem", color: "#4a5568" }}>Ucitavanje...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // CLIENT DASHBOARD
  if (user.role === "client") {
    return <ClientDashboardUI user={user} jobs={jobs} />
  }

  // CLEANER DASHBOARD
  return <CleanerDashboardUI user={user} jobs={jobs} />
}

function ClientDashboardUI({ user, jobs }: { user: User; jobs: Job[] }) {
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [price, setPrice] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, location, price: parseFloat(price) }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess("Posao uspjesno objavljen!")
        setTitle("")
        setLocation("")
        setPrice("")
        window.location.reload()
      } else {
        setError(data.error || "Greska pri objavi posla.")
      }
    } catch {
      setError("Mrezna greska.")
    }
    setSubmitting(false)
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/auth"
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1a202c", margin: 0 }}>Dobrodosli, {user.full_name}</h1>
            <p style={{ color: "#718096", marginTop: "0.25rem" }}>Klijent Dashboard</p>
          </div>
          <button onClick={handleLogout} style={{ padding: "0.5rem 1rem", backgroundColor: "#e53e3e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            Odjava
          </button>
        </div>

        {/* Create Job Form */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "#1a202c" }}>Objavi novi posao</h2>
          <form onSubmit={handleCreateJob}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <input type="text" placeholder="Naslov posla" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: "0.625rem", border: "1px solid #d1d5db", borderRadius: "6px" }} />
              <input type="text" placeholder="Lokacija" value={location} onChange={e => setLocation(e.target.value)} required style={{ padding: "0.625rem", border: "1px solid #d1d5db", borderRadius: "6px" }} />
              <input type="number" placeholder="Cijena (EUR)" value={price} onChange={e => setPrice(e.target.value)} required min="1" style={{ padding: "0.625rem", border: "1px solid #d1d5db", borderRadius: "6px" }} />
            </div>
            {error && <p style={{ color: "#dc2626", marginBottom: "0.5rem" }}>{error}</p>}
            {success && <p style={{ color: "#16a34a", marginBottom: "0.5rem" }}>{success}</p>}
            <button type="submit" disabled={submitting} style={{ padding: "0.625rem 1.25rem", backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              {submitting ? "Objavljujem..." : "Objavi posao"}
            </button>
          </form>
        </div>

        {/* Jobs List */}
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "#1a202c" }}>Moji poslovi</h2>
          {jobs.length === 0 ? (
            <p style={{ color: "#718096" }}>Nemate objavljenih poslova.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {jobs.map(job => (
                <div key={job.id} style={{ padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600 }}>{job.title}</span>
                    <span style={{ color: "#3b82f6", fontWeight: 600 }}>{job.price} EUR</span>
                  </div>
                  <p style={{ color: "#718096", fontSize: "0.875rem", marginTop: "0.25rem" }}>{job.location}</p>
                  <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", borderRadius: "4px", backgroundColor: job.status === "open" ? "#d1fae5" : "#fef3c7", color: job.status === "open" ? "#059669" : "#d97706" }}>
                    {job.status === "open" ? "Otvoren" : "Prihvacen"}
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

function CleanerDashboardUI({ user, jobs }: { user: User; jobs: Job[] }) {
  const [accepting, setAccepting] = useState<number | null>(null)

  async function handleAcceptJob(jobId: number) {
    setAccepting(jobId)
    try {
      const res = await fetch("/api/jobs/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })
      const data = await res.json()
      if (data.success) {
        window.location.reload()
      }
    } catch {
      // ignore
    }
    setAccepting(null)
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/auth"
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1a202c", margin: 0 }}>Dobrodosli, {user.full_name}</h1>
            <p style={{ color: "#718096", marginTop: "0.25rem" }}>Cistac Dashboard</p>
          </div>
          <button onClick={handleLogout} style={{ padding: "0.5rem 1rem", backgroundColor: "#e53e3e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            Odjava
          </button>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "#1a202c" }}>Dostupni poslovi</h2>
          {jobs.length === 0 ? (
            <p style={{ color: "#718096" }}>Trenutno nema dostupnih poslova.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {jobs.map(job => (
                <div key={job.id} style={{ padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{job.title}</span>
                    <p style={{ color: "#718096", fontSize: "0.875rem", marginTop: "0.25rem" }}>{job.location}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ color: "#3b82f6", fontWeight: 600 }}>{job.price} EUR</span>
                    <button 
                      onClick={() => handleAcceptJob(job.id)} 
                      disabled={accepting === job.id}
                      style={{ padding: "0.5rem 1rem", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    >
                      {accepting === job.id ? "..." : "Prihvati"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
