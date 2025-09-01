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

// Each yam (segment) is 90 minutes. We subdivide into 8 mini-segments with these minute boundaries.
// Boundaries in minutes from the segment start: [0, 3.75, 7.5, 11.25, 15, 18.75, 22.5, 26.25, 30]
const MIN_BOUND = [0, 3.75, 7.5, 11.25, 15, 18.75, 22.5, 26.25, 30]

function getCurrentYamSequence(period: Period, date: Date): { seq: number[]; yamIndex: number; offsetMin: number } {
  const dayNo = (() => {
    if (period === 'day') return getThaiDayNumber(date)
    const useDate = new Date(date)
    if (date.getHours() < 6) useDate.setDate(date.getDate() - 1)
    return getThaiDayNumber(useDate)
  })()

  const seq = period === 'day' ? daySequenceFor(dayNo) : nightSequenceFor(dayNo)
  const segIdx = period === 'day' ? segmentIndexForDay(date) : segmentIndexForNight(date)

  // Minutes since start of this 30-minute block inside segment
  const totalMinutes = date.getMinutes() + date.getSeconds() / 60
  // Compute minutes since start of the segment
  const minutesSinceSegmentStart = ((period === 'day')
    ? ((date.getHours() - 6) * 60 + totalMinutes) % 90
    : ((date.getHours() >= 18 ? (date.getHours() - 18) * 60 : (date.getHours() + 6) * 60) + totalMinutes) % 90)

  const minutesInHalfHour = minutesSinceSegmentStart % 30

  return { seq, yamIndex: segIdx, offsetMin: minutesInHalfHour }
}

function miniIndexFromOffset(minutesInHalfHour: number): number {
  // Map offset (0..30) to index 0..7 using the provided ranges
  for (let i = 0; i < 8; i++) {
    const start = MIN_BOUND[i]
    const end = MIN_BOUND[i + 1]
    if (i === 0) {
      if (minutesInHalfHour >= start && minutesInHalfHour <= end) return 0
    } else if (i === 7) {
      if (minutesInHalfHour > start && minutesInHalfHour <= end) return 7
    } else {
      if (minutesInHalfHour > start && minutesInHalfHour <= end) return i
    }
  }
  return 0
}

export function YamMinute() {
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000)
    return () => clearInterval(id)
  }, [])

  const info = useMemo(() => {
    const period: Period = isDaytime(now) ? 'day' : 'night'
    const { seq, yamIndex, offsetMin } = getCurrentYamSequence(period, now)
    const currentYamNumber = seq[yamIndex]

    // Build mini sequence by rotating the full sequence to the current yam as start
    const full7 = seq.slice(0, 7)
    const startIdx = full7.indexOf(currentYamNumber)
    const rotated = full7.slice(startIdx).concat(full7.slice(0, startIdx))
    const rotated8 = rotated.concat(rotated[0])

    const miniIdx = miniIndexFromOffset(offsetMin)
    const currentMini = rotated8[miniIdx]

    return { period, currentMini, rotated8, miniIdx }
  }, [now])

  const label = 'ยามพินิจนาที'

  return (
    <div className="yam-minute" aria-live="polite">
      <div className="yam-label">{label}: {info.currentMini}</div>
    </div>
  )
}

export default YamMinute


