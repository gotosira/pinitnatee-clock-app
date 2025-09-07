// Fetch a free meditation/ambient track from Archive.org (no API key)
// Strategy: advanced search for audio items, then fetch metadata to pick an mp3

async function fetchJson(url: string, timeoutMs = 7000): Promise<any | null> {
  try {
    const ctrl = new AbortController()
    const to = setTimeout(() => ctrl.abort(), timeoutMs)
    const res = await fetch(url, { signal: ctrl.signal })
    clearTimeout(to)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function timeOfDayQuery(now = new Date()): string {
  const h = now.getHours()
  if (h >= 5 && h < 11) return 'meditation dawn birdsong calm'
  if (h >= 11 && h < 17) return 'ambient meditation ocean waves'
  if (h >= 17 && h < 21) return 'meditation ambient evening chill'
  return 'meditation night ambient rain'
}

export async function fetchMeditationTrack(): Promise<string | null> {
  // Curated query by time-of-day
  const baseQ = timeOfDayQuery()
  const q = encodeURIComponent(`${baseQ} AND mediatype:(audio)`)
  const fields = ['identifier']
  const rows = 20
  const searchUrl = `https://archive.org/advancedsearch.php?q=${q}&output=json&rows=${rows}&fl[]=${fields.join('&fl[]=')}`
  const data = await fetchJson(searchUrl)
  const identifiers: string[] = data?.response?.docs?.map((d: any) => d.identifier).filter(Boolean) || []
  // Randomize pick for variety
  const order = identifiers.sort(() => Math.random() - 0.5)
  for (const id of order) {
    const meta = await fetchJson(`https://archive.org/metadata/${encodeURIComponent(id)}`)
    const files: any[] = meta?.files || []
    // Prefer mp3 for widest compatibility (iOS Safari)
    const mp3 = files.find((f) => typeof f.name === 'string' && f.name.toLowerCase().endsWith('.mp3'))
    if (mp3) {
      const url = `https://archive.org/download/${encodeURIComponent(id)}/${encodeURIComponent(mp3.name)}`
      return url
    }
  }
  // Curated static list (mix of Archive and Wikimedia; we will still attempt playback gracefully)
  const curatedFallbacks: string[] = [
    // Nature/relax ambience (rain, river, forest) under CC/PD
    'https://archive.org/download/rain-and-thunder-ambient/Rain%20and%20Thunder%20-%2001.mp3',
    'https://archive.org/download/relaxing-nature-sounds-collection/Forest%20Stream%20-%2001.mp3',
    'https://archive.org/download/ocean-waves-relaxation/Ocean%20Waves%20-%2001.mp3',
    // Wikimedia CC0 ambience (ogg)
    'https://upload.wikimedia.org/wikipedia/commons/7/7e/Rain_on_a_window.ogg'
  ]
  return curatedFallbacks.find(Boolean) || null
}

export async function fetchNextMeditationTrack(): Promise<string | null> {
  return fetchMeditationTrack()
}


