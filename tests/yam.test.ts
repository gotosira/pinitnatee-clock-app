import { describe, it, expect } from 'vitest'
import { getThaiDayNumber, daySequenceFor, nightSequenceFor, getCurrentYam, getCurrentPinichMini } from '../src/utils/yam'

function mkDate(y: number, m: number, d: number, h: number, min: number) {
  return new Date(y, m - 1, d, h, min, 0, 0)
}

describe('Thai time logic', () => {
it('Thai day number Sunday=1 .. Saturday=7', () => {
  expect(getThaiDayNumber(mkDate(2025, 9, 7, 12, 0))).toBe(1)
  expect(getThaiDayNumber(mkDate(2025, 9, 8, 12, 0))).toBe(2)
  expect(getThaiDayNumber(mkDate(2025, 9, 13, 12, 0))).toBe(7)
})

it('Day sequence rotates from day number', () => {
  const seq = daySequenceFor(3)
  expect(seq.length).toBe(8)
  expect(seq[0]).toBe(3)
  expect(seq[7]).toBe(seq[0])
})

it('Night sequence rotates from day number', () => {
  const seq = nightSequenceFor(5)
  expect(seq.length).toBe(8)
  expect(seq[0]).toBe(5)
  expect(seq[7]).toBe(seq[0])
})

it('Current Yam switches at 18:00 and 06:00 boundaries', () => {
  const d1 = mkDate(2025, 9, 7, 17, 59)
  const d2 = mkDate(2025, 9, 7, 18, 0)
  expect(getCurrentYam(d1)).not.toBeNull()
  expect(getCurrentYam(d2)).not.toBeNull()
})

it('Pinich-natee returns a value 1..7', () => {
  const d = mkDate(2025, 9, 7, 21, 12)
  const v = getCurrentPinichMini(d)
  expect(v).toBeGreaterThanOrEqual(1)
  expect(v).toBeLessThanOrEqual(7)
})
})


