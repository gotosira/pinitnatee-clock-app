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
  try {
    const rev = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      { headers: { 'User-Agent': 'pinit-landing' } }
    )
    if (rev.ok) {
      const j = await rev.json()
      name = j.address?.city || j.address?.town || j.address?.village || j.display_name
    }
  } catch {}

  try {
    const elev = await fetch(
      `https://api.opentopodata.org/v1/etopo1?locations=${lat},${lon}`
    )
    const ej = await elev.json()
    if (ej && ej.results && ej.results[0]) elevationM = EJNumber(ej.results[0].elevation)
  } catch {}

  return { lat, lon, name, elevationM }
}

function EJNumber(n: any): number | undefined {
  const x = Number(n)
  return Number.isFinite(x) ? x : undefined
}


