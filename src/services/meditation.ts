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

export async function fetchMeditationTrack(): Promise<string | null> {
  // narrow search to likely ambient sets
  const q = encodeURIComponent('meditation OR ambient AND mediatype:(audio)')
  const fields = ['identifier']
  const searchUrl = `https://archive.org/advancedsearch.php?q=${q}&output=json&rows=12&fl[]=${fields.join('&fl[]=')}`
  const data = await fetchJson(searchUrl)
  const identifiers: string[] = data?.response?.docs?.map((d: any) => d.identifier).filter(Boolean) || []
  for (const id of identifiers) {
    const meta = await fetchJson(`https://archive.org/metadata/${encodeURIComponent(id)}`)
    const files: any[] = meta?.files || []
    const mp3 = files.find((f) => typeof f.name === 'string' && f.name.toLowerCase().endsWith('.mp3'))
    if (mp3) {
      const url = `https://archive.org/download/${encodeURIComponent(id)}/${encodeURIComponent(mp3.name)}`
      return url
    }
  }
  // Fallback: Wikimedia Commons CC0 ambient clip
  const fallbacks = [
    // Short ambient loops (royalty-free)
    'https://upload.wikimedia.org/wikipedia/commons/3/3a/Celestial_Ambience.ogg',
  ]
  return fallbacks[0] || null
}


