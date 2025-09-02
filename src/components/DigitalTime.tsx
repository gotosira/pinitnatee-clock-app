import { useEffect, useState } from 'react'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export default function DigitalTime() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hours12 = ((now.getHours() + 11) % 12) + 1
  const minutes = now.getMinutes()
  const ampm = now.getHours() < 12 ? 'AM' : 'PM'

  return (
    <div className="digital-time" aria-label="digital time">
      <span className="hhmm">{pad2(hours12)}:{pad2(minutes)}</span>
      <span className="ampm">{ampm}</span>
    </div>
  )
}


