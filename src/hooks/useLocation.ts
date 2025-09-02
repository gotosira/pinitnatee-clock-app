import { useEffect, useState } from 'react'

type Geo = { lat: number; lon: number; name?: string; elevationM?: number }

export function useCurrentLocation(): Geo | null {
  const [geo, setGeo] = useState<Geo | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        const info = await enrichLocation(lat, lon)
        setGeo(info)
      },
      () => {
        // fallback Bangkok
        enrichLocation(13.7563, 100.5018).then(setGeo)
      },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 8_000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return geo
}

async function enrichLocation(lat: number, lon: number): Promise<Geo> {
  let name: string | undefined
  let elevationM: number | undefined
  // Reverse geocoding via Open-Meteo (CORS-friendly)
  try {
    const rev = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en`
    )
    if (rev.ok) {
      const j = await rev.json()
      if (Array.isArray(j.results) && j.results.length > 0) {
        const r = j.results[0]
        name = r.name || r.admin2 || r.admin1 || r.country || undefined
      }
    }
  } catch {}

  // Elevation via Open-Meteo Elevation API (CORS-friendly)
  try {
    const elev = await fetch(
      `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`
    )
    if (elev.ok) {
      const ej = await elev.json()
      if (ej && Array.isArray(ej.elevation) && ej.elevation.length > 0) {
        elevationM = EJNumber(ej.elevation[0])
      }
    }
  } catch {}

  return { lat, lon, name, elevationM }
}

function EJNumber(n: any): number | undefined {
  const x = Number(n)
  return Number.isFinite(x) ? x : undefined
}


