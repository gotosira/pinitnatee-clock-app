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

export function YamClock() {
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000)
    return () => clearInterval(id)
  }, [])

  const info = useMemo(() => {
    const period: Period = isDaytime(now) ? 'day' : 'night'

    if (period === 'day') {
      const dayNo = getThaiDayNumber(now)
      const seq = daySequenceFor(dayNo)
      const segIdx = segmentIndexForDay(now)
      const yam = seq[segIdx]
      return { period, yam, segIdx, seq }
    } else {
      // For early morning (before 6:00), use previous day's night sequence
      const useDate = new Date(now)
      if (now.getHours() < 6) useDate.setDate(now.getDate() - 1)
      const dayNo = getThaiDayNumber(useDate)
      const seq = nightSequenceFor(dayNo)
      const segIdx = segmentIndexForNight(now)
      const yam = seq[segIdx]
      return { period, yam, segIdx, seq }
    }
  }, [now])

  const label = info.period === 'day' ? 'ยามกลางวัน' : 'ยามกลางคืน'

  return (
    <div className="yam-clock" aria-live="polite">
      <div className="yam-label">{label}: {info.yam}</div>
    </div>
  )
}

export default YamClock


