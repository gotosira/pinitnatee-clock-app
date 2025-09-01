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


