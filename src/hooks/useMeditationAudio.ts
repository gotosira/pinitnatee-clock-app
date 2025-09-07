import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { fetchMeditationTrack } from '../services/meditation'

export function useMeditationAudio() {
  const [enabled, setEnabled] = useLocalStorage<boolean>('meditationEnabled', false)
  const [src, setSrc] = useState<string>('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canAutoplayRef = useRef<boolean>(false)

  useEffect(() => {
    // single audio element instance
    if (!audioRef.current) {
      const a = new Audio()
      a.loop = true
      a.preload = 'auto'
      a.volume = 0.25
      audioRef.current = a
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const url = await fetchMeditationTrack()
      if (!mounted) return
      if (url) setSrc(url)
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const a = audioRef.current
    if (!a || !src) return
    if (a.src !== src) a.src = src
    if (enabled) {
      a.play().then(() => { canAutoplayRef.current = true }).catch(() => {
        // will try again on user gesture
        canAutoplayRef.current = false
      })
    } else {
      a.pause()
    }
  }, [enabled, src])

  useEffect(() => {
    const onFirstGesture = () => {
      if (enabled && audioRef.current && !canAutoplayRef.current) {
        audioRef.current.play().catch(() => {})
      }
      window.removeEventListener('pointerdown', onFirstGesture)
      window.removeEventListener('keydown', onFirstGesture)
    }
    window.addEventListener('pointerdown', onFirstGesture)
    window.addEventListener('keydown', onFirstGesture)
    return () => {
      window.removeEventListener('pointerdown', onFirstGesture)
      window.removeEventListener('keydown', onFirstGesture)
    }
  }, [enabled])

  return { enabled, setEnabled }
}


