import { useEffect, useState } from 'react'

interface BatteryManager extends EventTarget {
  level: number // 0..1
  charging: boolean
  addEventListener(type: 'levelchange' | 'chargingchange', listener: () => void): void
  removeEventListener(type: 'levelchange' | 'chargingchange', listener: () => void): void
}

interface BatteryNavigator extends Navigator {
  getBattery?: () => Promise<BatteryManager>
  battery?: BatteryManager
  mozBattery?: BatteryManager
  webkitBattery?: BatteryManager
}

function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, n))
}

export function useBatteryPercentage(): number | null {
  const [level, setLevel] = useState<number | null>(null)
  const [manual, setManual] = useState<number | null>(null)

  useEffect(() => {
    const nav = navigator as BatteryNavigator
    let battery: BatteryManager | null = null
    let unsubscribe: (() => void) | null = null

    async function init() {
      try {
        const candidate = nav.getBattery
          ? await nav.getBattery()
          : nav.battery || nav.mozBattery || nav.webkitBattery
        if (!candidate) return
        battery = candidate
        const calc = () => {
          if (typeof battery!.level === 'number') {
            setLevel(Math.round(battery!.level * 100))
          }
        }
        calc()
        battery.addEventListener('levelchange', calc)
        unsubscribe = () => battery!.removeEventListener('levelchange', calc)
      } catch (err) {
        // Battery API not available (iOS Safari, locked-down browsers)
        console.info('[battery] API unavailable', err)
      }
    }

    init()
    return () => unsubscribe?.()
  }, [])

  useEffect(() => {
    const read = () => {
      try {
        const s = localStorage.getItem('batteryOverride')
        if (s === null || s === '') {
          setManual(null)
          return
        }
        const n = Number(s)
        setManual(Number.isFinite(n) ? clampPercent(n) : null)
      } catch {
        // Storage disabled (private mode)
        setManual(null)
      }
    }
    read()
    const onAny = () => read()
    window.addEventListener('storage', onAny)
    window.addEventListener('battery:override', onAny)
    return () => {
      window.removeEventListener('storage', onAny)
      window.removeEventListener('battery:override', onAny)
    }
  }, [])

  return manual ?? level
}
