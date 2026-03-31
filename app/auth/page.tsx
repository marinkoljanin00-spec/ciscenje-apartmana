"use client"

import { useState } from "react"

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login")
  const [role, setRole] = useState("client")

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginSuccess, setLoginSuccess] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regName, setRegName] = useState("")
  const [regError, setRegError] = useState("")
  const [regLoading, setRegLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError("")
    setLoginLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (data.success) {
        setLoginSuccess("Uspjeh! Preusmjeravam...")
        setTimeout(() => {
          window.location.href = "/"
        }, 500)
      } else {
        setLoginError(data.error || "Neispravan email ili lozinka.")
        setLoginLoading(false)
      }
    } catch {
      setLoginError("Mrežna greška. Pokušajte ponovno.")
      setLoginLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegError("")
    setRegLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: regEmail, password: regPassword, fullName: regName, role }),
      })
      const data = await res.json()
      if (data.success) {
        window.location.href = "/"
      } else {
        setRegError(data.error || "Greška pri registraciji.")
        setRegLoading(false)
      }
    } catch {
      setRegError("Mrežna greška. Pokušajte ponovno.")
      setRegLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 50 }}>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1a202c", margin: 0 }}>Marketplace Ciscenja</h1>
          <p style={{ color: "#718096", marginTop: "0.5rem" }}>Pronadi ili ponudi usluge ciscenja</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", marginBottom: "1.5rem", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <button
            onClick={() => setTab("login")}
            style={{ flex: 1, padding: "0.75rem", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", backgroundColor: tab === "login" ? "#3b82f6" : "#fff", color: tab === "login" ? "#fff" : "#4a5568" }}
          >
            Prijava
          </button>
          <button
            onClick={() => setTab("register")}
            style={{ flex: 1, padding: "0.75rem", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", backgroundColor: tab === "register" ? "#3b82f6" : "#fff", color: tab === "register" ? "#fff" : "#4a5568" }}
          >
            Registracija
          </button>
        </div>

        {/* Login Form */}
        {tab === "login" && (
          <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "2rem", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", position: "relative", zIndex: 50 }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem", color: "#1a202c" }}>Prijava</h2>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.4rem" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                  disabled={loginLoading}
                  placeholder="vas@email.com"
                  style={{ width: "100%", padding: "0.625rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.4rem" }}>
                  Lozinka
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  disabled={loginLoading}
                  placeholder="********"
                  style={{ width: "100%", padding: "0.625rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {loginError && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.75rem", borderRadius: "6px", fontSize: "0.875rem", marginBottom: "1rem" }}>
                  {loginError}
                </div>
              )}
              
              {loginSuccess && (
                <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", padding: "0.75rem", borderRadius: "6px", fontSize: "0.875rem", marginBottom: "1rem" }}>
                  {loginSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                style={{ width: "100%", padding: "0.75rem", backgroundColor: loginLoading ? "#93c5fd" : "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.9rem", fontWeight: 600, cursor: loginLoading ? "not-allowed" : "pointer" }}
              >
                {loginLoading ? "Prijava u tijeku..." : "Prijavi se"}
              </button>
            </form>
          </div>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "2rem", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", position: "relative", zIndex: 50 }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem", color: "#1a202c" }}>Registracija</h2>
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.4rem" }}>
                  Ime i prezime
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  required
                  disabled={regLoading}
                  placeholder="Ivan Horvat"
                  style={{ width: "100%", padding: "0.625rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.4rem" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                  disabled={regLoading}
                  placeholder="vas@email.com"
                  style={{ width: "100%", padding: "0.625rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.4rem" }}>
                  Lozinka
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  required
                  disabled={regLoading}
                  minLength={6}
                  placeholder="Najmanje 6 znakova"
                  style={{ width: "100%", padding: "0.625rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.6rem" }}>
                  Ja sam
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setRole("client")}
                    style={{ padding: "0.875rem", border: `2px solid ${role === "client" ? "#3b82f6" : "#e2e8f0"}`, borderRadius: "8px", backgroundColor: role === "client" ? "#eff6ff" : "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", color: role === "client" ? "#1d4ed8" : "#4a5568" }}
                  >
                    Klijent
                    <div style={{ fontSize: "0.75rem", fontWeight: 400, marginTop: "0.25rem", color: role === "client" ? "#3b82f6" : "#9ca3af" }}>Trazim ciscenje</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("cleaner")}
                    style={{ padding: "0.875rem", border: `2px solid ${role === "cleaner" ? "#3b82f6" : "#e2e8f0"}`, borderRadius: "8px", backgroundColor: role === "cleaner" ? "#eff6ff" : "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", color: role === "cleaner" ? "#1d4ed8" : "#4a5568" }}
                  >
                    Cistac
                    <div style={{ fontSize: "0.75rem", fontWeight: 400, marginTop: "0.25rem", color: role === "cleaner" ? "#3b82f6" : "#9ca3af" }}>Nudim usluge</div>
                  </button>
                </div>
              </div>

              {regError && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.75rem", borderRadius: "6px", fontSize: "0.875rem", marginBottom: "1rem" }}>
                  {regError}
                </div>
              )}

              <button
                type="submit"
                disabled={regLoading}
                style={{ width: "100%", padding: "0.75rem", backgroundColor: regLoading ? "#93c5fd" : "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.9rem", fontWeight: 600, cursor: regLoading ? "not-allowed" : "pointer" }}
              >
                {regLoading ? "Registracija u tijeku..." : "Registriraj se"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
