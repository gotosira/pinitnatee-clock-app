import { useMemo } from 'react'
import DigitalTime from './DigitalTime'
import YamInlineText from './YamInline'
import { useCurrentLocation } from '../hooks/useLocation'
import { useTemperature } from '../hooks/useTemperature'
import { weatherEmoji } from '../utils/weather'

export default function SimpleInterface() {
  const geo = useCurrentLocation()
  const temp = useTemperature()
  const dateText = useMemo(() => {
    const now = new Date()
    const dayNames = ['SUN','MON','TUE','WED','THU','FRI','SAT']
    const m = now.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    const d = now.getDate()
    const day = dayNames[now.getDay()]
    const y = now.getFullYear()
    return { day, d, m, y }
  }, [])
  return (
    <div className="simple-ui" style={{display:'grid', gap:12, placeItems:'center'}}>
      <DigitalTime />
      <YamInlineText />
      <div className="simple-date">{dateText.day} {dateText.d} {dateText.m} {dateText.y}</div>
      <div className="simple-meta">
        <span className="loc">{geo?.name ? geo.name : geo ? `${geo.lat.toFixed(2)}, ${geo.lon.toFixed(2)}` : '—'}</span>
        {typeof geo?.elevationM === 'number' && <span className="sep">|</span>}
        {typeof geo?.elevationM === 'number' && <span className="elev">⬆️ {Math.round(geo!.elevationM!)} m</span>}
        <span className="sep">|</span>
        <span className="wx">{weatherEmoji(temp.code)} {temp.value === null ? '—' : `${Math.round(temp.value)}°${temp.unit}`}</span>
      </div>
    </div>
  )
}



