import { useEffect, useMemo } from 'react'
import {
  getCurrentYam,
  getCurrentPinichMini,
  isDaytime,
  secondsSinceYamStart,
  YAM_SEGMENT_MS,
} from '../utils/yam'
import { useTime } from '../state/time'

const THIRD_SECONDS = 30 * 60
const HALF_SECONDS = 60 * 60
const FULL_SECONDS = YAM_SEGMENT_MS / 1000

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export default function YamInline() {
  const { now } = useTime()
  const period = useMemo(() => (isDaytime(now) ? 'day' : 'night'), [now.getHours(), now.getMinutes()])
  const yam = useMemo(() => getCurrentYam(now), [now.getHours(), now.getMinutes()])
  const mini = useMemo(() => getCurrentPinichMini(now), [now])

  const elapsedSec = secondsSinceYamStart(now)
  const boundarySec = elapsedSec < THIRD_SECONDS ? THIRD_SECONDS : elapsedSec < HALF_SECONDS ? HALF_SECONDS : FULL_SECONDS
  const remain = Math.max(0, boundarySec - elapsedSec)
  const mm = pad2(Math.floor(remain / 60))
  const ss = pad2(Math.floor(remain % 60))

  // Soft haptic at each yam-third boundary on supporting devices.
  useEffect(() => {
    if (Math.floor(remain) === 0 && 'vibrate' in navigator) {
      try { navigator.vibrate?.(50) } catch { /* user denied or unsupported */ }
    }
  }, [remain])

  const periodLabel = period === 'day' ? 'ยามกลางวัน' : 'ยามกลางคืน'

  return (
    <div className="yam-inline-text" aria-live="polite">
      {periodLabel}: {yam} / ยามพินิจนาที: {mini} · ⏳ {mm}:{ss}
    </div>
  )
}
