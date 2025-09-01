import { useEffect, useState } from 'react'

function formatTwoDigits(value: number) {
  return value.toString().padStart(2, '0')
}

export function Clock() {
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hours = formatTwoDigits(now.getHours())
  const minutes = formatTwoDigits(now.getMinutes())

  return (
    <div className="clock">
      {hours}:{minutes}
    </div>
  )
}

export default Clock


