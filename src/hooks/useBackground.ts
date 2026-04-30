import { useEffect, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { fetchRandomUnsplashUrl, isUnsplashTemporarilyDisabled } from '../services/unsplash'
import { useCurrentLocation } from './useLocation'
import { useTemperature } from './useTemperature'
import { weatherKeywords } from '../utils/weather'
import { timeOfDayKeywords } from '../utils/timeKeywords'

let bgInitialized = false
let bgIntervalHandle: number | null = null
const REFRESH_INTERVAL_MS = 5 * 60 * 1000
const PRELOAD_TIMEOUT_MS = 7000

function picsumUrl(): string {
  const width = Math.max(1280, window.innerWidth)
  const height = Math.max(720, window.innerHeight)
  const ts = Date.now()
  return `https://picsum.photos/${width}/${height}?random=${ts}`
}

function isAscii(s: string) {
  for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) > 127) return false
  return true
}

export function useBackground() {
  const [url, setUrl] = useLocalStorage<string>('bgUrl', '')
  const geo = useCurrentLocation()
  const temp = useTemperature()

  const style = useMemo(() => {
    const isCoarse =
      typeof window !== 'undefined' &&
      !!(window.matchMedia && window.matchMedia('(pointer:coarse)').matches)
    const base: Record<string, string> = {
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundAttachment: isCoarse ? 'scroll' : 'fixed',
      backgroundColor: '#111111',
    }
    if (url) {
      const clean = url.replace(/^"|"$/g, '')
      base.backgroundImage = `url(${clean})`
    }
    return base
  }, [url])

  function emitSet(nextUrl: string) {
    const ev = new CustomEvent('bg:set', { detail: { url: nextUrl } })
    window.dispatchEvent(ev)
  }

  function preloadAndSet(nextUrl: string) {
    const img = new Image()
    img.onload = () => {
      setUrl(nextUrl)
      emitSet(nextUrl)
    }
    img.src = nextUrl
  }

  async function randomize() {
    const city = geo?.name && isAscii(geo.name) ? geo.name : undefined
    const wKeys = weatherKeywords(temp.code)
    const tKeys = timeOfDayKeywords(new Date())
    const keywords = [...(city ? [city] : []), 'city', ...wKeys, ...tKeys]
    const disabled = isUnsplashTemporarilyDisabled()
    const apiUrl = disabled ? null : await fetchRandomUnsplashUrl(keywords)
    const lastResort = picsumUrl()
    const candidate = apiUrl || lastResort

    let settled = false
    const timer = window.setTimeout(() => {
      if (settled) return
      settled = true
      preloadAndSet(lastResort)
    }, PRELOAD_TIMEOUT_MS)

    const img = new Image()
    img.onload = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      preloadAndSet(candidate)
    }
    img.onerror = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      preloadAndSet(lastResort)
    }
    img.src = candidate
  }

  function resetDefault() {
    setUrl('')
    emitSet('')
  }

  useEffect(() => {
    const onSet = (evt: Event) => {
      const e = evt as CustomEvent<{ url: string }>
      if (!e.detail) return
      setUrl(e.detail.url)
    }
    window.addEventListener('bg:set', onSet as EventListener)

    if (!bgInitialized) {
      bgInitialized = true
      randomize()
      bgIntervalHandle = window.setInterval(() => {
        if (document.visibilityState === 'visible') randomize()
      }, REFRESH_INTERVAL_MS)
    }

    return () => {
      window.removeEventListener('bg:set', onSet as EventListener)
    }
    // randomize captures geo/temp via closure; we intentionally only run init once
    // to avoid refetching backgrounds on every location/weather update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { url, setUrl, style, randomize, resetDefault }
}

// Exposed for tests / hot-reload teardown.
export function _resetBackgroundForTesting() {
  if (bgIntervalHandle !== null) {
    window.clearInterval(bgIntervalHandle)
    bgIntervalHandle = null
  }
  bgInitialized = false
}
