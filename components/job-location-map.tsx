"use client"

import { useEffect, useRef, useState } from "react"

interface JobLocationMapProps {
  lat: number
  lon: number
  className?: string
}

export function JobLocationMap({ lat, lon, className }: JobLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [L, setL] = useState<typeof import("leaflet") | null>(null)

  useEffect(() => {
    const loadLeaflet = async () => {
      const leaflet = await import("leaflet")
      setL(leaflet.default)
      setIsLoaded(true)
    }
    loadLeaflet()
  }, [])

  useEffect(() => {
    if (!isLoaded || !L || !mapRef.current || mapInstanceRef.current) return

    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    })

    const map = L.map(mapRef.current, {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    }).setView([lat, lon], 15)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OSM',
    }).addTo(map)

    const greenIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: oklch(0.65 0.2 145); width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    })

    L.marker([lat, lon], { icon: greenIcon }).addTo(map)
    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isLoaded, L, lat, lon])

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="w-full h-[120px] rounded-lg border border-border overflow-hidden"
        style={{ zIndex: 0 }}
      />
      <style jsx global>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css');
        
        .leaflet-container {
          background: var(--background);
        }
        
        .leaflet-control-attribution {
          background: var(--card) !important;
          color: var(--muted-foreground) !important;
          font-size: 8px;
          padding: 2px 4px !important;
        }
        
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  )
}
