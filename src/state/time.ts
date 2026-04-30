import { createContext, useContext } from 'react'

export type TimeContextValue = {
  now: Date
}

export const TimeContext = createContext<TimeContextValue | undefined>(undefined)

export function useTime(): TimeContextValue {
  const ctx = useContext(TimeContext)
  if (!ctx) throw new Error('useTime must be used within TimeProvider')
  return ctx
}
