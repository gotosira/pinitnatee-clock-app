import { useEffect, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { fetchRandomUnsplashUrl } from '../services/unsplash'

export type BackgroundMode = 'default' | 'unsplash'

function defaultImageUrl() {
  return 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop'
}

function unsplashRandomUrl() {
  const width = Math.max(1280, window.innerWidth)
  const height = Math.max(720, window.innerHeight)
  const sig = Math.floor(Math.random() * 10_000_000)
  return `https://source.unsplash.com/${width}x${height}/?nature,landscape,forest,river&sig=${sig}`
}

export function useBackground() {
  const [mode, setMode] = useLocalStorage<BackgroundMode>('bgMode', 'default')
  const [url, setUrl] = useLocalStorage<string>('bgUrl', defaultImageUrl())

  useEffect(() => {
    if (mode === 'unsplash' && !url) {
      setUrl(unsplashRandomUrl())
    }
  }, [mode])

  const style = useMemo(
    () => ({
      backgroundImage: `url(${url || defaultImageUrl()})`,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed'
    }),
    [url]
  )

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
    const apiUrl = await fetchRandomUnsplashUrl()
    const next = apiUrl || unsplashRandomUrl()
    preloadAndSet(next)
  }

  function resetDefault() {
    setMode('default')
    setUrl(defaultImageUrl())
    emitSet(defaultImageUrl(), 'default')
  }

  useEffect(() => {
    const onSet = (evt: Event) => {
      const e = evt as CustomEvent<{ url: string; mode: BackgroundMode }>
      if (!e.detail) return
      setUrl(e.detail.url)
      setMode(e.detail.mode)
    }
    window.addEventListener('bg:set', onSet as EventListener)
    return () => {
      window.removeEventListener('bg:set', onSet as EventListener)
    }
  }, [])

  return { mode, setMode, url, setUrl, style, randomize, resetDefault }
}


