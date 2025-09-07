export async function fetchRandomUnsplashUrl(keywords?: string[]): Promise<string | null> {
  try {
    // short-circuit if we already detected auth failure earlier (session) or persisted
    if ((window as any).__unsplashDisabled || isUnsplashTemporarilyDisabled()) return null
    const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined
    if (!accessKey) return null

    const query = encodeURIComponent(
      (keywords && keywords.length ? keywords : ['nature', 'landscape', 'forest', 'river']).join(',')
    )
    const api = `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&content_filter=high&count=1`

    const res = await fetch(api, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1'
      }
    })

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        ;(window as any).__unsplashDisabled = true
        try {
          localStorage.setItem('unsplashDisabledUntil', String(Date.now() + 6 * 60 * 60 * 1000))
        } catch {}
      }
      return null
    }
    const data = await res.json()
    const item = Array.isArray(data) ? data[0] : data
    if (!item || !item.urls) return null

    const raw: string = item.urls.raw || item.urls.full || item.urls.regular
    const targetWidth = Math.max(1600, window.innerWidth)
    const targetHeight = Math.max(900, window.innerHeight)
    const sep = raw.includes('?') ? '&' : '?'
    const composed = `${raw}${sep}w=${targetWidth}&h=${targetHeight}&fit=crop&q=80&auto=format&ts=${Date.now()}`
    return composed
  } catch {
    return null
  }
}

export function isUnsplashTemporarilyDisabled(): boolean {
  try {
    const s = localStorage.getItem('unsplashDisabledUntil')
    if (!s) return false
    const until = Number(s)
    return Number.isFinite(until) && until > Date.now()
  } catch {
    return false
  }
}


