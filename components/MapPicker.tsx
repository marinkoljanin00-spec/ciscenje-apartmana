'use client'

import React, { useEffect, useRef, useState } from 'react'

// Croatian cities with coordinates
const CROATIAN_CITIES = [
  { name: 'Zagreb', lat: 45.8150, lng: 15.9819 },
  { name: 'Split', lat: 43.5081, lng: 16.4402 },
  { name: 'Rijeka', lat: 45.3271, lng: 14.4422 },
  { name: 'Osijek', lat: 45.5550, lng: 18.6955 },
  { name: 'Zadar', lat: 44.1194, lng: 15.2314 },
  { name: 'Pula', lat: 44.8666, lng: 13.8496 },
  { name: 'Slavonski Brod', lat: 45.1603, lng: 18.0156 },
  { name: 'Karlovac', lat: 45.4929, lng: 15.5553 },
  { name: 'Varazdin', lat: 46.3057, lng: 16.3366 },
  { name: 'Sibenik', lat: 43.7350, lng: 15.8952 },
  { name: 'Dubrovnik', lat: 42.6507, lng: 18.0944 },
  { name: 'Bjelovar', lat: 45.8986, lng: 16.8425 },
  { name: 'Koprivnica', lat: 46.1628, lng: 16.8272 },
  { name: 'Vukovar', lat: 45.3519, lng: 19.0025 },
  { name: 'Vinkovci', lat: 45.2880, lng: 18.8050 },
  { name: 'Sisak', lat: 45.4658, lng: 16.3781 },
  { name: 'Pozega', lat: 45.3403, lng: 17.6850 },
  { name: 'Cakovec', lat: 46.3842, lng: 16.4339 },
  { name: 'Virovitica', lat: 45.8319, lng: 17.3839 },
  { name: 'Makarska', lat: 43.2969, lng: 17.0175 },
]

type MapPickerProps = {
  onLocationSelect: (address: string, lat: number, lng: number) => void
  theme: {
    bg: string
    bgCard: string
    border: string
    text: string
    textMuted: string
    accent: string
  }
}

export default function MapPicker({ onLocationSelect, theme }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [selectedCity, setSelectedCity] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const LRef = useRef<any>(null)

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Add Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Load Leaflet JS
    if (!(window as any).L) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => {
        LRef.current = (window as any).L
        setLeafletLoaded(true)
      }
      document.body.appendChild(script)
    } else {
      LRef.current = (window as any).L
      setLeafletLoaded(true)
    }
  }, [])

  // Initialize map after Leaflet loads
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return

    const L = LRef.current
    
    // Create map centered on Croatia
    const map = L.map(mapRef.current).setView([44.5, 16.5], 7)
    
    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map)

    // Custom marker icon
    const customIcon = L.divIcon({
      html: `<div style="background: ${theme.accent}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })

    // Click handler for map
    map.on('click', async (e: any) => {
      const { lat, lng } = e.latlng
      
      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }
      
      // Add new marker
      markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map)
      
      // Reverse geocode
      setIsLoading(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
        const data = await res.json()
        
        let address = ''
        if (data.address) {
          const parts = []
          if (data.address.road) parts.push(data.address.road)
          if (data.address.house_number) parts.push(data.address.house_number)
          if (data.address.city || data.address.town || data.address.village) {
            parts.push(data.address.city || data.address.town || data.address.village)
          }
          address = parts.join(', ') || data.display_name
        } else {
          address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        }
        
        onLocationSelect(address, lat, lng)
      } catch {
        onLocationSelect(`${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng)
      }
      setIsLoading(false)
    })

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [leafletLoaded, theme.accent, onLocationSelect])

  // Fly to city when selected
  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName)
    if (!cityName || !mapInstanceRef.current) return
    
    const city = CROATIAN_CITIES.find(c => c.name === cityName)
    if (city) {
      mapInstanceRef.current.flyTo([city.lat, city.lng], 13, { duration: 1.5 })
    }
  }

  // Get current location
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokacija nije podrzana u vasem pregledniku')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        
        if (mapInstanceRef.current) {
          const L = LRef.current
          
          // Fly to location
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.5 })
          
          // Remove existing marker
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current)
          }
          
          // Add marker
          const customIcon = L.divIcon({
            html: `<div style="background: ${theme.accent}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
            className: 'custom-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
          markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current)
          
          // Reverse geocode
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            const data = await res.json()
            
            let address = ''
            if (data.address) {
              const parts = []
              if (data.address.road) parts.push(data.address.road)
              if (data.address.house_number) parts.push(data.address.house_number)
              if (data.address.city || data.address.town || data.address.village) {
                parts.push(data.address.city || data.address.town || data.address.village)
              }
              address = parts.join(', ') || data.display_name
            } else {
              address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
            }
            
            onLocationSelect(address, lat, lng)
          } catch {
            onLocationSelect(`${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng)
          }
        }
        setIsLoading(false)
      },
      () => {
        alert('Nije moguce dohvatiti vasu lokaciju')
        setIsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const inputStyle: React.CSSProperties = { 
    width: '100%', 
    padding: '12px 14px', 
    background: theme.bgCard, 
    border: `1px solid ${theme.border}`, 
    borderRadius: 10, 
    color: theme.text, 
    fontSize: 14, 
    outline: 'none', 
    boxSizing: 'border-box' 
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* City dropdown and GPS button */}
      <div style={{ display: 'flex', gap: 10 }}>
        <select 
          value={selectedCity} 
          onChange={e => handleCityChange(e.target.value)} 
          style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}
        >
          <option value="">Odaberi grad...</option>
          {CROATIAN_CITIES.map(city => (
            <option key={city.name} value={city.name}>{city.name}</option>
          ))}
        </select>
        
        <button 
          type="button"
          onClick={handleMyLocation}
          disabled={isLoading}
          style={{ 
            padding: '12px 16px', 
            background: theme.accent, 
            border: 'none', 
            borderRadius: 10, 
            color: '#000', 
            fontWeight: 600, 
            fontSize: 13, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
          </svg>
          GPS
        </button>
      </div>

      {/* Map container */}
      <div 
        ref={mapRef}
        style={{ 
          width: '100%', 
          height: 220, 
          borderRadius: 12, 
          border: `1px solid ${theme.border}`,
          background: theme.bgCard,
          overflow: 'hidden'
        }} 
      />

      {/* Loading indicator */}
      {isLoading && (
        <div style={{ 
          textAlign: 'center', 
          color: theme.textMuted, 
          fontSize: 13,
          padding: '8px 0'
        }}>
          Dohvacam adresu...
        </div>
      )}

      {/* Instructions */}
      <p style={{ 
        margin: 0, 
        fontSize: 12, 
        color: theme.textMuted, 
        textAlign: 'center' 
      }}>
        Klikni na mapu za postavljanje lokacije
      </p>
    </div>
  )
}
