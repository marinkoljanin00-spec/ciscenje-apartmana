'use client'

import React, { useEffect, useState } from 'react'

type CookieConsent = {
  given: boolean
  essential: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieBanner({ onConsent }: { onConsent: (consent: CookieConsent) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Provjeri postoji li vec privola u localStorage
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      setVisible(true)
    } else {
      onConsent(JSON.parse(consent))
    }
  }, [onConsent])

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      given: true,
      essential: true,
      analytics: true,
      marketing: true,
    }
    localStorage.setItem('cookie_consent', JSON.stringify(consent))
    setVisible(false)
    onConsent(consent)
  }

  const handleEssentialOnly = () => {
    const consent: CookieConsent = {
      given: true,
      essential: true,
      analytics: false,
      marketing: false,
    }
    localStorage.setItem('cookie_consent', JSON.stringify(consent))
    setVisible(false)
    onConsent(consent)
  }

  if (!visible) return null

  return (
    <>
      {/* Blur overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 998,
          backdropFilter: 'blur(5px)',
        }}
      />
      
      {/* Banner */}
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#111111',
          border: '1px solid #1f1f1f',
          borderRadius: '1rem',
          padding: '2rem',
          zIndex: 999,
          maxWidth: '600px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
        }}
      >
        <h3 style={{ 
          color: '#ffffff', 
          margin: '0 0 1rem 0', 
          fontSize: '1.25rem', 
          fontWeight: '700' 
        }}>
          🍪 Kolačići i Privatnost
        </h3>
        <p style={{ 
          color: '#a3a3a3', 
          margin: '0 0 1.5rem 0', 
          fontSize: '0.95rem',
          lineHeight: '1.6'
        }}>
          Koristimo kolačiće kako bi vam pružili najbolje iskustvo i sigurnost. Neophodni kolačići omogućuju rad aplikacije 
          (prijava, sigurnost). Možete izbjeći sve kolačiće osim neophodnih.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={handleEssentialOnly}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              border: '1px solid #262626',
              color: '#a3a3a3',
              cursor: 'pointer',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = '#10b981')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = '#262626')}
          >
            Samo neophodni
          </button>
          <button
            onClick={handleAcceptAll}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              border: 'none',
              color: '#000000',
              cursor: 'pointer',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
          >
            Prihvati sve
          </button>
        </div>
      </div>
    </>
  )
}


export function CookieBanner({ onConsent }: { onConsent: (consent: CookieConsent) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Provjeri postoji li vec privola u localStorage
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      setVisible(true)
    } else {
      onConsent(JSON.parse(consent))
    }
  }, [onConsent])

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      given: true,
      essential: true,
      analytics: true,
      marketing: true,
    }
    localStorage.setItem('cookie_consent', JSON.stringify(consent))
    setVisible(false)
    onConsent(consent)
  }

  const handleEssentialOnly = () => {
    const consent: CookieConsent = {
      given: true,
      essential: true,
      analytics: false,
      marketing: false,
    }
    localStorage.setItem('cookie_consent', JSON.stringify(consent))
    setVisible(false)
    onConsent(consent)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: '1.5rem',
        zIndex: 9999,
        maxHeight: '200px',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Koristimo kolačiće kako bi poboljšali vašu iskustvo. Neophodni kolačići omogućuju rad aplikacije (prijava, sigurnost).
          Analitički kolačići nam pomažu razumjeti kako koristite aplikaciju.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={handleEssentialOnly}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              border: '1px solid #fff',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            Samo neophodni
          </button>
          <button
            onClick={handleAcceptAll}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4CAF50',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            Prihvati sve
          </button>
        </div>
      </div>
    </div>
  )
}
