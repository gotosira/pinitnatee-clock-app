import { useMemo } from 'react'
import DigitalTime from './DigitalTime'
import YamInlineText from './YamInline'
import { useCurrentLocation } from '../hooks/useLocation'
import { useTemperature } from '../hooks/useTemperature'
import { weatherEmoji } from '../utils/weather'
import { useTime } from '../state/time'

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export default function SimpleInterface() {
  const { now } = useTime()
  const geo = useCurrentLocation()
  const temp = useTemperature()
  const dateText = useMemo(() => {
    const m = now.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    return { day: DAY_NAMES[now.getDay()], d: now.getDate(), m, y: now.getFullYear() }
  }, [now.getFullYear(), now.getMonth(), now.getDate(), now.getDay()])
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



