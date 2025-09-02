import { useEffect, useMemo, useState } from 'react'
import { useBatteryPercentage } from '../../hooks/useBattery'
import { useCurrentLocation } from '../../hooks/useLocation'
import { useTemperature } from '../../hooks/useTemperature'
import { useBackground } from '../../hooks/useBackground'
import { weatherEmoji } from '../../utils/weather'

export default function AnalogClock() {
  const [now, setNow] = useState<Date>(new Date())
  const battery = useBatteryPercentage()
  const geo = useCurrentLocation()
  const temp = useTemperature()
  const { url } = useBackground()

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const sec = now.getSeconds()
  const min = now.getMinutes() + sec / 60
  const hour = (now.getHours() % 12) + min / 60

  const dateText = useMemo(() => {
    const dayNames = ['SUN','MON','TUE','WED','THU','FRI','SAT']
    const m = now.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    const d = now.getDate()
    const day = dayNames[now.getDay()]
    const y = now.getFullYear()
    return { day, d, m, y }
  }, [now])

  const rSec = sec * 6
  const rMin = min * 6
  const rHour = hour * 30

  return (
    <div className="analog-clock" aria-hidden="true">
      <div className="dial">
        {url && <div className="dial-bg" style={{ backgroundImage: `url(${url})` }} />}
      </div>
      {/* minute ticks */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className={`tick ${i % 5 === 0 ? 'major' : 'minor'}`}
          style={{ transform: `translate(-50%, -100%) rotate(${i * 6}deg)` }}
        />
      ))}
      {/* hands */}
      <div className="hand hour" style={{ transform: `translate(-50%, -100%) rotate(${rHour}deg)` }} />
      <div className="hand minute" style={{ transform: `translate(-50%, -100%) rotate(${rMin}deg)` }} />
      <div className="hand second" style={{ transform: `translate(-50%, -100%) rotate(${rSec}deg)` }} />
      <div className="center-dot" />

      {/* dial text */}
      <div className="dial-info top">
        <div className="weekday">{dateText.day}</div>
        <div className="date">{dateText.d}</div>
        <div className="month">{dateText.m}</div>
      </div>
      <div className="dial-info bottom">
        <div className="ampm">{now.getHours() < 12 ? 'AM' : 'PM'}</div>
        <div className="digital">
          {`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`}
        </div>
      </div>
      <div className="dial-info left">
        <div className="label">🔋</div>
        <div className="value">{typeof battery === 'number' ? `${battery}%` : '—'}</div>
      </div>
      <div className="dial-info right">
        <div className="label">📍</div>
        <div className="value">
          {geo?.name ? geo.name : geo ? `${geo.lat.toFixed(2)}, ${geo.lon.toFixed(2)}` : '—'}
        </div>
        {typeof geo?.elevationM === 'number' && (
          <div className="value small">⬆️ {Math.round(geo!.elevationM!)} m</div>
        )}
        <div className="value small">{weatherEmoji(temp.code)} {temp.value === null ? '—' : `${Math.round(temp.value)}°${temp.unit}`}</div>
      </div>
    </div>
  )
}


