export function timeOfDayKeywords(date = new Date()): string[] {
  const h = date.getHours()
  if (h >= 5 && h < 8) return ['dawn', 'sunrise']
  if (h >= 8 && h < 11) return ['morning light']
  if (h >= 11 && h < 16) return ['midday', 'afternoon']
  if (h >= 16 && h < 18) return ['golden hour', 'sunset']
  if (h >= 18 && h < 20) return ['dusk', 'twilight']
  return ['night', 'city lights']
}


