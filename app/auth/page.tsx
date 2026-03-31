"use client"

import React, { useState } from "react"

export default function AuthPage({ onLoginSuccess }: { onLoginSuccess?: (user: { id: number; email: string; role: 'client' | 'cleaner' }) => void }) {
  const [tab, setTab] = useState<"login" | "register">("login")
  const [role, setRole] = useState("client")

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
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
      if (data.success && data.user) {
        if (onLoginSuccess) {
          onLoginSuccess(data.user)
        } else {
          window.location.href = "/"
        }
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
      if (data.success && data.user) {
        if (onLoginSuccess) {
          onLoginSuccess(data.user)
        } else {
          window.location.href = "/"
        }
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
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "stretch" }}>
      {/* Left side - Image */}
      <div style={{ 
        backgroundImage: "url('/clean-apartment.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'none'
      }} />

      {/* Mobile view - show image as background */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
        width: '100%'
      }}>
        {/* Left side - Desktop image */}
        <div style={{ 
          backgroundImage: "url('/clean-apartment.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: window.innerWidth < 768 ? 'none' : 'block',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }} />
          <div style={{ 
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#ffffff',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', margin: '0 0 1rem 0' }}>SJAJ</h1>
            <p style={{ fontSize: '1.25rem', color: '#e5e5e5', margin: 0 }}>Profesionalne usluge čišćenja</p>
          </div>
        </div>

        {/* Right side - Form */}
        <div style={{ 
          backgroundColor: "#0a0a0a", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: "2rem" 
        }}>
          <div style={{ width: "100%", maxWidth: "420px" }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#10b981', 
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                fontWeight: 'bold',
                fontSize: '1.25rem'
              }}>
                S
              </div>
              <h1 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>SJAJ</h1>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", marginBottom: "1.5rem", gap: '0.5rem' }}>
              <button
                onClick={() => setTab("login")}
                style={{ 
                  flex: 1, 
                  padding: "0.75rem", 
                  border: "none", 
                  cursor: "pointer", 
                  fontWeight: 600, 
                  fontSize: "0.95rem",
                  backgroundColor: tab === "login" ? "#10b981" : "transparent", 
                  color: tab === "login" ? "#000000" : "#a3a3a3",
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                Prijava
              </button>
              <button
                onClick={() => setTab("register")}
                style={{ 
                  flex: 1, 
                  padding: "0.75rem", 
                  border: "none", 
                  cursor: "pointer", 
                  fontWeight: 600, 
                  fontSize: "0.95rem",
                  backgroundColor: tab === "register" ? "#10b981" : "transparent", 
                  color: tab === "register" ? "#000000" : "#a3a3a3",
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                Registracija
              </button>
            </div>

            {/* Login Form */}
            {tab === "login" && (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#a3a3a3", marginBottom: "0.5rem" }}>
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    required
                    disabled={loginLoading}
                    placeholder="vas@email.com"
                    style={{ 
                      width: "100%", 
                      padding: "0.875rem", 
                      border: "1px solid #262626", 
                      borderRadius: "0.5rem", 
                      fontSize: "0.95rem", 
                      outline: "none", 
                      boxSizing: "border-box",
                      backgroundColor: '#111111',
                      color: '#ffffff'
                    }}
                  />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#a3a3a3", marginBottom: "0.5rem" }}>
                    LOZINKA
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    required
                    disabled={loginLoading}
                    placeholder="••••••••"
                    style={{ 
                      width: "100%", 
                      padding: "0.875rem", 
                      border: "1px solid #262626", 
                      borderRadius: "0.5rem", 
                      fontSize: "0.95rem", 
                      outline: "none", 
                      boxSizing: "border-box",
                      backgroundColor: '#111111',
                      color: '#ffffff'
                    }}
                  />
                </div>

                {loginError && (
                  <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#ef4444", padding: "0.75rem", borderRadius: "0.5rem", fontSize: "0.875rem", marginBottom: "1rem" }}>
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  style={{ 
                    width: "100%", 
                    padding: "0.875rem", 
                    backgroundColor: loginLoading ? "#059669" : "#10b981", 
                    color: "#000000", 
                    border: "none", 
                    borderRadius: "0.5rem", 
                    fontSize: "0.95rem", 
                    fontWeight: 600, 
                    cursor: loginLoading ? "not-allowed" : "pointer",
                    transition: 'all 0.2s'
                  }}
                >
                  {loginLoading ? "Prijava u tijeku..." : "Prijavi se"}
                </button>
              </form>
            )}

            {/* Register Form */}
            {tab === "register" && (
              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#a3a3a3", marginBottom: "0.5rem" }}>
                    IME I PREZIME
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    required
                    disabled={regLoading}
                    placeholder="Ivan Horvat"
                    style={{ 
                      width: "100%", 
                      padding: "0.875rem", 
                      border: "1px solid #262626", 
                      borderRadius: "0.5rem", 
                      fontSize: "0.95rem", 
                      outline: "none", 
                      boxSizing: "border-box",
                      backgroundColor: '#111111',
                      color: '#ffffff'
                    }}
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#a3a3a3", marginBottom: "0.5rem" }}>
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    required
                    disabled={regLoading}
                    placeholder="vas@email.com"
                    style={{ 
                      width: "100%", 
                      padding: "0.875rem", 
                      border: "1px solid #262626", 
                      borderRadius: "0.5rem", 
                      fontSize: "0.95rem", 
                      outline: "none", 
                      boxSizing: "border-box",
                      backgroundColor: '#111111',
                      color: '#ffffff'
                    }}
                  />
                </div>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#a3a3a3", marginBottom: "0.5rem" }}>
                    LOZINKA
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                    disabled={regLoading}
                    minLength={6}
                    placeholder="Najmanje 6 znakova"
                    style={{ 
                      width: "100%", 
                      padding: "0.875rem", 
                      border: "1px solid #262626", 
                      borderRadius: "0.5rem", 
                      fontSize: "0.95rem", 
                      outline: "none", 
                      boxSizing: "border-box",
                      backgroundColor: '#111111',
                      color: '#ffffff'
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#a3a3a3", marginBottom: "0.75rem" }}>
                    JA SAM
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <button
                      type="button"
                      onClick={() => setRole("client")}
                      style={{ 
                        padding: "1rem", 
                        border: role === "client" ? "2px solid #10b981" : "1px solid #262626", 
                        borderRadius: "0.5rem", 
                        backgroundColor: role === "client" ? "rgba(16, 185, 129, 0.1)" : "#111111", 
                        cursor: "pointer", 
                        fontWeight: 600, 
                        fontSize: "0.9rem", 
                        color: role === "client" ? "#10b981" : "#a3a3a3"
                      }}
                    >
                      👤 Klijent
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("cleaner")}
                      style={{ 
                        padding: "1rem", 
                        border: role === "cleaner" ? "2px solid #10b981" : "1px solid #262626", 
                        borderRadius: "0.5rem", 
                        backgroundColor: role === "cleaner" ? "rgba(16, 185, 129, 0.1)" : "#111111", 
                        cursor: "pointer", 
                        fontWeight: 600, 
                        fontSize: "0.9rem", 
                        color: role === "cleaner" ? "#10b981" : "#a3a3a3"
                      }}
                    >
                      🧹 Čistač
                    </button>
                  </div>
                </div>

                {regError && (
                  <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#ef4444", padding: "0.75rem", borderRadius: "0.5rem", fontSize: "0.875rem", marginBottom: "1rem" }}>
                    {regError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  style={{ 
                    width: "100%", 
                    padding: "0.875rem", 
                    backgroundColor: regLoading ? "#059669" : "#10b981", 
                    color: "#000000", 
                    border: "none", 
                    borderRadius: "0.5rem", 
                    fontSize: "0.95rem", 
                    fontWeight: 600, 
                    cursor: regLoading ? "not-allowed" : "pointer",
                    transition: 'all 0.2s'
                  }}
                >
                  {regLoading ? "Registracija u tijeku..." : "Registriraj se"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
