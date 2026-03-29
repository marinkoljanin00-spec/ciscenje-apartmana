"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Crosshair } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LocationPickerProps {
  value: { lat: number; lon: number } | null
  onChange: (location: { lat: number; lon: number }) => void
  onAddressChange?: (address: string) => void
  className?: string
  cityCenter?: { lat: number; lon: number }
}

export function LocationPicker({ value, onChange, onAddressChange, className, cityCenter }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [L, setL] = useState<typeof import("leaflet") | null>(null)
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false)
  const [geocodedAddress, setGeocodedAddress] = useState<string | null>(null)

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lon: number) => {
    setIsGeocodingLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=hr`,
        {
          headers: {
            'User-Agent': 'CleanupApp/1.0'
          }
        }
      )
      const data = await response.json()
      
      if (data.address) {
        // Build address from components
        const parts: string[] = []
        
        if (data.address.road) {
          parts.push(data.address.road)
          if (data.address.house_number) {
            parts[parts.length - 1] += ` ${data.address.house_number}`
          }
        } else if (data.address.pedestrian) {
          parts.push(data.address.pedestrian)
        } else if (data.address.neighbourhood) {
          parts.push(data.address.neighbourhood)
        }
        
        const address = parts.join(', ') || data.display_name.split(',')[0]
        setGeocodedAddress(address)
        onAddressChange?.(address)
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
    } finally {
      setIsGeocodingLoading(false)
    }
  }

  // Default to Split, Croatia
  const defaultCenter = { lat: 43.508, lon: 16.44 }

  useEffect(() => {
    // Dynamically import leaflet on client side only
    const loadLeaflet = async () => {
      const leaflet = await import("leaflet")
      setL(leaflet.default)
      setIsLoaded(true)
    }
    loadLeaflet()
  }, [])

  useEffect(() => {
    if (!isLoaded || !L || !mapRef.current || mapInstanceRef.current) return

    // Fix for default marker icons
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    })

    const center = value || cityCenter || defaultCenter
    const map = L.map(mapRef.current).setView([center.lat, center.lon], 14)

    // Use CartoDB Positron for a cleaner, more modern look
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map)

    // Custom green marker
    const greenIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: oklch(0.65 0.2 145); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })

    if (value) {
      markerRef.current = L.marker([value.lat, value.lon], { icon: greenIcon }).addTo(map)
    }

    map.on("click", (e) => {
      const { lat, lng } = e.latlng
      
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = L.marker([lat, lng], { icon: greenIcon }).addTo(map)
      }
      
      onChange({ lat, lon: lng })
      // Trigger reverse geocoding
      reverseGeocode(lat, lng)
    })

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [isLoaded, L])

  // Update marker when value changes externally
  useEffect(() => {
    if (!isLoaded || !L || !mapInstanceRef.current) return
    
    if (value && markerRef.current) {
      markerRef.current.setLatLng([value.lat, value.lon])
      mapInstanceRef.current.setView([value.lat, value.lon], 14)
    }
    
    // Reset geocoded address when value is cleared
    if (!value) {
      setGeocodedAddress(null)
    }
  }, [value, isLoaded, L])

  // Center map on city when cityCenter changes
  useEffect(() => {
    if (!isLoaded || !L || !mapInstanceRef.current || !cityCenter) return
    
    // Only update view if there's no marker set yet (user hasn't picked a location)
    if (!value) {
      mapInstanceRef.current.setView([cityCenter.lat, cityCenter.lon], 14)
    }
  }, [cityCenter, isLoaded, L, value])

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current || !L) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        const greenIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background-color: oklch(0.65 0.2 145); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })

        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude])
        } else {
          markerRef.current = L.marker([latitude, longitude], { icon: greenIcon }).addTo(mapInstanceRef.current!)
        }
        
        mapInstanceRef.current!.setView([latitude, longitude], 16)
        onChange({ lat: latitude, lon: longitude })
        // Trigger reverse geocoding
        reverseGeocode(latitude, longitude)
      },
      (error) => {
        console.error("Geolocation error:", error)
      }
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Kliknite na mapu za odabir lokacije</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLocateMe}
          className="gap-2"
        >
          <Crosshair className="w-4 h-4" />
          Moja lokacija
        </Button>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-[300px] rounded-lg border border-border overflow-hidden"
        style={{ zIndex: 0 }}
      />
      
      {value && (
        <div className="mt-2 space-y-1">
          {isGeocodingLoading ? (
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Dohvacam adresu...
            </p>
          ) : geocodedAddress ? (
            <p className="text-sm text-foreground font-medium flex items-center gap-2">
              <MapPin className="w-3 h-3 text-primary" />
              {geocodedAddress}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Koordinate: {value.lat.toFixed(5)}, {value.lon.toFixed(5)}
          </p>
        </div>
      )}

      {/* Leaflet CSS */}
      <style jsx global>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css');
        
        .leaflet-container {
          background: var(--background);
          font-family: inherit;
        }
        
        .leaflet-control-attribution {
          background: var(--card) !important;
          color: var(--muted-foreground) !important;
          font-size: 10px;
        }
        
        .leaflet-control-attribution a {
          color: var(--primary) !important;
        }
        
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
        }
        
        .leaflet-control-zoom a {
          background: var(--card) !important;
          color: var(--foreground) !important;
          border: 1px solid var(--border) !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: var(--secondary) !important;
        }
        
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  )
}
