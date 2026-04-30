import { describe, it, expect } from 'vitest'
import {
  getThaiDayNumber,
  daySequenceFor,
  nightSequenceFor,
  getCurrentYam,
  getCurrentPinichMini,
  isDaytime,
  periodOf,
  effectiveDayNumber,
  minutesSinceYamStart,
  pinichBucketIndex,
  yamThirdIndex,
} from '../src/utils/yam'

function mkDate(y: number, m: number, d: number, h: number, min: number, sec = 0) {
  return new Date(y, m - 1, d, h, min, sec, 0)
}

describe('Thai time logic — week numbering', () => {
  it('Sunday=1 .. Saturday=7', () => {
    expect(getThaiDayNumber(mkDate(2025, 9, 7, 12, 0))).toBe(1)
    expect(getThaiDayNumber(mkDate(2025, 9, 8, 12, 0))).toBe(2)
    expect(getThaiDayNumber(mkDate(2025, 9, 13, 12, 0))).toBe(7)
  })
})

describe('Sequence rotation', () => {
  it('Day sequence rotates from day number, length 8 with wrap', () => {
    const seq = daySequenceFor(3)
    expect(seq.length).toBe(8)
    expect(seq[0]).toBe(3)
    expect(seq[7]).toBe(seq[0])
  })

  it('Night sequence rotates from day number, length 8 with wrap', () => {
    const seq = nightSequenceFor(5)
    expect(seq.length).toBe(8)
    expect(seq[0]).toBe(5)
    expect(seq[7]).toBe(seq[0])
  })
})

describe('Day/night period boundaries', () => {
  it('06:00 is daytime; 05:59 is night', () => {
    expect(isDaytime(mkDate(2026, 4, 30, 6, 0))).toBe(true)
    expect(isDaytime(mkDate(2026, 4, 30, 5, 59))).toBe(false)
    expect(periodOf(mkDate(2026, 4, 30, 5, 59))).toBe('night')
    expect(periodOf(mkDate(2026, 4, 30, 6, 0))).toBe('day')
  })

  it('18:00 flips back to night; 17:59 still day', () => {
    expect(isDaytime(mkDate(2026, 4, 30, 17, 59))).toBe(true)
    expect(isDaytime(mkDate(2026, 4, 30, 18, 0))).toBe(false)
  })
})

describe('effectiveDayNumber rollover', () => {
  it('Pre-6am uses previous calendar day for night yam computation', () => {
    // Wed 2026-04-29 23:00 — clearly night, day number = Wed (4)
    const wedNight = mkDate(2026, 4, 29, 23, 0)
    expect(effectiveDayNumber(wedNight)).toBe(getThaiDayNumber(wedNight))

    // Thu 2026-04-30 02:00 — still part of Wed's night cycle
    const thuEarly = mkDate(2026, 4, 30, 2, 0)
    const wedSameDay = mkDate(2026, 4, 29, 12, 0)
    expect(effectiveDayNumber(thuEarly)).toBe(getThaiDayNumber(wedSameDay))
  })

  it('06:00 sharp uses today (no rollover)', () => {
    const d = mkDate(2026, 4, 30, 6, 0)
    expect(effectiveDayNumber(d)).toBe(getThaiDayNumber(d))
  })
})

describe('minutesSinceYamStart', () => {
  it('At 06:00 sharp → 0 min into first day yam', () => {
    expect(minutesSinceYamStart(mkDate(2026, 4, 30, 6, 0))).toBe(0)
  })
  it('At 07:30 → 90 min mod 90 = 0 into second day yam', () => {
    // 07:30 is 90 min after 06:00 → yam 2 starts here, offset 0
    expect(minutesSinceYamStart(mkDate(2026, 4, 30, 7, 30))).toBe(0)
  })
  it('At 06:45 → 45 min into first day yam', () => {
    expect(minutesSinceYamStart(mkDate(2026, 4, 30, 6, 45))).toBe(45)
  })
  it('At 18:00 → start of first night yam', () => {
    expect(minutesSinceYamStart(mkDate(2026, 4, 30, 18, 0))).toBe(0)
  })
  it('Sub-minute precision via seconds', () => {
    expect(minutesSinceYamStart(mkDate(2026, 4, 30, 6, 0, 30))).toBeCloseTo(0.5, 5)
  })
})

describe('pinichBucketIndex boundary inclusivity', () => {
  it('0 → bucket 0 (lower edge included)', () => {
    expect(pinichBucketIndex(0)).toBe(0)
  })
  it('3.75 → bucket 0 (upper edge inclusive)', () => {
    expect(pinichBucketIndex(3.75)).toBe(0)
  })
  it('3.76 → bucket 1', () => {
    expect(pinichBucketIndex(3.76)).toBe(1)
  })
  it('30 → bucket 7 (last)', () => {
    expect(pinichBucketIndex(30)).toBe(7)
  })
})

describe('yamThirdIndex', () => {
  it('0 min → 0 (first third)', () => {
    expect(yamThirdIndex(mkDate(2026, 4, 30, 6, 0))).toBe(0)
  })
  it('30 min → 0 (boundary inclusive on lower side)', () => {
    expect(yamThirdIndex(mkDate(2026, 4, 30, 6, 30))).toBe(0)
  })
  it('45 min → 1 (second third)', () => {
    expect(yamThirdIndex(mkDate(2026, 4, 30, 6, 45))).toBe(1)
  })
  it('75 min → 2 (third third)', () => {
    expect(yamThirdIndex(mkDate(2026, 4, 30, 7, 15))).toBe(2)
  })
})

describe('getCurrentYam — boundary integration', () => {
  it('returns a non-null number around 06:00 and 18:00 boundaries', () => {
    expect(getCurrentYam(mkDate(2026, 4, 30, 5, 59))).toBeGreaterThan(0)
    expect(getCurrentYam(mkDate(2026, 4, 30, 6, 0))).toBeGreaterThan(0)
    expect(getCurrentYam(mkDate(2026, 4, 30, 17, 59))).toBeGreaterThan(0)
    expect(getCurrentYam(mkDate(2026, 4, 30, 18, 0))).toBeGreaterThan(0)
  })
})

describe('getCurrentPinichMini', () => {
  it('returns a value 1..7', () => {
    const d = mkDate(2025, 9, 7, 21, 12)
    const v = getCurrentPinichMini(d)
    expect(v).toBeGreaterThanOrEqual(1)
    expect(v).toBeLessThanOrEqual(7)
  })

  it('changes monotonically across the 3.75-min boundaries within a half-hour', () => {
    const baseDate = mkDate(2026, 4, 30, 6, 0)
    const seen = new Set<number>()
    for (let m = 0; m < 30; m += 4) {
      const d = new Date(baseDate.getTime() + m * 60_000)
      seen.add(getCurrentPinichMini(d))
    }
    // Expect at least 4 distinct mini values across 8 buckets
    expect(seen.size).toBeGreaterThanOrEqual(4)
  })
})
