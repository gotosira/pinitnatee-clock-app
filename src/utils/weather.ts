export function weatherEmoji(code: number | null): string {
  if (code === null || code === undefined) return '⛅'
  if ([0].includes(code)) return '☀️'
  if ([1].includes(code)) return '🌤️'
  if ([2].includes(code)) return '⛅'
  if ([3].includes(code)) return '☁️'
  if ([45,48].includes(code)) return '🌫️'
  if ([51,53,55,56,57].includes(code)) return '🌦️'
  if ([61,63,65,80,81,82].includes(code)) return '🌧️'
  if ([71,73,75,77,85,86].includes(code)) return '🌨️'
  if ([95,96,99].includes(code)) return '⛈️'
  return '⛅'
}


