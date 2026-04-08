'use client'
import { useState, useEffect } from 'react'
import { LandingPage } from '@/components/landing-page'
import { AuthPage } from '@/components/auth-page'
import { ClientDash } from '@/components/client-dash'
import { CleanerDash } from '@/components/cleaner-dash'
import { t, User } from '@/components/shared'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard'>('landing')
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'verify'>('login')
  const [userRole, setUserRole] = useState<'client' | 'cleaner' | 'admin' | null>(null)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [verificationEmail, setVerificationEmail] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(async data => {
        if (data.forceLogout) {
          window.location.href = '/'
          return
        }
        if (data.user) {
          if (!data.user.email_verified) {
            await fetch('/api/auth/send-verification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: data.user.email })
            })
            setView('auth')
            setAuthMode('verify')
            setVerificationEmail(data.user.email)
          } else {
            if (data.user.role === 'admin') {
              window.location.href = '/admin-dashboard'
              return
            }
            setUserRole(data.user.role)
            setUserName(data.user.email)
            setUserId(data.user.id.toString())
            setView('dashboard')
          }
        }
      })
      .catch(() => {})
      .finally(() => setMounted(true))
  }, [])

  const login = (u: User) => {
    if (u.role === 'admin') {
      window.location.href = '/admin-dashboard'
      return
    }
    setUserRole(u.role as 'client' | 'cleaner')
    setUserName(u.email)
    setUserId(u.id.toString())
    setView('dashboard')
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUserRole(null)
    setUserName('')
    setUserId('')
    setView('landing')
  }

  if (!mounted) return <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: t.accent, fontSize: 20, fontWeight: 600 }}>Učitavanje...</div></div>
  if (view === 'landing') return <LandingPage onLogin={() => { setAuthMode('login'); setView('auth') }} onRegister={() => { setAuthMode('register'); setView('auth') }} />
  if (view === 'auth') return <AuthPage mode={authMode} setMode={setAuthMode} onLogin={login} onBack={() => setView('landing')} initialEmail={verificationEmail} showVerificationOnMount={authMode === 'verify'} />
  if (userRole === 'client') return <ClientDash logout={logout} name={userName} uid={userId} />
  if (userRole === 'cleaner') return <CleanerDash logout={logout} name={userName} uid={userId} />
  return null
}
