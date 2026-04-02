'use client'

import { useState } from 'react'
import Link from 'next/link'

const t = { bg: '#050505', card: '#111111', border: '#1f1f1f', text: '#ffffff', textMuted: '#a3a3a3', accent: '#10b981', accentGlow: 'rgba(16, 185, 129, 0.15)' }
const inputStyle = { width: '100%', padding: '14px 16px', background: '#0a0a0a', border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const }
const btnPrimary = { padding: '14px 28px', background: t.accent, border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer' }

export default function PodrskaPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('technical')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      })
      const data = await res.json()
      
      if (data.success) {
        setSuccess(true)
        setName(''); setEmail(''); setMessage('')
      } else {
        setError(data.error || 'Došlo je do greške')
      }
    } catch {
      setError('Mrežna greška')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text }}>
      <header style={{ padding: '20px 32px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 24, color: t.text, textDecoration: 'none' }}>sjaj.hr</Link>
        <Link href="/" style={{ color: t.accent, textDecoration: 'none', fontSize: 14 }}>← Povratak</Link>
      </header>
      
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Podrška</h1>
        <p style={{ color: t.textMuted, marginBottom: 24 }}>Imate problem ili pitanje? Javite nam se i odgovorit ćemo u najkraćem roku.</p>
        
        <div style={{ background: t.accentGlow, border: `1px solid ${t.accent}`, padding: 20, borderRadius: 12, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, background: t.accent, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✉</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: t.text, marginBottom: 4 }}>Kontaktirajte nas direktno</div>
            <a href="mailto:info.sjaj.hr@gmail.com" style={{ color: t.accent, fontSize: 16, fontWeight: 700, textDecoration: 'none' }}>info.sjaj.hr@gmail.com</a>
          </div>
        </div>
        
        {success ? (
          <div style={{ background: t.accentGlow, border: `1px solid ${t.accent}`, padding: 32, borderRadius: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Prijava zaprimljena!</h2>
            <p style={{ color: t.textMuted }}>Odgovorit ćemo vam u roku od 24 sata.</p>
            <button onClick={() => setSuccess(false)} style={{ ...btnPrimary, marginTop: 24 }}>Pošalji novu prijavu</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: t.card, padding: 32, borderRadius: 16, border: `1px solid ${t.border}` }}>
            {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: 14, marginBottom: 20, borderRadius: 10, color: '#ef4444', fontSize: 14 }}>{error}</div>}
            
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="name" style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: t.textMuted }}>Ime i prezime</label>
              <input id="name" name="name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Vaše ime" style={inputStyle} />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="email" style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: t.textMuted }}>Email</label>
              <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vas@email.com" style={inputStyle} />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="subject" style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: t.textMuted }}>Vrsta problema</label>
              <select id="subject" name="subject" value={subject} onChange={e => setSubject(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="technical">Tehnički problem</option>
                <option value="cleaner">Problem s čistačem</option>
                <option value="payment">Plaćanje</option>
                <option value="account">Problem s računom</option>
                <option value="other">Ostalo</option>
              </select>
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label htmlFor="message" style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: t.textMuted }}>Opis problema</label>
              <textarea id="message" name="message" value={message} onChange={e => setMessage(e.target.value)} required placeholder="Opišite svoj problem što detaljnije..." rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            
            <button type="submit" disabled={submitting} style={{ ...btnPrimary, width: '100%', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Šaljem...' : 'Pošalji prijavu'}
            </button>
          </form>
        )}
      </main>

      <footer style={{ padding: '24px 32px', borderTop: `1px solid ${t.border}`, textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <Link href="/terms" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Uvjeti korištenja</Link>
          <Link href="/privacy" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Privatnost</Link>
          <Link href="/conduct" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Pravila ponašanja</Link>
          <Link href="/podrska" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 13 }}>Podrška</Link>
        </div>
        <div style={{ marginBottom: 12 }}>
          <a href="mailto:info.sjaj.hr@gmail.com" style={{ color: t.accent, textDecoration: 'none', fontSize: 13 }}>info.sjaj.hr@gmail.com</a>
        </div>
        <p style={{ color: '#737373', fontSize: 12, margin: 0 }}>© 2026 sjaj.hr. Sva prava pridržana.</p>
      </footer>
    </div>
  )
}
