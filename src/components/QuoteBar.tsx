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
        // const categories = pickCategories()
        if (apiKey && !(window as any).__quoteLoaded) {
          // Try success only (most reliable), otherwise fallback immediately
          const url = `https://api.api-ninjas.com/v1/quotes?category=success&limit=1`
          const res = await fetch(url, { headers: { 'X-Api-Key': apiKey } })
          if (res.ok) {
            const arr = await res.json()
            if (Array.isArray(arr) && arr.length > 0 && arr[0].quote) {
              const q = { text: arr[0].quote, author: arr[0].author }
              ;(window as any).__quoteLoaded = q
              setQuote(q)
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


