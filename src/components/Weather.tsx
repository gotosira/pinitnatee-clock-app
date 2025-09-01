import { useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

type WeatherData = {
  temperatureC: number
  description: string
  location: string
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
    const res = await fetch(url)
    const json = await res.json()
    const code = json.current.weather_code as number
    const description = weatherCodeToText(code)
    return {
      temperatureC: json.current.temperature_2m as number,
      description,
      location: ''
    }
  } catch {
    return { temperatureC: 0, description: '—', location: '' }
  }
}

function weatherCodeToText(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    61: 'Rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Snow',
    80: 'Rain showers',
    95: 'Thunderstorm'
  }
  return map[code] || '—'
}

export function Weather() {
  const [data, setData] = useState<WeatherData | null>(null)
  const [unit, setUnit] = useLocalStorage<'C' | 'F'>('tempUnit', 'C')

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const w = await fetchWeather(latitude, longitude)
        setData(w)
      },
      () => {
        // fallback: Bangkok
        fetchWeather(13.7563, 100.5018).then(setData)
      },
      { timeout: 5000 }
    )
  }, [])

  if (!data) {
    return <div className="weather">—</div>
  }

  const temp = unit === 'C' ? data.temperatureC : data.temperatureC * 9/5 + 32

  return (
    <div className="weather">
      <button className="ghost small" onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}>
        {unit}
      </button>
      <span>{Math.round(temp)}°</span>
      <span className="sep">|</span>
      <span>{data.description}</span>
    </div>
  )
}

export default Weather


