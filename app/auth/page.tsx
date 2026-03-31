'use client'

import React, { useState } from 'react'

type User = {
  id: number
  email: string
  role: 'client' | 'cleaner'
}

export default function AuthPage({ onLoginSuccess }: { onLoginSuccess?: (user: User) => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState('client')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regName, setRegName] = useState('')
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (data.success && data.user) {
        if (onLoginSuccess) {
          onLoginSuccess(data.user)
        } else {
          window.location.href = '/'
        }
      } else {
        setLoginError(data.error || 'Neispravan email ili lozinka.')
        setLoginLoading(false)
      }
    } catch {
      setLoginError('Mrezna greska.')
      setLoginLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegError('')
    setRegLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword, fullName: regName, role }),
      })
      const data = await res.json()
      if (data.success && data.user) {
        if (onLoginSuccess) {
          onLoginSuccess(data.user)
        } else {
          window.location.href = '/'
        }
      } else {
        setRegError(data.error || 'Greska pri registraciji.')
        setRegLoading(false)
      }
    } catch {
      setRegError('Mrezna greska.')
      setRegLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f1f5f9', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '2px solid #000000',
        boxShadow: '8px 8px 0 #000000',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            backgroundColor: '#000000', 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#ffffff',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            S
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: '#000000' }}>SJAJ</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#525252' }}>Platforma za ciscenje</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', border: '2px solid #000000' }}>
          <button
            type="button"
            onClick={() => setTab('login')}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: tab === 'login' ? '#000000' : '#ffffff',
              color: tab === 'login' ? '#ffffff' : '#000000',
              border: 'none',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            PRIJAVA
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: tab === 'register' ? '#000000' : '#ffffff',
              color: tab === 'register' ? '#ffffff' : '#000000',
              border: 'none',
              borderLeft: '2px solid #000000',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            REGISTRACIJA
          </button>
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#000000', fontWeight: '600', marginBottom: '0.5rem' }}>
                EMAIL
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                placeholder="vas@email.com"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000',
                  fontSize: '1rem',
                  color: '#000000',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#000000', fontWeight: '600', marginBottom: '0.5rem' }}>
                LOZINKA
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                placeholder="********"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000',
                  fontSize: '1rem',
                  color: '#000000',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {loginError && (
              <div style={{ 
                backgroundColor: '#fef2f2', 
                border: '2px solid #dc2626', 
                color: '#dc2626', 
                padding: '0.75rem', 
                marginBottom: '1rem'
              }}>
                {loginError}
              </div>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: '#000000',
                color: '#ffffff',
                border: '2px solid #000000',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                opacity: loginLoading ? 0.6 : 1
              }}
            >
              {loginLoading ? 'Prijava...' : 'PRIJAVI SE'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#000000', fontWeight: '600', marginBottom: '0.5rem' }}>
                IME I PREZIME
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                placeholder="Ivan Horvat"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000',
                  fontSize: '1rem',
                  color: '#000000',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#000000', fontWeight: '600', marginBottom: '0.5rem' }}>
                EMAIL
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                placeholder="vas@email.com"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000',
                  fontSize: '1rem',
                  color: '#000000',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#000000', fontWeight: '600', marginBottom: '0.5rem' }}>
                LOZINKA
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                placeholder="********"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000',
                  fontSize: '1rem',
                  color: '#000000',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#000000', fontWeight: '600', marginBottom: '0.5rem' }}>
                ULOGA
              </label>
              <div style={{ display: 'flex', border: '2px solid #000000' }}>
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: role === 'client' ? '#000000' : '#ffffff',
                    color: role === 'client' ? '#ffffff' : '#000000',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Klijent
                </button>
                <button
                  type="button"
                  onClick={() => setRole('cleaner')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: role === 'cleaner' ? '#000000' : '#ffffff',
                    color: role === 'cleaner' ? '#ffffff' : '#000000',
                    border: 'none',
                    borderLeft: '2px solid #000000',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cistac
                </button>
              </div>
            </div>
            {regError && (
              <div style={{ 
                backgroundColor: '#fef2f2', 
                border: '2px solid #dc2626', 
                color: '#dc2626', 
                padding: '0.75rem', 
                marginBottom: '1rem'
              }}>
                {regError}
              </div>
            )}
            <button
              type="submit"
              disabled={regLoading}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: '#000000',
                color: '#ffffff',
                border: '2px solid #000000',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: regLoading ? 'not-allowed' : 'pointer',
                opacity: regLoading ? 0.6 : 1
              }}
            >
              {regLoading ? 'Registracija...' : 'REGISTRIRAJ SE'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
