import { useMemo, useState, useCallback } from 'react'
import { useInterface } from '../state/ui'
import { isDaytime } from '../utils/yam'
import { getCurrentPinichMini, getCurrentYam, getThaiDayNumber } from '../utils/yam'

const CYCLE = [1, 6, 4, 2, 7, 5, 3]
const mod7 = (n: number) => ((n - 1) % 7) + 1
const nextInCycle = (v: number) => {
  const idx = CYCLE.indexOf(v)
  return CYCLE[(idx + 1) % 7]
}

function buildRows(now: Date) {
  const first = getCurrentPinichMini(now)
  const second = getCurrentYam(now)
  const third = getThaiDayNumber(now)
  const rows: number[][] = []
  const start = [first, second, third]
  for (let r = 0; r < 3; r++) {
    const row: number[] = []
    for (let c = 0; c < 7; c++) {
      row.push(((start[r] - 1 + c) % 7) + 1)
    }
    rows.push(row)
  }
  const sums = Array.from({ length: 7 }, (_, c) => rows[0][c] + rows[1][c] + rows[2][c])
  const mods = sums.map(mod7)
  rows.push(sums)
  rows.push(mods)
  // Row 6
  const row6: number[] = Array(7)
  const idx7 = rows[4].findIndex((n) => n === 7)
  const seqBackward = [7, 6, 5, 4, 3, 2, 1]
  for (let i = 0; i < 7; i++) row6[(idx7 + i) % 7] = seqBackward[i]
  rows.push(row6)
  // Row 7
  const row7: number[] = Array(7)
  const seqRow7 = [7, 5, 3, 1, 6, 4, 2]
  for (let i = 0; i < 7; i++) row7[(idx7 + i) % 7] = seqRow7[i]
  rows.push(row7)
  // Row 8
  const start8 = rows[4][0]
  const idx8 = CYCLE.indexOf(start8)
  const row8 = Array.from({ length: 7 }, (_, i) => CYCLE[(idx8 + i) % 7])
  rows.push(row8)
  // Row 9
  const row9: number[] = Array(7)
  const tail = mod7(row8[5] + row8[6])
  row9[6] = tail
  for (let col = 5; col >= 0; col--) row9[col] = nextInCycle(row9[col + 1])
  rows.push(row9)
  return rows
}

export default function SevenTable() {
  const now = new Date()
  const rows = useMemo(() => buildRows(now), [now.getTime()])
  const [picked, setPicked] = useState<number | null>(null)
  const autoValue = useMemo(() => mod7(rows[0][0] + rows[1][0]), [rows])
  const highlightValue = picked ?? autoValue
  const highlightRows = useMemo(() => new Set([0, 1, 2, 4, 7, 8]), [])
  const [ui] = useInterface()
  const onClickCell = useCallback((n: number) => setPicked(n), [])

  // Determine which of the first three rows (0/1/2) to star based on minute within current 90-min Yam
  const minutesSinceYamStart = useMemo(() => {
    const h = now.getHours()
    const m = now.getMinutes()
    const s = now.getSeconds()
    const minuteFrac = m + s / 60
    if (isDaytime(now)) {
      return ((h - 6) * 60 + minuteFrac) % 90
    }
    return ((h >= 18 ? (h - 18) * 60 : (h + 6) * 60) + minuteFrac) % 90
  }, [now])

  const starRowIndex = minutesSinceYamStart <= 30 ? 0 : minutesSinceYamStart <= 60 ? 1 : 2
  const currentYam = rows[1]?.[0]
  return (
    <div className={`seven-wrapper ${ui === 'watchface' ? 'theme-watchface' : 'theme-simple'}`} aria-hidden="true">
      <table className="seven-table">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((n, j) => (
                <td key={j} className={highlightRows.has(i) && n === highlightValue ? 'hl' : undefined} onClick={() => onClickCell(n)}>
                  <span>{n}{i === starRowIndex && n === currentYam ? ' ⭐' : ''}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


