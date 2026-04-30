import { useEffect, useState } from 'react'
import { useCurrentLocation } from './useLocation'
import { useLocalStorage } from './useLocalStorage'

export type TempUnit = 'C' | 'F'

const REFRESH_INTERVAL_MS = 10 * 60 * 1000 // 10 min

export function useTemperature() {
  const geo = useCurrentLocation()
  const [unit] = useLocalStorage<TempUnit>('tempUnit', 'C')
  const [celsius, setCelsius] = useState<number | null>(null)
  const [code, setCode] = useState<number | null>(null)

  useEffect(() => {
    if (!geo) return
    let cancelled = false

    async function fetchTemp(lat: number, lon: number) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
        const res = await fetch(url)
        const json = await res.json()
        if (cancelled) return
        setCelsius(json.current?.temperature_2m ?? null)
        setCode(json.current?.weather_code ?? null)
      } catch (err) {
        console.warn('[temperature] fetch failed', err)
        if (!cancelled) setCelsius(null)
      }
    }

    fetchTemp(geo.lat, geo.lon)
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') fetchTemp(geo.lat, geo.lon)
    }, REFRESH_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [geo?.lat, geo?.lon])

  const value = celsius === null ? null : unit === 'C' ? celsius : celsius * 9 / 5 + 32
  return { value, unit, code }
}
