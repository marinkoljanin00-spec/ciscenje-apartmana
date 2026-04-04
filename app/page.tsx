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
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [userRole, setUserRole] = useState<'client' | 'cleaner' | null>(null)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const role = localStorage.getItem('user_role') as 'client' | 'cleaner' | null
    const name = localStorage.getItem('user_email') || ''
    const id = localStorage.getItem('user_id') || ''
    if (role && id) { setUserRole(role); setUserName(name); setUserId(id); setView('dashboard') }
    setMounted(true)
  }, [])

  const login = (u: User) => {
    localStorage.setItem('user_role', u.role)
    localStorage.setItem('user_id', u.id.toString())
    localStorage.setItem('user_email', u.email)
    setUserRole(u.role); setUserName(u.email); setUserId(u.id.toString()); setView('dashboard')
  }

  const logout = () => { localStorage.clear(); setUserRole(null); setUserName(''); setUserId(''); setView('landing') }

  if (!mounted) return <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: t.accent, fontSize: 20, fontWeight: 600 }}>Učitavanje...</div></div>
  if (view === 'landing') return <LandingPage onLogin={() => { setAuthMode('login'); setView('auth') }} onRegister={() => { setAuthMode('register'); setView('auth') }} />
  if (view === 'auth') return <AuthPage mode={authMode} setMode={setAuthMode} onLogin={login} onBack={() => setView('landing')} />
  if (userRole === 'client') return <ClientDash logout={logout} name={userName} uid={userId} />
  if (userRole === 'cleaner') return <CleanerDash logout={logout} name={userName} uid={userId} />
  return null
}
