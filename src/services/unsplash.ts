export async function fetchRandomUnsplashUrl(keywords?: string[]): Promise<string | null> {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined
  if (!accessKey) return null

  const query = encodeURIComponent(
    (keywords && keywords.length ? keywords : ['nature', 'landscape', 'forest', 'river']).join(',')
  )
  const api = `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&content_filter=high&count=1&client_id=${accessKey}`

  const res = await fetch(api, {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      'Accept-Version': 'v1'
    }
  })

  if (!res.ok) return null
  const data = await res.json()
  const item = Array.isArray(data) ? data[0] : data
  if (!item || !item.urls) return null

  const raw: string = item.urls.raw || item.urls.full || item.urls.regular
  const targetWidth = Math.max(1600, window.innerWidth)
  const targetHeight = Math.max(900, window.innerHeight)
  const sep = raw.includes('?') ? '&' : '?'
  const composed = `${raw}${sep}w=${targetWidth}&h=${targetHeight}&fit=crop&q=80&auto=format&ts=${Date.now()}`
  return composed
}


