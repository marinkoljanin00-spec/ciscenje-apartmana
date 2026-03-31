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

  useEffect(() => {
    console.log("[v0] PAGE: Pocet ucitavanja")
    
    // 3-sekundni timeout osigurač
    const timeout = setTimeout(() => {
      console.log("[v0] PAGE: Timeout - API nije odgovorio")
      setLoading(false)
    }, 3000)

    // Odmah pozovi fetch bez kašnjenja
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => {
        console.log("[v0] PAGE: /api/auth/me status:", res.status)
        return res.json()
      })
      .then(data => {
        console.log("[v0] PAGE: Odgovor:", data)
        clearTimeout(timeout)
        
        // KLJUČNO: Odmah postavi setLoading(false) kada dobiješ odgovor
        if (data.user) {
          console.log("[v0] PAGE: Korisnik pronaden")
          setUser(data.user)
          setLoading(false)
          
          // Učitaj poslove nakon što znamo ulogu
          fetch(`/api/jobs?role=${data.user.role}`, { credentials: "include" })
            .then(r => r.json())
            .then(jobsData => setJobs(jobsData.jobs || []))
        } else {
          console.log("[v0] PAGE: Nema korisnika - redirect na /auth")
          setLoading(false)
          if (typeof window !== "undefined") {
            window.location.href = "/auth"
          }
        }
      })
      .catch(err => {
        console.error("[v0] PAGE: Greska:", err)
        clearTimeout(timeout)
        setLoading(false)
        if (typeof window !== "undefined") {
          window.location.href = "/auth"
        }
      })

    return () => clearTimeout(timeout)
  }, [])

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Ucitavanje...</div>
  }

  if (!user) {
    return null
  }

  if (user.role === "client") {
    return <ClientDashboard user={user} jobs={jobs} />
  }

  return <CleanerDashboard user={user} jobs={jobs} />
}

function ClientDashboard({ user, jobs }: { user: User; jobs: Job[] }) {
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [price, setPrice] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, location, price: parseFloat(price) }),
      })
      const data = await res.json()
      if (data.success) {
        setTitle("")
        setLocation("")
        setPrice("")
        window.location.reload()
      } else {
        setError(data.error || "Greska")
      }
    } catch {
      setError("Mrezna greska")
    }
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1>{user.full_name}</h1>
          <button onClick={() => { fetch("/api/auth/logout", { method: "POST" }).then(() => { window.location.href = "/auth" }) }}>Odjava</button>
        </div>
        <form onSubmit={handleCreateJob}>
          <input type="text" placeholder="Naslov" value={title} onChange={e => setTitle(e.target.value)} required />
          <input type="text" placeholder="Lokacija" value={location} onChange={e => setLocation(e.target.value)} required />
          <input type="number" placeholder="Cijena" value={price} onChange={e => setPrice(e.target.value)} required />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" disabled={submitting}>{submitting ? "Objavljujem..." : "Objavi"}</button>
        </form>
        <div>
          <h2>Moji poslovi</h2>
          {jobs.length === 0 ? <p>Nema poslova</p> : jobs.map(j => <div key={j.id}>{j.title} - {j.price} EUR</div>)}
        </div>
      </div>
    </div>
  )
}

function CleanerDashboard({ user, jobs }: { user: User; jobs: Job[] }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1>{user.full_name}</h1>
        <button onClick={() => { fetch("/api/auth/logout", { method: "POST" }).then(() => { window.location.href = "/auth" }) }}>Odjava</button>
        <h2>Dostupni poslovi</h2>
        {jobs.length === 0 ? <p>Nema poslova</p> : jobs.map(j => <div key={j.id} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ddd" }}><div>{j.title} - {j.price} EUR - {j.location}</div><button onClick={() => { fetch("/api/jobs/accept", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ jobId: j.id }) }).then(() => window.location.reload()) }}>Prihvati</button></div>)}
      </div>
    </div>
  )
}
