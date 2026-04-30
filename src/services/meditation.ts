// Fetch a free meditation/ambient track from Archive.org (no API key)
// Strategy: advanced search for audio items, then fetch metadata to pick an mp3

type ArchiveSearchResponse = {
  response?: {
    docs?: Array<{ identifier?: string }>
  }
}

type ArchiveFile = {
  name?: string
}

type ArchiveMetadata = {
  files?: ArchiveFile[]
}

const FETCH_TIMEOUT_MS = 7000

async function fetchJson<T>(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<T | null> {
  const ctrl = new AbortController()
  const to = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch (err) {
    console.warn('[meditation] request failed', url, err)
    return null
  } finally {
    clearTimeout(to)
  }
}

function timeOfDayQuery(now = new Date()): string {
  const h = now.getHours()
  if (h >= 5 && h < 11) return 'meditation dawn birdsong calm'
  if (h >= 11 && h < 17) return 'ambient meditation ocean waves'
  if (h >= 17 && h < 21) return 'meditation ambient evening chill'
  return 'meditation night ambient rain'
}

const CURATED_FALLBACKS: string[] = [
  'https://archive.org/download/rain-and-thunder-ambient/Rain%20and%20Thunder%20-%2001.mp3',
  'https://archive.org/download/relaxing-nature-sounds-collection/Forest%20Stream%20-%2001.mp3',
  'https://archive.org/download/ocean-waves-relaxation/Ocean%20Waves%20-%2001.mp3',
  'https://upload.wikimedia.org/wikipedia/commons/7/7e/Rain_on_a_window.ogg',
]

export async function fetchMeditationTrack(): Promise<string | null> {
  const baseQ = timeOfDayQuery()
  const q = encodeURIComponent(`${baseQ} AND mediatype:(audio)`)
  const rows = 20
  const searchUrl = `https://archive.org/advancedsearch.php?q=${q}&output=json&rows=${rows}&fl[]=identifier`

  const data = await fetchJson<ArchiveSearchResponse>(searchUrl)
  const identifiers = data?.response?.docs?.map((d) => d.identifier).filter((s): s is string => Boolean(s)) ?? []
  // Randomize pick for variety
  const order = identifiers.slice().sort(() => Math.random() - 0.5)

  for (const id of order) {
    const meta = await fetchJson<ArchiveMetadata>(`https://archive.org/metadata/${encodeURIComponent(id)}`)
    const files = meta?.files ?? []
    // Prefer mp3 for widest compatibility (iOS Safari)
    const mp3 = files.find((f) => typeof f.name === 'string' && f.name.toLowerCase().endsWith('.mp3'))
    if (mp3?.name) {
      return `https://archive.org/download/${encodeURIComponent(id)}/${encodeURIComponent(mp3.name)}`
    }
  }

  return CURATED_FALLBACKS[Math.floor(Math.random() * CURATED_FALLBACKS.length)] ?? null
}

export async function fetchNextMeditationTrack(): Promise<string | null> {
  return fetchMeditationTrack()
}
