import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      // notify same-window listeners
      const ev = new CustomEvent('local-storage', { detail: { key, value } })
      window.dispatchEvent(ev)
    } catch {
      // ignore
    }
  }, [key, value])

  // listen for cross-component updates in the same window and cross-tabs
  useEffect(() => {
    const onCustom = (e: Event) => {
      const ev = e as CustomEvent<{ key: string; value: T }>
      if (ev.detail && ev.detail.key === key) {
        setValue(ev.detail.value)
      }
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try { setValue(JSON.parse(e.newValue) as T) } catch {}
      }
    }
    window.addEventListener('local-storage', onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('local-storage', onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [key])

  return [value, setValue] as const
}


