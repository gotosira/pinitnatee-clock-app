import { useMemo, useState, useCallback } from 'react'
import { useInterface } from '../state/ui'
import { getCurrentPinichMini, getCurrentYam, getThaiDayNumber, yamThirdIndex } from '../utils/yam'
import { useTime } from '../state/time'

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

const BASE_TITLES: Record<number, string[]> = {
  0: ['อัตตะ', 'หินะ', 'ธนัง', 'ปิตา', 'มาตา', 'โภคา', 'มัชฌิมา'],
  1: ['ตะนุ', 'กดุมภะ', 'สหัชชะ', 'พันธุ', 'ปุตตะ', 'อริ', 'ปัตนิ'],
  2: ['มรณะ', 'ศุภะ', 'กัมมะ', 'ลาภะ', 'พยายะ', 'ทาสา', 'ทาสี'],
  7: ['อาตมะ', 'ทาสา', 'โชค', 'สมบัติ', 'โจร', 'อุบาทว์', 'อุปถัมภ์'],
  8: ['อัตตะ', 'สักกะ', 'ญาติ', 'ธนัง', 'เคหัง', 'นาวัง', 'ภริยัง'],
}

export default function SevenTable() {
  const { now } = useTime()
  const rows = useMemo(() => buildRows(now), [now.getTime()])
  const [picked, setPicked] = useState<number | null>(() => {
    try { const v = localStorage.getItem('sevenPicked'); return v ? Number(v) : null } catch { return null }
  })
  const currentYamNumber = useMemo(() => getCurrentYam(now), [now.getTime()])
  const currentPinichNumber = useMemo(() => getCurrentPinichMini(now), [now.getTime()])
  const autoValue = currentYamNumber
  const highlightValue = picked ?? autoValue
  const highlightRows = useMemo(() => new Set([0, 1, 2, 4, 7, 8]), [])
  const [ui] = useInterface()
  const onClickCell = useCallback((n: number) => {
    setPicked(n)
    try { localStorage.setItem('sevenPicked', String(n)); window.dispatchEvent(new Event('localStorageChange')) } catch { }
  }, [])

  // Star moves through rows 0/1/2 as we cross each 30-min third of the current yam.
  const starRowIndex = useMemo(() => yamThirdIndex(now), [now])
  const currentYam = rows[1]?.[0]
  return (
    <div
      className={`seven-wrapper ${ui === 'watchface' ? 'theme-watchface' : 'theme-simple'}`}
      role="grid"
      aria-label="ตารางพินิจนาที (Pinit-natee table)"
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <button
          className="ghost small"
          onClick={() => { setPicked(null); try { localStorage.removeItem('sevenPicked') } catch { /* storage disabled */ } }}
          aria-label="Reset cell selection"
        >
          Reset
        </button>
      </div>
      <table className="seven-table">
        <tbody>
          {rows.map((r, i) => {
            // Hide rows 6 and 7 (zero-based index 5 and 6)
            if (i === 5 || i === 6) return null
            const trClass = i < 3 ? 'g1' : (i === 3 ? 'g2' : (i === 4 ? 'g3' : ((i === 7 || i === 8) ? 'g4' : '')))
            return (
              <tr key={i} className={trClass}>
                {r.map((n, j) => {
                  const isPrimary = highlightRows.has(i) && n === highlightValue
                  const isSecondary = !picked && highlightRows.has(i) && n === currentPinichNumber && n !== highlightValue
                  const isCurrentYamCell = i === starRowIndex && n === currentYam
                  const cellClass = isPrimary ? 'hl' : (isSecondary ? 'hl-sec' : undefined)
                  const title = BASE_TITLES[i]?.[j]
                  const ariaLabel = title ? `${title} ${n}${isCurrentYamCell ? ' — current yam' : ''}` : `${n}${isCurrentYamCell ? ' — current yam' : ''}`
                  return (
                    <td
                      key={j}
                      className={cellClass}
                      onClick={() => onClickCell(n)}
                      role="gridcell"
                      tabIndex={0}
                      aria-label={ariaLabel}
                      aria-selected={isPrimary}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onClickCell(n)
                        }
                      }}
                    >
                      <div className="cell-content">
                        {title && <div className="cell-title">{title}</div>}
                        <div className="cell-number">
                          {n}
                          {isCurrentYamCell && <span className="star" aria-hidden="true"> ⭐</span>}
                        </div>
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}


