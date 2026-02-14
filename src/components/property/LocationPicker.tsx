'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type LocationPickerProps = {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lng: number) => void
  className?: string
}

function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function LocationPicker({ latitude, longitude, onLocationChange, className = '' }: LocationPickerProps) {
  // Recenter map when coordinates change externally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const map = (window as any).leafletMap
      if (map && latitude && longitude) {
        map.setView([latitude, longitude], 13)
      }
    }
  }, [latitude, longitude])

  return (
    <div className={`relative rounded-xl overflow-hidden border-2 border-stone-300 dark:border-gray-700 ${className}`}>
      <MapContainer
        center={[latitude || 19.0760, longitude || 72.8777]} // Default to Mumbai
        zoom={13}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        className="z-0"
        ref={(map) => {
          if (map && typeof window !== 'undefined') {
            (window as any).leafletMap = map
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {latitude && longitude && (
          <Marker position={[latitude, longitude]} />
        )}
        <MapClickHandler onLocationChange={onLocationChange} />
      </MapContainer>
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-lg border border-stone-200 dark:border-gray-700 z-[1000]">
        <p className="text-xs text-stone-600 dark:text-gray-300 font-medium">
          📍 Click on map to set location
        </p>
      </div>
    </div>
  )
}
