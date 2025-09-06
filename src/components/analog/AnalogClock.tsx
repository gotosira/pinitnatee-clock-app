import { useEffect, useMemo, useState } from 'react'
import SevenTable from '../SevenTable'
import { useBatteryPercentage } from '../../hooks/useBattery'
import { useCurrentLocation } from '../../hooks/useLocation'
import { useTemperature } from '../../hooks/useTemperature'
import { useBackground } from '../../hooks/useBackground'
import { weatherEmoji } from '../../utils/weather'
// quote now rendered in TopBar
import DigitalTime from '../DigitalTime'
import YamInlineText from '../YamInline'

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
  const seg2p5 = Math.floor((now.getMinutes() * 60 + sec) / 150) % 24
  const startDeg = seg2p5 * 15
  const endDeg = startDeg + 15

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const a = (angleDeg - 90) * Math.PI / 180
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  const rArc = 47
  const p0 = polarToCartesian(50, 50, rArc, startDeg)
  const p1 = polarToCartesian(50, 50, rArc, endDeg)
  const d = `M ${p0.x} ${p0.y} A ${rArc} ${rArc} 0 0 1 ${p1.x} ${p1.y}`
  const rNum = 41
  // Yam (90-minute) arc by dividing the dial into 8 equal wedges (visual cue)
  const yamIndex = Math.floor((now.getHours() * 3600 + now.getMinutes() * 60 + sec) / (90 * 60)) % 8
  const yamStart = yamIndex * 45
  const yamEnd = yamStart + 45
  const ry = 44
  const y0 = polarToCartesian(50, 50, ry, yamStart)
  const y1 = polarToCartesian(50, 50, ry, yamEnd)
  const dy = `M ${y0.x} ${y0.y} A ${ry} ${ry} 0 0 1 ${y1.x} ${y1.y}`
  const p12 = polarToCartesian(50, 50, rNum, 0)
  const p3 = polarToCartesian(50, 50, rNum, 90)
  const p6 = polarToCartesian(50, 50, rNum, 180)
  const p9 = polarToCartesian(50, 50, rNum, 270)

  return (
    <div className="analog-clock" aria-hidden="true">
      <div className="dial">
        {url && <div className="dial-bg" style={{ backgroundImage: `url(${url})` }} />}
      </div>
      {/* 24 segments (2.5 minutes each → 15° per segment) */}
      <div className="segments-24">
        {Array.from({ length: 24 }).map((_, i) => (
          <i
            key={i}
            className={`${i % 6 === 0 ? 'major' : ''} ${i === seg2p5 ? 'active' : ''}`}
            style={{ transform: `translate(-50%, -100%) rotate(${i * 15}deg)` }}
          />
        ))}
      </div>
      {/* current 2.5-minute arc */}
      <svg className="segment-arc-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pinichGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7cffc1" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
          <linearGradient id="yamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a18cd1" />
            <stop offset="100%" stopColor="#fbc2eb" />
          </linearGradient>
        </defs>
        <path d={dy} stroke="url(#yamGrad)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d={d} stroke="url(#pinichGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
      {/* seven modal moved to TopBar */}
      {/* numerals 12, 3, 6, 9 */}
      <svg className="numerals-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <text x={p12.x} y={p12.y} textAnchor="middle" dominantBaseline="middle" className="numeral">12</text>
        <text x={p3.x} y={p3.y} textAnchor="middle" dominantBaseline="middle" className="numeral">3</text>
        <text x={p6.x} y={p6.y} textAnchor="middle" dominantBaseline="middle" className="numeral">6</text>
        <text x={p9.x} y={p9.y} textAnchor="middle" dominantBaseline="middle" className="numeral">9</text>
      </svg>
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
      <div className="dial-info bottom" />
      <div className="dial-info bottom2">
        <DigitalTime />
        <YamInlineText />
      </div>
      <div className="dial-info left">
        <div className="label">🔋</div>
        <div className="value">{typeof battery === 'number' ? `${battery}%` : '—'}</div>
        {!battery && (
          <div className="value small" title="Tap to set battery override" onClick={() => {
            const input = prompt('Enter battery percent (0-100)')
            if (input === null) return
            try {
              localStorage.setItem('batteryOverride', input)
              window.dispatchEvent(new Event('battery:override'))
            } catch {}
          }}>Set</div>
        )}
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
      {/* quote moved to TopBar */}
    </div>
  )
}


