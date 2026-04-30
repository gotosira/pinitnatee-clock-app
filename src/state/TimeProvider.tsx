import { useEffect, useRef, useState } from 'react'
import { TimeContext } from './time'

export function TimeProvider({ children }: { children: React.ReactNode }) {
  const [now, setNow] = useState<Date>(() => new Date())
  const tickRef = useRef<number | null>(null)

  useEffect(() => {
    // Align to wall-clock seconds: schedule the first tick on the next second
    // boundary so the displayed seconds change when the OS second changes,
    // not on a drifted setInterval phase.
    let cancelled = false
    const scheduleNext = () => {
      if (cancelled) return
      const delay = 1000 - (Date.now() % 1000)
      tickRef.current = window.setTimeout(() => {
        setNow(new Date())
        scheduleNext()
      }, delay)
    }
    scheduleNext()
    return () => {
      cancelled = true
      if (tickRef.current !== null) window.clearTimeout(tickRef.current)
    }
  }, [])

  return <TimeContext.Provider value={{ now }}>{children}</TimeContext.Provider>
}

export default TimeProvider
