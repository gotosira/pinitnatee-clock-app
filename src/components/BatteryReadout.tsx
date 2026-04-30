import { useEffect, useRef, useState } from 'react'
import { useBatteryPercentage } from '../hooks/useBattery'

function broadcastOverrideChange() {
  window.dispatchEvent(new Event('battery:override'))
}

function commitOverride(raw: string): boolean {
  const trimmed = raw.trim()
  try {
    if (trimmed === '') {
      localStorage.removeItem('batteryOverride')
      broadcastOverrideChange()
      return true
    }
    const n = Number(trimmed)
    if (!Number.isFinite(n) || n < 0 || n > 100) return false
    localStorage.setItem('batteryOverride', String(Math.round(n)))
    broadcastOverrideChange()
    return true
  } catch {
    return false
  }
}

export default function BatteryReadout() {
  const battery = useBatteryPercentage()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function startEdit() {
    setDraft(typeof battery === 'number' ? String(battery) : '')
    setError(false)
    setEditing(true)
  }

  function tryCommit() {
    if (commitOverride(draft)) {
      setEditing(false)
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <>
      <div className="label" aria-hidden="true">🔋</div>
      <div className="value">{typeof battery === 'number' ? `${battery}%` : '—'}</div>
      {editing ? (
        <div className="battery-edit" role="group" aria-label="Override battery percentage">
          <input
            ref={inputRef}
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            value={draft}
            placeholder="0–100"
            aria-invalid={error}
            aria-label="Battery percent (0 to 100, leave empty to clear)"
            onChange={(e) => {
              setDraft(e.target.value)
              if (error) setError(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                tryCommit()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                setEditing(false)
                setError(false)
              }
            }}
          />
          <button className="ghost small" onClick={tryCommit} aria-label="Save battery override">✓</button>
          <button className="ghost small" onClick={() => { setEditing(false); setError(false) }} aria-label="Cancel">✕</button>
        </div>
      ) : (
        <button
          className="value small battery-set-btn"
          onClick={startEdit}
          aria-label="Override battery reading"
          title="Override battery reading"
        >
          Set
        </button>
      )}
    </>
  )
}
