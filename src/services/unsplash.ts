type UnsplashUrls = {
  raw?: string
  full?: string
  regular?: string
}

type UnsplashPhoto = {
  urls?: UnsplashUrls
}

const DISABLED_TTL_MS = 6 * 60 * 60 * 1000 // 6h

let sessionDisabled = false

export async function fetchRandomUnsplashUrl(keywords?: string[]): Promise<string | null> {
  if (sessionDisabled || isUnsplashTemporarilyDisabled()) return null
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined
  if (!accessKey) return null

  const query = encodeURIComponent(
    (keywords && keywords.length ? keywords : ['nature', 'landscape', 'forest', 'river']).join(','),
  )
  const api = `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&content_filter=high&count=1`

  try {
    const res = await fetch(api, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    })

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        sessionDisabled = true
        try {
          localStorage.setItem('unsplashDisabledUntil', String(Date.now() + DISABLED_TTL_MS))
        } catch {
          // localStorage disabled — session-level flag still applies
        }
      }
      return null
    }

    const data: UnsplashPhoto | UnsplashPhoto[] = await res.json()
    const item = Array.isArray(data) ? data[0] : data
    if (!item?.urls) return null

    const raw = item.urls.raw || item.urls.full || item.urls.regular
    if (!raw) return null

    const targetWidth = Math.max(1600, window.innerWidth)
    const targetHeight = Math.max(900, window.innerHeight)
    const sep = raw.includes('?') ? '&' : '?'
    return `${raw}${sep}w=${targetWidth}&h=${targetHeight}&fit=crop&q=80&auto=format&ts=${Date.now()}`
  } catch (err) {
    console.warn('[unsplash] fetch failed', err)
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
