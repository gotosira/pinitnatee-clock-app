import { createContext, useContext, useEffect, useRef, useState } from 'react'

type TimeContextValue = {
  now: Date
}

const TimeContext = createContext<TimeContextValue | undefined>(undefined)

export function TimeProvider({ children }: { children: React.ReactNode }) {
  const [now, setNow] = useState<Date>(new Date())
  const tickRef = useRef<number | null>(null)

  useEffect(() => {
    tickRef.current = window.setInterval(() => setNow(new Date()), 1000)
    return () => { if (tickRef.current) window.clearInterval(tickRef.current) }
  }, [])

  return (
    <TimeContext.Provider value={{ now }}>
      {children}
    </TimeContext.Provider>
  )
}

export function useTime(): TimeContextValue {
  const ctx = useContext(TimeContext)
  if (!ctx) throw new Error('useTime must be used within TimeProvider')
  return ctx
}


