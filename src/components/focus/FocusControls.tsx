import { useEffect, useRef, useState } from 'react'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function FocusControls() {
  const [remaining, setRemaining] = useState<number>(0)
  const [running, setRunning] = useState<boolean>(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1))
    }, 1000)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [running])

  useEffect(() => {
    if (remaining === 0 && running) setRunning(false)
  }, [remaining, running])

  return (
    <div className="focus">
      <button
        className="ghost"
        onClick={() => {
          if (!running) {
            setRemaining(25 * 60)
            setRunning(true)
          } else {
            setRunning(false)
          }
        }}
      >
        {running ? 'Stop' : 'Focus'}
      </button>
      {remaining > 0 && <span className="focus-remaining">{formatTime(remaining)}</span>}
    </div>
  )
}

export default FocusControls


