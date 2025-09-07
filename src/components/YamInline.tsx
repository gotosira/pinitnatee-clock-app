import { useEffect, useMemo, useState } from 'react'
import type { Period } from '../utils/yam'
import {
  getThaiDayNumber,
  isDaytime,
  segmentIndexForDay,
  segmentIndexForNight,
  daySequenceFor,
  nightSequenceFor
} from '../utils/yam'

function computeYam(now: Date) {
  const period: Period = isDaytime(now) ? 'day' : 'night'
  if (period === 'day') {
    const dayNo = getThaiDayNumber(now)
    const seq = daySequenceFor(dayNo)
    const segIdx = segmentIndexForDay(now)
    const yam = seq[segIdx]
    return { period, yam }
  }
  const useDate = new Date(now)
  if (now.getHours() < 6) useDate.setDate(now.getDate() - 1)
  const dayNo = getThaiDayNumber(useDate)
  const seq = nightSequenceFor(dayNo)
  const segIdx = segmentIndexForNight(now)
  const yam = seq[segIdx]
  return { period, yam }
}

function computeMini(now: Date) {
  const period: Period = isDaytime(now) ? 'day' : 'night'
  const dayNo = (() => {
    if (period === 'day') return getThaiDayNumber(now)
    const d = new Date(now)
    if (now.getHours() < 6) d.setDate(now.getDate() - 1)
    return getThaiDayNumber(d)
  })()
  const seq = period === 'day' ? daySequenceFor(dayNo) : nightSequenceFor(dayNo)
  const segIdx = period === 'day' ? segmentIndexForDay(now) : segmentIndexForNight(now)
  const currentYamNumber = seq[segIdx]
  const full7 = seq.slice(0, 7)
  const startIdx = full7.indexOf(currentYamNumber)
  const rotated8 = full7.slice(startIdx).concat(full7.slice(0, startIdx), full7[startIdx])

  // minutes within 90-min segment → which 3.75-min bucket (0..7)
  const totalMinutes = now.getMinutes() + now.getSeconds() / 60
  const minutesSinceSegmentStart = ((period === 'day')
    ? ((now.getHours() - 6) * 60 + totalMinutes) % 90
    : ((now.getHours() >= 18 ? (now.getHours() - 18) * 60 : (now.getHours() + 6) * 60) + totalMinutes) % 90)
  const minutesInHalfHour = minutesSinceSegmentStart % 30
  const bounds = [0, 3.75, 7.5, 11.25, 15, 18.75, 22.5, 26.25, 30]
  let idx = 0
  for (let i = 0; i < 8; i++) {
    const start = bounds[i]
    const end = bounds[i + 1]
    const inclusiveStart = i === 0 ? minutesInHalfHour >= start : minutesInHalfHour > start
    const inclusiveEnd = minutesInHalfHour <= end
    if (inclusiveStart && inclusiveEnd) { idx = i; break }
  }
  return rotated8[idx]
}

export default function YamInline() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const { period, yam } = useMemo(() => computeYam(now), [now])
  const mini = useMemo(() => computeMini(now), [now])
  const periodLabel = period === 'day' ? 'ยามกลางวัน' : 'ยามกลางคืน'

  // countdown to next phase boundary (30, 60, 90 minutes within current yam)
  const secondsSinceYamStart = useMemo(() => {
    const period: Period = isDaytime(now) ? 'day' : 'night'
    const h = now.getHours(); const m = now.getMinutes(); const s = now.getSeconds()
    const since = period === 'day'
      ? ((h - 6) * 3600 + m * 60 + s) % 5400
      : ((h >= 18 ? (h - 18) * 3600 : (h + 6) * 3600) + m * 60 + s) % 5400
    return since
  }, [now])
  const boundarySeconds = secondsSinceYamStart < 1800 ? 1800 : secondsSinceYamStart < 3600 ? 3600 : 5400
  const remain = Math.max(0, boundarySeconds - secondsSinceYamStart)
  const mm = String(Math.floor(remain / 60)).padStart(2, '0')
  const ss = String(Math.floor(remain % 60)).padStart(2, '0')

  // optional mobile vibration on boundary
  useEffect(() => {
    if (remain === 0 && 'vibrate' in navigator) {
      try { (navigator as any).vibrate?.(50) } catch {}
    }
  }, [remain])

  return (
    <div className="yam-inline-text">
      {periodLabel}: {yam} / ยามพินิจนาที: {mini} · ⏳ {mm}:{ss}
    </div>
  )
}


