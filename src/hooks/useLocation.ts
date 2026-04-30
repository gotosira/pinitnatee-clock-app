import { useEffect, useState } from 'react'

export type Geo = { lat: number; lon: number; name?: string; elevationM?: number }

const FALLBACK: Geo = { lat: 13.7563, lon: 100.5018, name: 'Bangkok' }
const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 60 * 60 * 1000, // accept up to 1h-old fix — clock app doesn't need GPS-grade precision
  timeout: 8000,
}

let cachedGeo: Geo | null = null

export function useCurrentLocation(): Geo | null {
  const [geo, setGeo] = useState<Geo | null>(cachedGeo)

  useEffect(() => {
    if (cachedGeo) return
    if (!navigator.geolocation) {
      enrichLocation(FALLBACK.lat, FALLBACK.lon).then((g) => {
        cachedGeo = g
        setGeo(g)
      })
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const enriched = await enrichLocation(pos.coords.latitude, pos.coords.longitude)
        cachedGeo = enriched
        setGeo(enriched)
      },
      async () => {
        const enriched = await enrichLocation(FALLBACK.lat, FALLBACK.lon)
        cachedGeo = enriched
        setGeo(enriched)
      },
      POSITION_OPTIONS,
    )
  }, [])

  return geo
}

async function enrichLocation(lat: number, lon: number): Promise<Geo> {
  const [name, elevationM] = await Promise.all([
    fetchPlaceName(lat, lon),
    fetchElevation(lat, lon),
  ])
  return { lat, lon, name, elevationM }
}

async function fetchPlaceName(lat: number, lon: number): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    )
    if (!res.ok) return undefined
    const j = await res.json()
    return j.city || j.locality || j.principalSubdivision || j.countryName
  } catch (err) {
    console.warn('[location] reverse-geocode failed', err)
    return undefined
  }
}

async function fetchElevation(lat: number, lon: number): Promise<number | undefined> {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`)
    if (!res.ok) return undefined
    const j = await res.json()
    if (Array.isArray(j?.elevation) && j.elevation.length > 0) {
      const n = Number(j.elevation[0])
      return Number.isFinite(n) ? n : undefined
    }
    return undefined
  } catch (err) {
    console.warn('[location] elevation lookup failed', err)
    return undefined
  }
}
