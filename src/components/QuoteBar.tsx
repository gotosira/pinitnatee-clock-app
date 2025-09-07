import { useEffect, useRef, useState } from 'react'

type Quote = { text: string; author?: string }

const fallbackQuotes: Quote[] = [
  { text: 'You cannot start the next chapter of your life if you keep re-reading the last one.' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' }
]

export function QuoteBar() {
  const [quote, setQuote] = useState<Quote>(fallbackQuotes[0])
  const loadedRef = useRef(false)

  useEffect(() => {
    async function load() {
      try {
        const apiKey = import.meta.env.VITE_API_NINJAS_KEY as string | undefined
        // try localStorage cache within 24h
        try {
          const cachedStr = localStorage.getItem('quoteCache')
          if (cachedStr) {
            const { quote: q, ts } = JSON.parse(cachedStr)
            if (q?.text && Date.now() - (ts as number) < 24 * 60 * 60 * 1000) {
              setQuote(q)
              loadedRef.current = true
              return
            }
          }
        } catch {}
        if (apiKey && !(window as any).__quoteLoaded) {
          const url = `https://api.api-ninjas.com/v1/quotes?category=success&limit=1`
          let res: Response | null = null
          let attempt = 0
          let delay = 500
          while (attempt < 2) {
            try {
              const ctrl = new AbortController()
              const to = window.setTimeout(() => ctrl.abort(), 6000)
              res = await fetch(url, { headers: { 'X-Api-Key': apiKey }, signal: ctrl.signal })
              window.clearTimeout(to)
              if (res.ok) break
            } catch {}
            await new Promise(r => setTimeout(r, delay))
            delay *= 2
            attempt++
          }
          if (res && res.ok) {
            const arr = await res.json()
            if (Array.isArray(arr) && arr.length > 0 && arr[0].quote) {
              const q = { text: arr[0].quote, author: arr[0].author }
              ;(window as any).__quoteLoaded = q
              setQuote(q)
              try { localStorage.setItem('quoteCache', JSON.stringify({ quote: q, ts: Date.now() })) } catch {}
              loadedRef.current = true
              return
            }
          }
        }
        // fallback
        const cached = (window as any).__quoteLoaded
        if (cached) setQuote(cached)
        else {
          const idx = Math.floor(Math.random() * fallbackQuotes.length)
          const q = fallbackQuotes[idx]
          ;(window as any).__quoteLoaded = q
          setQuote(q)
        }
        loadedRef.current = true
      } catch {
        const cached = (window as any).__quoteLoaded
        if (cached) setQuote(cached)
        else {
          const idx = Math.floor(Math.random() * fallbackQuotes.length)
          const q = fallbackQuotes[idx]
          ;(window as any).__quoteLoaded = q
          setQuote(q)
        }
        loadedRef.current = true
      }
    }
    if (!loadedRef.current) load()
  }, [])

  return (
    <>
      <span className="mark">“</span>
      <span>{quote.text}</span>
      <span className="mark">”</span>
      {quote.author && <span className="author"> — {quote.author}</span>}
    </>
  )
}

export default QuoteBar


