import { useEffect, useMemo, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { fetchRandomUnsplashUrl } from '../services/unsplash'
import { useCurrentLocation } from './useLocation'
import { useTemperature } from './useTemperature'
import { weatherKeywords } from '../utils/weather'
import { timeOfDayKeywords } from '../utils/timeKeywords'

export type BackgroundMode = 'unsplash'

// No default wallpaper; solid color will be used until Unsplash loads

// We intentionally do not use source.unsplash.com fallback to keep solid bg as the only fallback.

export function useBackground() {
  const initRef = useRef(false)
  const [mode, setMode] = useLocalStorage<BackgroundMode>('bgMode', 'unsplash')
  const [url, setUrl] = useLocalStorage<string>('bgUrl', '')
  const geo = useCurrentLocation()
  const temp = useTemperature()

  // Removed eager fallback setter to avoid multiple image fetches on load

  const style = useMemo(() => {
    const base: Record<string, string> = {
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      backgroundColor: '#111111'
    }
    if (url) base.backgroundImage = `url(${url})`
    return base
  }, [url])

  function emitSet(nextUrl: string, nextMode: BackgroundMode) {
    try {
      const ev = new CustomEvent('bg:set', { detail: { url: nextUrl, mode: nextMode } })
      window.dispatchEvent(ev)
    } catch {}
  }

  function preloadAndSet(nextUrl: string) {
    const img = new Image()
    img.referrerPolicy = 'no-referrer'
    img.onload = () => {
      setUrl(nextUrl)
      setMode('unsplash')
      emitSet(nextUrl, 'unsplash')
    }
    img.onerror = () => {
      // keep current background if the new one fails to load
    }
    img.src = nextUrl
  }

  async function randomize() {
    setMode('unsplash')
    const city = geo?.name
    const wKeys = weatherKeywords(temp.code)
    const tKeys = timeOfDayKeywords(new Date())
    const apiUrl = await fetchRandomUnsplashUrl([
      ...(city ? [city] : []),
      'city',
      ...wKeys,
      ...tKeys
    ])
    if (apiUrl) preloadAndSet(apiUrl)
    // if null, keep solid dark background
  }

  function resetDefault() {
    setUrl('')
    emitSet('', 'unsplash')
  }

  useEffect(() => {
    const initialized = initRef.current
    if (initialized) return
    initRef.current = true
    const onSet = (evt: Event) => {
      const e = evt as CustomEvent<{ url: string; mode: BackgroundMode }>
      if (!e.detail) return
      setUrl(e.detail.url)
      setMode(e.detail.mode)
    }
    window.addEventListener('bg:set', onSet as EventListener)
    // Immediately fetch a fresh image on load
    randomize()
    // Auto-refresh every 5 minutes
    const id = window.setInterval(() => {
      randomize()
    }, 5 * 60 * 1000)
    return () => {
      window.removeEventListener('bg:set', onSet as EventListener)
      window.clearInterval(id)
    }
  }, [])

  return { mode, setMode, url, setUrl, style, randomize, resetDefault }
}


