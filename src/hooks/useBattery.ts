import { useEffect, useState } from 'react'

export function useBatteryPercentage(): number | null {
  const [level, setLevel] = useState<number | null>(null)

  useEffect(() => {
    let battery: any
    let unsubscribe: (() => void) | null = null
    async function init() {
      try {
        const nav: any = navigator
        if (nav.getBattery) {
          battery = await nav.getBattery()
          const update = () => setLevel(Math.round(battery.level * 100))
          update()
          battery.addEventListener('levelchange', update)
          unsubscribe = () => battery.removeEventListener('levelchange', update)
        }
      } catch {
        setLevel(null)
      }
    }
    init()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return level
}


