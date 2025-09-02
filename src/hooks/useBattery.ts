import { useEffect, useState } from 'react'

export function useBatteryPercentage(): number | null {
  const [level, setLevel] = useState<number | null>(null)

  useEffect(() => {
    let battery: any
    let unsubscribe: (() => void) | null = null
    async function init() {
      try {
        const nav: any = navigator as any
        const candidate = nav.getBattery
          ? await nav.getBattery()
          : nav.battery || nav.mozBattery || nav.webkitBattery
        if (candidate) {
          battery = candidate
          const calc = () => {
            const raw = typeof battery.level === 'number' ? battery.level : undefined
            if (typeof raw === 'number') setLevel(Math.round(raw * 100))
          }
          calc()
          if (battery.addEventListener) {
            battery.addEventListener('levelchange', calc)
            unsubscribe = () => battery.removeEventListener('levelchange', calc)
          } else if ('onlevelchange' in battery) {
            const prev = battery.onlevelchange
            battery.onlevelchange = () => {
              prev?.()
              calc()
            }
            unsubscribe = () => {
              battery.onlevelchange = prev
            }
          }
        } else {
          // iOS Safari does not expose Battery API; try Web App Manifest power info via navigator.getBattery polyfills (none available)
          setLevel(null)
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


