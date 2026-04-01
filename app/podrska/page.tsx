'use client'

import { useState } from 'react'
import Link from 'next/link'

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

export default function PodrskaPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'technical', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setError('Molimo ispunite sva obavezna polja')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setSuccess(true)
        setForm({ name: '', email: '', subject: 'technical', message: '' })
      } else {
        const data = await res.json()
        setError(data.error || 'Došlo je do greške')
      }
    } catch {
      setError('Mrežna greška')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text }}>
      {/* Header */}
      <header style={{ padding: '16px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: 24, fontWeight: 800, color: t.accent, textDecoration: 'none' }}>sjaj.hr</Link>
        <Link href="/" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 14 }}>← Natrag na početnu</Link>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Podrška</h1>
        <p style={{ color: t.textMuted, marginBottom: 32 }}>Imate problem ili pitanje? Ispunite formu ispod i javit ćemo vam se u najkraćem mogućem roku.</p>

        {success ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: `1px solid ${t.accent}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" style={{ margin: '0 auto 16px' }}>
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Prijava zaprimljena!</h3>
            <p style={{ color: t.textMuted }}>Odgovorit ćemo vam u roku od 24 sata.</p>
            <button onClick={() => setSuccess(false)} style={{ marginTop: 16, padding: '10px 20px', background: t.accent, border: 'none', borderRadius: 8, color: '#000', fontWeight: 600, cursor: 'pointer' }}>
              Nova prijava
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${t.urgent}`, borderRadius: 8, padding: 12, color: t.urgent, fontSize: 14 }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Ime i prezime *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Vaše ime"
                style={{ width: '100%', padding: '12px 16px', background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 15 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="vas@email.com"
                style={{ width: '100%', padding: '12px 16px', background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 15 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Vrsta problema</label>
              <select
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 15 }}
              >
                <option value="technical">Tehnički problem</option>
                <option value="cleaner">Problem s čistačem</option>
                <option value="payment">Plaćanje</option>
                <option value="account">Problem s računom</option>
                <option value="other">Ostalo</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Poruka *</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Opišite vaš problem ili pitanje..."
                rows={6}
                style={{ width: '100%', padding: '12px 16px', background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 15, resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 24px',
                background: loading ? t.textMuted : t.accent,
                border: 'none',
                borderRadius: 8,
                color: '#000',
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {loading ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Šaljem...
                </>
              ) : 'Pošalji prijavu'}
            </button>
          </form>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${t.border}`, padding: '24px', textAlign: 'center', marginTop: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
          <Link href="/terms" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Uvjeti korištenja</Link>
          <Link href="/privacy" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Privatnost</Link>
          <Link href="/conduct" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Pravila ponašanja</Link>
          <Link href="/podrska" style={{ color: t.accent, textDecoration: 'none', fontSize: 13 }}>Podrška</Link>
        </div>
        <p style={{ color: t.textDim, fontSize: 12 }}>© 2026 sjaj.hr. Sva prava pridržana.</p>
      </footer>
    </div>
  )
}
