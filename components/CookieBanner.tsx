'use client'
// v2 - single export

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
      
      {/* Banner - Neo-brutalist style */}
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ffffff',
          border: '2px solid #000000',
          borderRadius: '0',
          padding: '2rem',
          zIndex: 999,
          maxWidth: '500px',
          width: '90%',
          boxShadow: '4px 4px 0 #000000',
        }}
      >
        <h3 style={{ 
          color: '#000000', 
          margin: '0 0 1rem 0', 
          fontSize: '1.25rem', 
          fontWeight: '700' 
        }}>
          Kolacici i Privatnost
        </h3>
        <p style={{ 
          color: '#525252', 
          margin: '0 0 1.5rem 0', 
          fontSize: '0.95rem',
          lineHeight: '1.6'
        }}>
          Koristimo kolacice kako bi vam pruzili najbolje iskustvo. Neophodni kolacici omogucuju rad aplikacije.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={handleEssentialOnly}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ffffff',
              border: '2px solid #000000',
              color: '#000000',
              cursor: 'pointer',
              borderRadius: '0',
              fontSize: '0.95rem',
              fontWeight: '600',
            }}
          >
            Samo neophodni
          </button>
          <button
            onClick={handleAcceptAll}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#000000',
              border: '2px solid #000000',
              color: '#ffffff',
              cursor: 'pointer',
              borderRadius: '0',
              fontSize: '0.95rem',
              fontWeight: '600',
            }}
          >
            Prihvati sve
          </button>
        </div>
      </div>
    </>
  )
}
