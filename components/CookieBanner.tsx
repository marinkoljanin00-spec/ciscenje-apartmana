'use client'

import { useEffect, useState } from 'react'

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
