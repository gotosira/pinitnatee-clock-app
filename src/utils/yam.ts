export type Period = 'day' | 'night'

export const DAY_BASE7 = [1, 6, 4, 2, 7, 5, 3]
export const NIGHT_BASE7 = [1, 5, 2, 6, 3, 7, 4]

export function rotateToStart(arr: number[], startValue: number): number[] {
  const idx = arr.indexOf(startValue)
  if (idx === -1) return arr.slice()
  return arr.slice(idx).concat(arr.slice(0, idx))
}

export function getThaiDayNumber(date: Date): number {
  return ((date.getDay() + 7) % 7) + 1 // Sun=1 .. Sat=7
}

export function isDaytime(date: Date): boolean {
  const h = date.getHours()
  const m = date.getMinutes()
  const total = h * 60 + m
  const start = 6 * 60
  const end = 18 * 60
  return total >= start && total < end
}

export function segmentIndexForDay(date: Date): number {
  const minutes = (date.getHours() - 6) * 60 + date.getMinutes()
  return clampSegment(Math.floor(minutes / 90))
}

export function segmentIndexForNight(date: Date): number {
  const h = date.getHours()
  const m = date.getMinutes()
  let diff: number
  if (h >= 18) diff = (h - 18) * 60 + m
  else diff = (h + 6) * 60 + m
  return clampSegment(Math.floor(diff / 90))
}

export function clampSegment(i: number): number {
  if (i < 0) return 0
  if (i > 7) return 7
  return i
}

export function daySequenceFor(dayNumber: number): number[] {
  const rotated7 = rotateToStart(DAY_BASE7, dayNumber)
  return rotated7.concat(rotated7[0])
}

export function nightSequenceFor(dayNumber: number): number[] {
  const rotated7 = rotateToStart(NIGHT_BASE7, dayNumber)
  return rotated7.concat(rotated7[0])
}

export function getCurrentYam(date: Date): number {
  const periodDay = isDaytime(date)
  if (periodDay) {
    const dayNo = getThaiDayNumber(date)
    const seq = daySequenceFor(dayNo)
    return seq[segmentIndexForDay(date)]
  }
  const useDate = new Date(date)
  if (date.getHours() < 6) useDate.setDate(date.getDate() - 1)
  const dayNo = getThaiDayNumber(useDate)
  const seq = nightSequenceFor(dayNo)
  return seq[segmentIndexForNight(date)]
}

export function getCurrentPinichMini(date: Date): number {
  const periodDay = isDaytime(date)
  const dayNo = (() => {
    if (periodDay) return getThaiDayNumber(date)
    const d = new Date(date)
    if (date.getHours() < 6) d.setDate(date.getDate() - 1)
    return getThaiDayNumber(d)
  })()
  const seq = periodDay ? daySequenceFor(dayNo) : nightSequenceFor(dayNo)
  const segIdx = periodDay ? segmentIndexForDay(date) : segmentIndexForNight(date)
  const currentYamNumber = seq[segIdx]
  const full7 = seq.slice(0, 7)
  const startIdx = full7.indexOf(currentYamNumber)
  const rotated = full7.slice(startIdx).concat(full7.slice(0, startIdx))
  const rotated8 = rotated.concat(rotated[0])

  const totalMinutes = date.getMinutes() + date.getSeconds() / 60
  const minutesSinceSegmentStart = (periodDay
    ? ((date.getHours() - 6) * 60 + totalMinutes) % 90
    : ((date.getHours() >= 18 ? (date.getHours() - 18) * 60 : (date.getHours() + 6) * 60) + totalMinutes) % 90)
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


