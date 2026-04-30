export type Period = 'day' | 'night'

export const DAY_BASE7 = [1, 6, 4, 2, 7, 5, 3]
export const NIGHT_BASE7 = [1, 5, 2, 6, 3, 7, 4]

/** Each "yam" segment is 90 minutes; each 30-min half-block subdivides into 8 mini-segments of 3.75 min each. */
export const YAM_SEGMENT_MS = 90 * 60 * 1000
export const YAM_SEGMENT_MIN = 90
export const HALF_HOUR_MIN = 30
export const PINICH_BOUNDS_MIN = [0, 3.75, 7.5, 11.25, 15, 18.75, 22.5, 26.25, 30] as const

export function rotateToStart(arr: number[], startValue: number): number[] {
  const idx = arr.indexOf(startValue)
  if (idx === -1) return arr.slice()
  return arr.slice(idx).concat(arr.slice(0, idx))
}

/** Sun=1 .. Sat=7 (Thai-style week numbering). */
export function getThaiDayNumber(date: Date): number {
  return ((date.getDay() + 7) % 7) + 1
}

/** True between 06:00 (inclusive) and 18:00 (exclusive). */
export function isDaytime(date: Date): boolean {
  const total = date.getHours() * 60 + date.getMinutes()
  return total >= 6 * 60 && total < 18 * 60
}

export function periodOf(date: Date): Period {
  return isDaytime(date) ? 'day' : 'night'
}

/**
 * Day number to use for yam computation, accounting for the fact that the
 * "night yam" cycle for hours 00:00–05:59 belongs to the *previous* calendar day.
 */
export function effectiveDayNumber(date: Date): number {
  if (isDaytime(date)) return getThaiDayNumber(date)
  if (date.getHours() < 6) {
    const prev = new Date(date)
    prev.setDate(date.getDate() - 1)
    return getThaiDayNumber(prev)
  }
  return getThaiDayNumber(date)
}

export function segmentIndexForDay(date: Date): number {
  const minutes = (date.getHours() - 6) * 60 + date.getMinutes()
  return clampSegment(Math.floor(minutes / YAM_SEGMENT_MIN))
}

export function segmentIndexForNight(date: Date): number {
  const h = date.getHours()
  const m = date.getMinutes()
  const diff = h >= 18 ? (h - 18) * 60 + m : (h + 6) * 60 + m
  return clampSegment(Math.floor(diff / YAM_SEGMENT_MIN))
}

export function segmentIndexFor(date: Date): number {
  return periodOf(date) === 'day' ? segmentIndexForDay(date) : segmentIndexForNight(date)
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

export function sequenceFor(period: Period, dayNumber: number): number[] {
  return period === 'day' ? daySequenceFor(dayNumber) : nightSequenceFor(dayNumber)
}

/** Real-valued minutes elapsed within the current 90-minute yam segment, including sub-second precision. */
export function minutesSinceYamStart(date: Date): number {
  const totalMinutes = date.getMinutes() + date.getSeconds() / 60
  const h = date.getHours()
  if (isDaytime(date)) {
    return ((h - 6) * 60 + totalMinutes) % YAM_SEGMENT_MIN
  }
  return ((h >= 18 ? (h - 18) * 60 : (h + 6) * 60) + totalMinutes) % YAM_SEGMENT_MIN
}

export function secondsSinceYamStart(date: Date): number {
  return minutesSinceYamStart(date) * 60
}

export function getCurrentYam(date: Date): number {
  const seq = sequenceFor(periodOf(date), effectiveDayNumber(date))
  return seq[segmentIndexFor(date)]
}

/**
 * The 3.75-min mini-segment ("pinich-natee") within the current 30-min half-block of the current yam.
 * Returns 1..7 from the rotated sequence starting at the current yam.
 */
export function getCurrentPinichMini(date: Date): number {
  const period = periodOf(date)
  const dayNo = effectiveDayNumber(date)
  const seq = sequenceFor(period, dayNo)
  const segIdx = segmentIndexFor(date)
  const currentYamNumber = seq[segIdx]
  const full7 = seq.slice(0, 7)
  const startIdx = full7.indexOf(currentYamNumber)
  const rotated = full7.slice(startIdx).concat(full7.slice(0, startIdx))
  const rotated8 = rotated.concat(rotated[0])

  const minutesInHalfHour = minutesSinceYamStart(date) % HALF_HOUR_MIN
  return rotated8[pinichBucketIndex(minutesInHalfHour)]
}

/**
 * Bucket index 0..7 for a real-valued offset (0..30 min) within a half-hour block.
 * Boundaries follow PINICH_BOUNDS_MIN; ties go to the lower bucket except at the lower edge of bucket 0.
 */
export function pinichBucketIndex(minutesInHalfHour: number): number {
  for (let i = 0; i < 8; i++) {
    const start = PINICH_BOUNDS_MIN[i]
    const end = PINICH_BOUNDS_MIN[i + 1]
    const startOk = i === 0 ? minutesInHalfHour >= start : minutesInHalfHour > start
    if (startOk && minutesInHalfHour <= end) return i
  }
  return 0
}

/**
 * Boundary index inside a yam: 0 if before 30 min mark, 1 if before 60 min, 2 if before 90 min.
 * Useful for "which third of the yam are we in".
 */
export function yamThirdIndex(date: Date): 0 | 1 | 2 {
  const m = minutesSinceYamStart(date)
  return (m <= 30 ? 0 : m <= 60 ? 1 : 2) as 0 | 1 | 2
}
